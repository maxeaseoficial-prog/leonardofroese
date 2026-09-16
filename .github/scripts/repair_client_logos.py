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
from urllib.parse import urljoin, urlparse

import requests
from PIL import Image
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

ROOT = Path.cwd()
REFERENCE_URL = "https://calibergestao.com.br/"
OUT = ROOT / "public/client-logos"
OUT.mkdir(parents=True, exist_ok=True)

TARGETS = [
    ("Claro", "claro", ["claro"]),
    ("NET", "net", ["net"]),
    ("Megasom", "megasom", ["logo megasom sem fundo", "megasom"]),
    ("Leo Madeiras", "leo-madeiras", ["leo madeiras"]),
    ("Procria", "procria", ["procria"]),
    ("LEGO", "lego", ["lego"]),
    ("Maxvinil", "maxvinil", ["maxvinil"]),
    ("Tupperware", "tupperware", ["tupperware"]),
    ("Águas de Sorriso", "aguas-de-sorriso", ["aguas de sorriso", "águas de sorriso"]),
    ("Aliança", "alianca", ["alianca", "aliança"]),
    ("Campo Solar", "campo-solar", ["campo solar"]),
    ("Cobertura Imasa", "cobertura-imasa", ["cobertura imasa"]),
    ("Eletricidade Paraense", "eletricidade-paraense", ["eletricidade paraense"]),
    ("Fatex", "fatex", ["fatex"]),
    ("Frota", "frota", ["frota"]),
    ("Octech", "octech", ["octech", "oc tech"]),
    ("Pantanal", "pantanal", ["pantanal"]),
    ("Tempermat", "tempermat", ["tempermat"]),
    ("Prime Lente", "prime-lente", ["prime lente logo gradual", "prime lente"]),
    ("Trevo", "trevo", ["trevo"]),
]


def normalize(value: str | None) -> str:
    value = value or ""
    value = unicodedata.normalize("NFKD", value)
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    value = value.lower()
    return re.sub(r"[^a-z0-9]+", " ", value).strip()


def image_descriptor(element) -> tuple[str, dict[str, str]]:
    attrs = {}
    for key in (
        "alt",
        "title",
        "aria-label",
        "src",
        "currentSrc",
        "data-src",
        "data-lazy-src",
        "data-original",
        "srcset",
        "data-lazy-srcset",
        "class",
    ):
        if key == "currentSrc":
            value = element.get_property("currentSrc") or ""
        else:
            value = element.get_attribute(key) or ""
        attrs[key] = value
    descriptor = normalize(" ".join(attrs.values()))
    return descriptor, attrs


def score_candidate(descriptor: str, attrs: dict[str, str], aliases: list[str]) -> int:
    alt = normalize(attrs.get("alt"))
    title = normalize(attrs.get("title"))
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


def extract_candidate_urls(attrs: dict[str, str]) -> list[str]:
    values: list[str] = []
    for key in ("currentSrc", "data-lazy-src", "data-src", "data-original", "src"):
        value = (attrs.get(key) or "").strip()
        if value and not value.startswith("data:"):
            values.append(urljoin(REFERENCE_URL, value))

    for key in ("data-lazy-srcset", "srcset"):
        value = attrs.get(key) or ""
        for part in value.split(","):
            part = part.strip()
            if not part:
                continue
            values.append(urljoin(REFERENCE_URL, part.split()[0]))

    expanded: list[str] = []
    for url in values:
        expanded.append(url)
        clean = url.split("?", 1)[0]
        if clean != url:
            expanded.append(clean)
        if "wp.com/calibergestao.com.br/" in url:
            path = url.split("/calibergestao.com.br/", 1)[1].split("?", 1)[0]
            expanded.append("https://calibergestao.com.br/" + path)

    unique: list[str] = []
    seen = set()
    for url in expanded:
        if url in seen:
            continue
        seen.add(url)
        unique.append(url)
    return unique


def configure_browser():
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-gpu")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--hide-scrollbars")
    options.set_capability("goog:loggingPrefs", {"performance": "ALL"})
    driver = webdriver.Chrome(options=options)
    driver.execute_cdp_cmd("Network.enable", {"maxTotalBufferSize": 100_000_000, "maxResourceBufferSize": 10_000_000})
    return driver


def collect_loaded_response_bodies(driver) -> dict[str, bytes]:
    responses: dict[str, tuple[str, int, str]] = {}
    for entry in driver.get_log("performance"):
        try:
            message = json.loads(entry["message"])["message"]
        except Exception:
            continue
        if message.get("method") != "Network.responseReceived":
            continue
        params = message.get("params", {})
        response = params.get("response", {})
        url = response.get("url") or ""
        mime = response.get("mimeType") or ""
        status = int(response.get("status") or 0)
        request_id = params.get("requestId")
        if request_id and status == 200 and (mime.startswith("image/") or "wp-content/uploads" in url):
            responses[url] = (request_id, status, mime)

    bodies: dict[str, bytes] = {}
    for url, (request_id, _status, _mime) in responses.items():
        try:
            body = driver.execute_cdp_cmd("Network.getResponseBody", {"requestId": request_id})
            data = body.get("body", "")
            if body.get("base64Encoded"):
                raw = base64.b64decode(data)
            else:
                raw = data.encode("latin1", errors="ignore")
            if raw:
                bodies[url] = raw
        except Exception:
            pass
    return bodies


def browser_discover() -> tuple[dict[str, dict], dict[str, bytes], str, list[dict]]:
    driver = configure_browser()
    try:
        driver.get(REFERENCE_URL)
        time.sleep(1.5)
        height = int(driver.execute_script("return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)"))
        step = 700
        for y in range(0, height + step, step):
            driver.execute_script("window.scrollTo(0, arguments[0])", y)
            time.sleep(0.12)
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight)")
        time.sleep(2.0)

        user_agent = driver.execute_script("return navigator.userAgent")
        images = driver.find_elements(By.TAG_NAME, "img")
        records: list[dict] = []
        for element in images:
            try:
                descriptor, attrs = image_descriptor(element)
                natural_width = int(element.get_property("naturalWidth") or 0)
                natural_height = int(element.get_property("naturalHeight") or 0)
                records.append(
                    {
                        "element": element,
                        "descriptor": descriptor,
                        "attrs": attrs,
                        "natural_width": natural_width,
                        "natural_height": natural_height,
                    }
                )
            except Exception:
                continue

        chosen: dict[str, dict] = {}
        for display, slug, aliases in TARGETS:
            ranked = []
            for record in records:
                score = score_candidate(record["descriptor"], record["attrs"], aliases)
                if score:
                    ranked.append((score, record["natural_width"], record["natural_height"], record))
            ranked.sort(key=lambda item: (item[0], item[1] * item[2]), reverse=True)
            if not ranked:
                raise RuntimeError(f"No <img> candidate found for {display}")
            record = ranked[0][3]
            chosen[slug] = record
            print(
                f"DISCOVER {display}: score={ranked[0][0]} natural={record['natural_width']}x{record['natural_height']} "
                f"alt={record['attrs'].get('alt')!r} currentSrc={record['attrs'].get('currentSrc')!r}"
            )

        response_bodies = collect_loaded_response_bodies(driver)
        cookies = driver.get_cookies()
        return chosen, response_bodies, user_agent, cookies
    finally:
        driver.quit()


def fetch_bytes(
    display: str,
    attrs: dict[str, str],
    response_bodies: dict[str, bytes],
    user_agent: str,
    cookies: list[dict],
) -> tuple[bytes, str]:
    urls = extract_candidate_urls(attrs)
    if not urls:
        raise RuntimeError(f"No URL candidates found for {display}")

    # Prefer the exact body already loaded successfully by Chromium. This is the
    # original resource response, not a screenshot or recreated logo.
    for url in urls:
        if url in response_bodies:
            print(f"RESOURCE {display}: using Chromium response body {url}")
            return response_bodies[url], url
        clean = url.split("?", 1)[0]
        for loaded_url, raw in response_bodies.items():
            if loaded_url.split("?", 1)[0] == clean:
                print(f"RESOURCE {display}: using matching Chromium response body {loaded_url}")
                return raw, loaded_url

    session = requests.Session()
    session.headers.update(
        {
            "User-Agent": user_agent,
            "Referer": REFERENCE_URL,
            "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        }
    )
    for cookie in cookies:
        try:
            session.cookies.set(cookie["name"], cookie["value"], domain=cookie.get("domain"))
        except Exception:
            pass

    errors = []
    for url in urls:
        try:
            response = session.get(url, timeout=40)
            response.raise_for_status()
            content_type = response.headers.get("content-type", "")
            if not content_type.startswith("image/") and not url.lower().endswith((".png", ".jpg", ".jpeg", ".webp", ".svg")):
                raise RuntimeError(f"unexpected content-type {content_type}")
            if len(response.content) < 100:
                raise RuntimeError(f"response too small ({len(response.content)} bytes)")
            print(f"RESOURCE {display}: downloaded {url}")
            return response.content, url
        except Exception as exc:
            errors.append(f"{url}: {exc}")

    raise RuntimeError(f"Could not fetch {display}. Attempts: {' | '.join(errors[-10:])}")


def color_distance(a, b) -> float:
    return ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2) ** 0.5


def remove_edge_background(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    width, height = rgba.size
    pixels = rgba.load()

    border = []
    for x in range(width):
        border.append(pixels[x, 0])
        border.append(pixels[x, height - 1])
    for y in range(height):
        border.append(pixels[0, y])
        border.append(pixels[width - 1, y])

    transparent_share = sum(1 for pixel in border if pixel[3] <= 20) / max(1, len(border))
    if transparent_share >= 0.65:
        return rgba

    opaque = [pixel for pixel in border if pixel[3] >= 180]
    if len(opaque) < 12:
        return rgba

    channels = list(zip(*[(p[0], p[1], p[2]) for p in opaque]))
    background = tuple(sorted(channel)[len(channel) // 2] for channel in channels)
    deviations = sorted(color_distance(pixel, background) for pixel in opaque)
    p90 = deviations[min(len(deviations) - 1, int(len(deviations) * 0.90))]
    neutral_light = max(background) - min(background) <= 30 and min(background) >= 175
    uniform = p90 <= 32
    if not (neutral_light or uniform):
        return rgba

    threshold = 68 if neutral_light else 44
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
        r, g, b, _a = pixels[x, y]
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


def rasterize_and_save(raw: bytes, destination: Path) -> None:
    try:
        image = Image.open(io.BytesIO(raw)).convert("RGBA")
        image.load()
    except Exception as exc:
        if raw.lstrip().startswith(b"<svg") or b"<svg" in raw[:1000].lower():
            raise RuntimeError(
                f"SVG received for {destination.name}; current pipeline expects raster source. {exc}"
            ) from exc
        raise

    if image.width > 1200 or image.height > 700:
        image.thumbnail((1200, 700), Image.Resampling.LANCZOS)

    image = remove_edge_background(image)
    bbox = image.getchannel("A").getbbox()
    if not bbox:
        raise RuntimeError(f"No visible pixels for {destination.name}")
    image = image.crop(bbox)

    pad = max(10, round(max(image.size) * 0.045))
    canvas = Image.new("RGBA", (image.width + pad * 2, image.height + pad * 2), (0, 0, 0, 0))
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
        raise RuntimeError(
            f"Transparency validation failed for {destination.name}: alpha={amin}-{amax}, corners={corners}"
        )
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
    <div
      className="client-logos-group"
      aria-hidden={{clone || undefined}}
      data-clone={{clone ? "true" : undefined}}
    >
      {{clientLogos.map((logo) => (
        <div className="client-logo-item" key={{`${{clone ? "clone-" : ""}}${{logo.src}}`}}>
          <img
            src={{logo.src}}
            alt={{clone ? "" : logo.name}}
            aria-hidden={{clone || undefined}}
            decoding="async"
            draggable={{false}}
          />
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

    css = r'''.client-logos {
  position: relative;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  background: transparent;
}

.client-logos-heading {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0 20px;
}

.client-logos-heading > span {
  color: hsl(var(--primary));
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.22em;
  line-height: 1.55;
  text-transform: uppercase;
}

.client-logos-heading h3 {
  max-width: 760px;
  margin: 14px 0 0;
  color: hsl(var(--foreground));
  font-size: clamp(34px, 4vw, 56px);
  line-height: 1;
  font-weight: 750;
  letter-spacing: -0.035em;
  text-wrap: balance;
}

.client-logos-viewport {
  position: relative;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  margin-top: 38px;
  overflow: hidden;
  background: transparent;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent);
}

.client-logos-track {
  display: flex;
  width: max-content;
  max-width: none;
  align-items: center;
  animation: client-logos-marquee 58s linear infinite;
  will-change: transform;
}

.client-logos-group {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: clamp(42px, 4.5vw, 76px);
  padding-right: clamp(42px, 4.5vw, 76px);
}

.client-logo-item {
  display: flex;
  width: clamp(118px, 12vw, 176px);
  height: 78px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  background: transparent;
}

.client-logo-item img {
  display: block;
  width: auto;
  max-width: 100%;
  height: auto;
  max-height: 70px;
  object-fit: contain;
  background: transparent;
  user-select: none;
}

@keyframes client-logos-marquee {
  from { transform: translate3d(-50%, 0, 0); }
  to { transform: translate3d(0, 0, 0); }
}

@media (hover: hover) and (pointer: fine) {
  .client-logos-viewport:hover .client-logos-track { animation-play-state: paused; }
}

@media (max-width: 720px) {
  .client-logos-heading { padding-inline: 14px; }
  .client-logos-heading > span {
    max-width: 330px;
    font-size: 9px;
    letter-spacing: 0.16em;
  }
  .client-logos-heading h3 {
    max-width: 340px;
    margin-top: 12px;
    font-size: clamp(32px, 10vw, 42px);
  }
  .client-logos-viewport {
    margin-top: 28px;
    -webkit-mask-image: linear-gradient(90deg, transparent, #000 3%, #000 97%, transparent);
    mask-image: linear-gradient(90deg, transparent, #000 3%, #000 97%, transparent);
  }
  .client-logos-track { animation-duration: 50s; }
  .client-logos-group { gap: 30px; padding-right: 30px; }
  .client-logo-item { width: 112px; height: 62px; }
  .client-logo-item img { max-height: 54px; }
}

@media (prefers-reduced-motion: reduce) {
  .client-logos-viewport {
    overflow: hidden;
    -webkit-mask-image: none;
    mask-image: none;
  }
  .client-logos-track {
    width: 100%;
    max-width: 100%;
    animation: none;
    transform: none;
    will-change: auto;
  }
  .client-logos-group {
    width: 100%;
    flex-wrap: wrap;
    justify-content: center;
    gap: 28px 38px;
    padding-right: 0;
  }
  .client-logos-group[data-clone="true"] { display: none; }
}
'''
    (ROOT / "src/components/site/client-logos.css").write_text(css, encoding="utf-8")


chosen, response_bodies, user_agent, cookies = browser_discover()
expected_files = set()
for display, slug, _aliases in TARGETS:
    raw, source_url = fetch_bytes(
        display,
        chosen[slug]["attrs"],
        response_bodies,
        user_agent,
        cookies,
    )
    destination = OUT / f"{slug}.png"
    rasterize_and_save(raw, destination)
    expected_files.add(destination.name)
    print(f"DONE {display}: {source_url} -> {destination.relative_to(ROOT)}")

for path in OUT.iterdir():
    if path.is_file() and path.name not in expected_files:
        path.unlink()

generate_component()

obsolete = [
    ROOT / "src/assets/client-logo-transparent-webp-base64.ts",
    ROOT / "src/components/site/client-logos-local.ts",
    ROOT / "src/components/site/client-logos-strip-placeholder.txt",
]
for path in obsolete:
    if path.exists():
        path.unlink()

chunks = ROOT / "src/assets/client-logo-strip"
if chunks.exists():
    shutil.rmtree(chunks)

print(f"Generated {len(TARGETS)} independent local PNG assets from the Cáliber reference page.")
