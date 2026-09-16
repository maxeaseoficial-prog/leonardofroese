from __future__ import annotations

import base64
import io
import json
import re
import shutil
import time
import unicodedata
from collections import deque
from pathlib import Path
from urllib.parse import urljoin

import requests
from PIL import Image
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

ROOT = Path.cwd()
OUT = ROOT / "public/client-logos"
OUT.mkdir(parents=True, exist_ok=True)

# The homepage was redesigned and still contains a few stale WordPress image
# elements. The legacy clients page is kept as a second source because it has
# the original client-logo media library. We only persist the image bytes that
# actually load successfully; the final site never hotlinks either page.
REFERENCE_PAGES = [
    "https://calibergestao.com.br/",
    "https://calibergestao.com.br/clientes/",
]

TARGETS = [
    ("Claro", "claro", ["claro"]),
    ("NET", "net", ["net", "net-1"]),
    ("Megasom", "megasom", ["logo megasom sem fundo", "megasom"]),
    ("Leo Madeiras", "leo-madeiras", ["leo madeiras", "leo-madeiras"]),
    ("Procria", "procria", ["procria"]),
    ("LEGO", "lego", ["lego"]),
    ("Maxvinil", "maxvinil", ["maxvinil"]),
    ("Tupperware", "tupperware", ["tupperware"]),
    ("Águas de Sorriso", "aguas-de-sorriso", ["aguas de sorriso", "aguas-de-sorriso"]),
    ("Aliança", "alianca", ["alianca", "aliança"]),
    ("Campo Solar", "campo-solar", ["campo solar", "campo-solar"]),
    ("Cobertura Imasa", "cobertura-imasa", ["cobertura imasa", "cobertura-imasa"]),
    ("Eletricidade Paraense", "eletricidade-paraense", ["eletricidade paraense", "eletricidade-paraense"]),
    ("Fatex", "fatex", ["fatex"]),
    ("Frota", "frota", ["frota"]),
    ("Octech", "octech", ["octech", "oc tech"]),
    ("Pantanal", "pantanal", ["pantanal"]),
    ("Tempermat", "tempermat", ["tempermat"]),
    ("Prime Lente", "prime-lente", ["prime lente logo gradual", "prime lente", "prime-lente"]),
    ("Trevo", "trevo", ["trevo"]),
]

# Used only when the Cáliber copy of the same brand is currently unavailable.
# These are still real brand assets and are downloaded once into the repo.
FALLBACK_URLS = {
    "net": ["https://logospng.org/download/net/logo-net-2048.png"],
    "prime-lente": ["https://www.reachoptic.com/assets/images/products/1680522731prime_lenses.jpg"],
}


def normalize(value: str | None) -> str:
    value = unicodedata.normalize("NFKD", value or "")
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def describe_image(element, page_url: str) -> dict:
    attrs: dict[str, str] = {}
    for key in (
        "alt",
        "title",
        "aria-label",
        "src",
        "data-src",
        "data-lazy-src",
        "data-original",
        "srcset",
        "data-lazy-srcset",
        "class",
    ):
        attrs[key] = element.get_attribute(key) or ""
    attrs["currentSrc"] = element.get_property("currentSrc") or ""
    descriptor = normalize(" ".join(attrs.values()))
    return {
        "page_url": page_url,
        "attrs": attrs,
        "descriptor": descriptor,
        "natural_width": int(element.get_property("naturalWidth") or 0),
        "natural_height": int(element.get_property("naturalHeight") or 0),
    }


def candidate_score(record: dict, aliases: list[str]) -> int:
    attrs = record["attrs"]
    alt = normalize(attrs.get("alt"))
    title = normalize(attrs.get("title"))
    descriptor = record["descriptor"]
    best = 0
    for alias in aliases:
        needle = normalize(alias)
        if not needle:
            continue
        if alt == needle:
            best = max(best, 120)
        elif needle in alt:
            best = max(best, 105)
        if title == needle:
            best = max(best, 100)
        elif needle in title:
            best = max(best, 90)
        if needle in descriptor:
            best = max(best, 60)
    return best


def candidate_urls(record: dict) -> list[str]:
    attrs = record["attrs"]
    page_url = record["page_url"]
    values: list[str] = []
    for key in ("currentSrc", "data-lazy-src", "data-src", "data-original", "src"):
        value = (attrs.get(key) or "").strip()
        if value and not value.startswith("data:"):
            values.append(urljoin(page_url, value))
    for key in ("data-lazy-srcset", "srcset"):
        for part in (attrs.get(key) or "").split(","):
            part = part.strip()
            if part:
                values.append(urljoin(page_url, part.split()[0]))

    expanded: list[str] = []
    for url in values:
        expanded.append(url)
        clean = url.split("?", 1)[0]
        if clean != url:
            expanded.append(clean)
        if "wp.com/calibergestao.com.br/" in url:
            path = url.split("/calibergestao.com.br/", 1)[1].split("?", 1)[0]
            expanded.append("https://calibergestao.com.br/" + path)

    result: list[str] = []
    seen: set[str] = set()
    for url in expanded:
        if url not in seen:
            seen.add(url)
            result.append(url)
    return result


def browser() -> webdriver.Chrome:
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-gpu")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--hide-scrollbars")
    options.set_capability("goog:loggingPrefs", {"performance": "ALL"})
    driver = webdriver.Chrome(options=options)
    driver.execute_cdp_cmd(
        "Network.enable",
        {"maxTotalBufferSize": 120_000_000, "maxResourceBufferSize": 12_000_000},
    )
    return driver


def collect_response_bodies(driver) -> dict[str, bytes]:
    responses: dict[str, tuple[str, str]] = {}
    for entry in driver.get_log("performance"):
        try:
            message = json.loads(entry["message"])["message"]
        except Exception:
            continue
        if message.get("method") != "Network.responseReceived":
            continue
        params = message.get("params", {})
        response = params.get("response", {})
        request_id = params.get("requestId")
        url = response.get("url") or ""
        mime = response.get("mimeType") or ""
        status = int(response.get("status") or 0)
        if request_id and status == 200 and (mime.startswith("image/") or "wp-content/uploads" in url or "assets-v1" in url):
            responses[url] = (request_id, mime)

    bodies: dict[str, bytes] = {}
    for url, (request_id, _mime) in responses.items():
        try:
            body = driver.execute_cdp_cmd("Network.getResponseBody", {"requestId": request_id})
            data = body.get("body", "")
            raw = base64.b64decode(data) if body.get("base64Encoded") else data.encode("latin1", errors="ignore")
            if raw:
                bodies[url] = raw
        except Exception:
            pass
    return bodies


def discover() -> tuple[dict[str, list[dict]], dict[str, bytes], str, list[dict]]:
    driver = browser()
    all_records: list[dict] = []
    response_bodies: dict[str, bytes] = {}
    cookies_by_name: dict[tuple[str, str], dict] = {}
    user_agent = "Mozilla/5.0"
    try:
        for page_url in REFERENCE_PAGES:
            driver.get(page_url)
            time.sleep(1.5)
            height = int(driver.execute_script("return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)"))
            for y in range(0, height + 800, 600):
                driver.execute_script("window.scrollTo(0, arguments[0])", y)
                time.sleep(0.14)
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight)")
            time.sleep(1.8)

            user_agent = driver.execute_script("return navigator.userAgent") or user_agent
            for element in driver.find_elements(By.TAG_NAME, "img"):
                try:
                    all_records.append(describe_image(element, page_url))
                except Exception:
                    continue
            response_bodies.update(collect_response_bodies(driver))
            for cookie in driver.get_cookies():
                cookies_by_name[(cookie.get("domain") or "", cookie.get("name") or "")] = cookie
    finally:
        driver.quit()

    matches: dict[str, list[dict]] = {}
    for display, slug, aliases in TARGETS:
        ranked: list[tuple[int, int, int, dict]] = []
        for record in all_records:
            score = candidate_score(record, aliases)
            if score:
                loaded = 1 if record["natural_width"] > 0 and record["natural_height"] > 0 else 0
                area = record["natural_width"] * record["natural_height"]
                ranked.append((loaded, score, area, record))
        ranked.sort(key=lambda item: (item[0], item[1], item[2]), reverse=True)
        if not ranked:
            matches[slug] = []
            print(f"DISCOVER {display}: no DOM candidate")
            continue
        matches[slug] = [item[3] for item in ranked]
        best = ranked[0]
        print(
            f"DISCOVER {display}: loaded={best[0]} score={best[1]} natural="
            f"{best[3]['natural_width']}x{best[3]['natural_height']} "
            f"src={best[3]['attrs'].get('currentSrc')!r} page={best[3]['page_url']}"
        )
    return matches, response_bodies, user_agent, list(cookies_by_name.values())


def build_session(user_agent: str, cookies: list[dict]) -> requests.Session:
    session = requests.Session()
    session.headers.update(
        {
            "User-Agent": user_agent,
            "Referer": REFERENCE_PAGES[0],
            "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        }
    )
    for cookie in cookies:
        try:
            session.cookies.set(cookie["name"], cookie["value"], domain=cookie.get("domain"))
        except Exception:
            pass
    return session


def fetch_logo(
    display: str,
    slug: str,
    records: list[dict],
    response_bodies: dict[str, bytes],
    session: requests.Session,
) -> tuple[bytes, str]:
    urls: list[str] = []
    seen: set[str] = set()
    for record in records:
        for url in candidate_urls(record):
            if url not in seen:
                seen.add(url)
                urls.append(url)
    for url in FALLBACK_URLS.get(slug, []):
        if url not in seen:
            seen.add(url)
            urls.append(url)

    # Prefer original bytes already loaded successfully by Chromium.
    for url in urls:
        if url in response_bodies:
            return response_bodies[url], url
        clean = url.split("?", 1)[0]
        for loaded_url, raw in response_bodies.items():
            if loaded_url.split("?", 1)[0] == clean:
                return raw, loaded_url

    errors: list[str] = []
    for url in urls:
        try:
            response = session.get(url, timeout=30)
            response.raise_for_status()
            if len(response.content) < 100:
                raise RuntimeError(f"response too small ({len(response.content)} bytes)")
            return response.content, url
        except Exception as exc:
            errors.append(f"{url}: {exc}")
    raise RuntimeError(f"Could not fetch {display}. Attempts: {' | '.join(errors[-12:])}")


def color_distance(a, b) -> float:
    return ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2) ** 0.5


def remove_edge_background(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    width, height = rgba.size
    pixels = rgba.load()
    border = []
    for x in range(width):
        border.extend((pixels[x, 0], pixels[x, height - 1]))
    for y in range(height):
        border.extend((pixels[0, y], pixels[width - 1, y]))

    if sum(1 for p in border if p[3] <= 20) / max(1, len(border)) >= 0.65:
        return rgba
    opaque = [p for p in border if p[3] >= 180]
    if len(opaque) < 12:
        return rgba

    channels = list(zip(*[(p[0], p[1], p[2]) for p in opaque]))
    background = tuple(sorted(channel)[len(channel) // 2] for channel in channels)
    deviations = sorted(color_distance(pixel, background) for pixel in opaque)
    p90 = deviations[min(len(deviations) - 1, int(len(deviations) * 0.90))]
    neutral_light = max(background) - min(background) <= 32 and min(background) >= 170
    uniform = p90 <= 30
    if not (neutral_light or uniform):
        return rgba

    threshold = 70 if neutral_light else 42
    seen = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def add(x: int, y: int) -> None:
        idx = y * width + x
        if seen[idx]:
            return
        seen[idx] = 1
        pixel = pixels[x, y]
        if pixel[3] <= 25 or color_distance(pixel, background) <= threshold:
            queue.append((x, y))

    for x in range(width):
        add(x, 0)
        add(x, height - 1)
    for y in range(height):
        add(0, y)
        add(width - 1, y)
    while queue:
        x, y = queue.popleft()
        r, g, b, _ = pixels[x, y]
        pixels[x, y] = (r, g, b, 0)
        if x > 0:
            add(x - 1, y)
        if x + 1 < width:
            add(x + 1, y)
        if y > 0:
            add(x, y - 1)
        if y + 1 < height:
            add(x, y + 1)
    return rgba


def save_png(raw: bytes, destination: Path) -> None:
    try:
        image = Image.open(io.BytesIO(raw)).convert("RGBA")
        image.load()
    except Exception as exc:
        if b"<svg" in raw[:1500].lower():
            raise RuntimeError(f"SVG source is not supported for {destination.name}: {exc}") from exc
        raise
    if image.width > 1400 or image.height > 900:
        image.thumbnail((1400, 900), Image.Resampling.LANCZOS)
    image = remove_edge_background(image)
    bbox = image.getchannel("A").getbbox()
    if not bbox:
        raise RuntimeError(f"No visible pixels for {destination.name}")
    image = image.crop(bbox)
    pad = max(10, round(max(image.size) * 0.045))
    canvas = Image.new("RGBA", (image.width + 2 * pad, image.height + 2 * pad), (0, 0, 0, 0))
    canvas.alpha_composite(image, (pad, pad))
    canvas.save(destination, "PNG", optimize=True)

    verify = Image.open(destination).convert("RGBA")
    amin, amax = verify.getchannel("A").getextrema()
    corners = [
        verify.getpixel((0, 0))[3],
        verify.getpixel((verify.width - 1, 0))[3],
        verify.getpixel((0, verify.height - 1))[3],
        verify.getpixel((verify.width - 1, verify.height - 1))[3],
    ]
    if amin != 0 or amax == 0 or any(corners):
        raise RuntimeError(f"Transparency validation failed for {destination.name}: alpha={amin}-{amax}, corners={corners}")
    print(f"ASSET {destination.name}: {verify.width}x{verify.height} alpha={amin}-{amax} corners={corners}")


def generate_component() -> None:
    items = "\n".join(
        f'  {{ name: "{display}", src: "/client-logos/{slug}.png" }},'
        for display, slug, _aliases in TARGETS
    )
    component = f'''import "./client-logos.css";

const clientLogos = [
{items}
] as const;

function LogoGroup({{ clone = false }}: {{ clone?: boolean }}) {{
  return (
    <div className="client-logos-group" aria-hidden={{clone || undefined}} data-clone={{clone ? "true" : undefined}}>
      {{clientLogos.map((logo) => (
        <div className="client-logo-item" key={{`${{clone ? "clone-" : ""}}${{logo.src}}`}}>
          <img src={{logo.src}} alt={{clone ? "" : logo.name}} aria-hidden={{clone || undefined}} decoding="async" draggable={{false}} />
        </div>
      ))}}
    </div>
  );
}}

export function ClientLogos({{ className = "" }}: {{ className?: string }}) {{
  return (
    <section className={{`client-logos ${{className}}`}} aria-label="Parceiros e clientes da Cáliber">
      <div className="client-logos-heading">
        <span>Algumas das empresas que confiam no nosso trabalho</span>
        <h3>Parceiros &amp; Clientes</h3>
      </div>
      <div className="client-logos-viewport">
        <div className="client-logos-track">
          <LogoGroup />
          <LogoGroup clone />
        </div>
      </div>
    </section>
  );
}}
'''
    (ROOT / "src/components/site/client-logos.tsx").write_text(component, encoding="utf-8")

    css = '''.client-logos {
  position: relative;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  background: transparent;
}
.client-logos-heading { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 0 20px; }
.client-logos-heading > span { color: hsl(var(--primary)); font-size: 11px; font-weight: 650; letter-spacing: .22em; line-height: 1.55; text-transform: uppercase; }
.client-logos-heading h3 { max-width: 760px; margin: 14px 0 0; color: hsl(var(--foreground)); font-size: clamp(34px,4vw,56px); line-height: 1; font-weight: 750; letter-spacing: -.035em; text-wrap: balance; }
.client-logos-viewport { position: relative; width: 100%; max-width: 100%; min-width: 0; margin-top: 38px; overflow: hidden; background: transparent; -webkit-mask-image: linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent); mask-image: linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent); }
.client-logos-track { display: flex; width: max-content; max-width: none; align-items: center; animation: client-logos-marquee 58s linear infinite; will-change: transform; }
.client-logos-group { display: flex; flex: 0 0 auto; align-items: center; gap: clamp(42px,4.5vw,76px); padding-right: clamp(42px,4.5vw,76px); }
.client-logo-item { display: flex; width: clamp(118px,12vw,176px); height: 78px; flex: 0 0 auto; align-items: center; justify-content: center; background: transparent; }
.client-logo-item img { display: block; width: auto; max-width: 100%; height: auto; max-height: 70px; object-fit: contain; background: transparent; user-select: none; }
@keyframes client-logos-marquee { from { transform: translate3d(-50%,0,0); } to { transform: translate3d(0,0,0); } }
@media (hover:hover) and (pointer:fine) { .client-logos-viewport:hover .client-logos-track { animation-play-state: paused; } }
@media (max-width:720px) {
  .client-logos-heading { padding-inline: 14px; }
  .client-logos-heading > span { max-width: 330px; font-size: 9px; letter-spacing: .16em; }
  .client-logos-heading h3 { max-width: 340px; margin-top: 12px; font-size: clamp(32px,10vw,42px); }
  .client-logos-viewport { margin-top: 28px; -webkit-mask-image: linear-gradient(90deg,transparent,#000 3%,#000 97%,transparent); mask-image: linear-gradient(90deg,transparent,#000 3%,#000 97%,transparent); }
  .client-logos-track { animation-duration: 50s; }
  .client-logos-group { gap: 30px; padding-right: 30px; }
  .client-logo-item { width: 112px; height: 62px; }
  .client-logo-item img { max-height: 54px; }
}
@media (prefers-reduced-motion:reduce) {
  .client-logos-viewport { overflow: hidden; -webkit-mask-image: none; mask-image: none; }
  .client-logos-track { width: 100%; max-width: 100%; animation: none; transform: none; will-change: auto; }
  .client-logos-group { width: 100%; flex-wrap: wrap; justify-content: center; gap: 28px 38px; padding-right: 0; }
  .client-logos-group[data-clone="true"] { display: none; }
}
'''
    (ROOT / "src/components/site/client-logos.css").write_text(css, encoding="utf-8")


matches, response_bodies, user_agent, cookies = discover()
session = build_session(user_agent, cookies)
expected: set[str] = set()
for display, slug, _aliases in TARGETS:
    raw, source_url = fetch_logo(display, slug, matches.get(slug, []), response_bodies, session)
    destination = OUT / f"{slug}.png"
    save_png(raw, destination)
    expected.add(destination.name)
    print(f"DONE {display}: {source_url} -> {destination.relative_to(ROOT)}")

for path in OUT.iterdir():
    if path.is_file() and path.name not in expected:
        path.unlink()

generate_component()

for obsolete in (
    ROOT / "src/assets/client-logo-transparent-webp-base64.ts",
    ROOT / "src/components/site/client-logos-local.ts",
    ROOT / "src/components/site/client-logos-strip-placeholder.txt",
):
    if obsolete.exists():
        obsolete.unlink()
chunks = ROOT / "src/assets/client-logo-strip"
if chunks.exists():
    shutil.rmtree(chunks)

print(f"Generated {len(TARGETS)} independent local transparent PNG logo assets.")
