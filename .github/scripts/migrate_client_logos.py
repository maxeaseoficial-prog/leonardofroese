from __future__ import annotations

import io
import re
import shutil
from collections import deque
from pathlib import Path

import requests
from PIL import Image

ROOT = Path.cwd()
OUT = ROOT / "public/client-logos"
OUT.mkdir(parents=True, exist_ok=True)

ASSETS = [
    ("Frota", "frota", "https://calibergestao.com.br/wp-content/uploads/2022/02/FROTA.webp", []),
    ("Octech", "octech", "https://calibergestao.com.br/wp-content/uploads/2022/02/OCTECH.webp", []),
    ("Pantanal", "pantanal", "https://calibergestao.com.br/wp-content/uploads/2022/02/PANTANAL.webp", []),
    ("Tempermat", "tempermat", "https://calibergestao.com.br/wp-content/uploads/2022/02/TEMPERMAT.webp", []),
    ("Prime Lente", "prime-lente", "https://calibergestao.com.br/wp-content/uploads/2025/02/prime-lente-logo-gradual-1.png", []),
    ("Trevo", "trevo", "https://calibergestao.com.br/wp-content/uploads/2025/02/trevo.png", []),
    ("Claro", "claro", "https://calibergestao.com.br/wp-content/uploads/2022/02/CLARO.webp", []),
    (
        "NET",
        "net",
        "https://calibergestao.com.br/wp-content/uploads/2025/02/net-1.png",
        ["https://logospng.org/download/net/logo-net-2048.png"],
    ),
    ("Megasom", "megasom", "https://calibergestao.com.br/wp-content/uploads/2022/05/Logo-Megasom-sem-fundo.png", []),
]

SESSION = requests.Session()
SESSION.headers.update(
    {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/140 Safari/537.36",
        "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    }
)


def valid_image(raw: bytes) -> bool:
    if len(raw) < 100:
        return False
    try:
        image = Image.open(io.BytesIO(raw))
        image.load()
        return image.width > 0 and image.height > 0
    except Exception:
        return False


def fetch_http(url: str) -> bytes | None:
    try:
        response = SESSION.get(url, timeout=30, allow_redirects=True)
        if response.status_code == 200 and valid_image(response.content):
            print(f"HTTP OK {url} -> {len(response.content)} bytes")
            return response.content
        print(f"HTTP MISS {url} -> {response.status_code} {response.headers.get('content-type')}")
    except Exception as exc:
        print(f"HTTP ERROR {url}: {exc}")
    return None


def wayback_snapshot(original_url: str) -> tuple[bytes, str] | None:
    try:
        availability = SESSION.get(
            "https://archive.org/wayback/available",
            params={"url": original_url},
            timeout=30,
        )
        availability.raise_for_status()
        payload = availability.json()
        closest = payload.get("archived_snapshots", {}).get("closest") or {}
        if not closest.get("available"):
            print(f"WAYBACK MISS {original_url}")
            return None
        timestamp = str(closest.get("timestamp") or "")
        archived_url = str(closest.get("url") or "")
        print(f"WAYBACK FOUND {original_url} -> {timestamp} {archived_url}")
        if not timestamp:
            return None

        raw_url = f"https://web.archive.org/web/{timestamp}id_/{original_url}"
        response = SESSION.get(raw_url, timeout=40, allow_redirects=True)
        if response.status_code == 200 and valid_image(response.content):
            print(f"WAYBACK RAW OK {raw_url} -> {len(response.content)} bytes")
            return response.content, raw_url

        # Some snapshots only respond through the replay URL returned by the API.
        replay_url = archived_url.replace("http://", "https://", 1)
        response = SESSION.get(replay_url, timeout=40, allow_redirects=True)
        if response.status_code == 200 and valid_image(response.content):
            print(f"WAYBACK REPLAY OK {replay_url} -> {len(response.content)} bytes")
            return response.content, replay_url
        print(
            f"WAYBACK FETCH MISS {original_url}: "
            f"raw={response.status_code} content-type={response.headers.get('content-type')}"
        )
    except Exception as exc:
        print(f"WAYBACK ERROR {original_url}: {exc}")
    return None


def fetch_asset(name: str, source_url: str, fallbacks: list[str]) -> tuple[bytes, str]:
    direct = fetch_http(source_url)
    if direct is not None:
        return direct, source_url

    archived = wayback_snapshot(source_url)
    if archived is not None:
        return archived

    # WordPress/Jetpack may have archived the proxied form even when the origin
    # asset disappeared. Query its exact former proxy URL as another historical source.
    proxy_url = "https://i0.wp.com/calibergestao.com.br/" + source_url.split("calibergestao.com.br/", 1)[1]
    archived_proxy = wayback_snapshot(proxy_url)
    if archived_proxy is not None:
        return archived_proxy

    for fallback in fallbacks:
        raw = fetch_http(fallback)
        if raw is not None:
            return raw, fallback
        archived_fallback = wayback_snapshot(fallback)
        if archived_fallback is not None:
            return archived_fallback

    raise RuntimeError(f"Could not recover a real image asset for {name}: {source_url}")


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

    if sum(1 for p in border if p[3] <= 20) / max(1, len(border)) >= 0.60:
        return rgba

    opaque = [p for p in border if p[3] >= 180]
    if not opaque:
        return rgba
    channels = list(zip(*[(p[0], p[1], p[2]) for p in opaque]))
    background = tuple(sorted(channel)[len(channel) // 2] for channel in channels)
    deviations = sorted(color_distance(p, background) for p in opaque)
    p90 = deviations[min(len(deviations) - 1, int(len(deviations) * 0.90))]
    neutral_light = max(background) - min(background) <= 38 and min(background) >= 150
    uniform = p90 <= 30

    if not (neutral_light or uniform):
        return rgba

    threshold = 78 if neutral_light else 42
    visited = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def add(x: int, y: int) -> None:
        index = y * width + x
        if visited[index]:
            return
        visited[index] = 1
        p = pixels[x, y]
        if p[3] <= 25 or color_distance(p, background) <= threshold:
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
    image = Image.open(io.BytesIO(raw)).convert("RGBA")
    image.load()
    image = remove_edge_background(image)
    bbox = image.getchannel("A").getbbox()
    if not bbox:
        raise RuntimeError(f"No visible pixels in {destination.name}")
    image = image.crop(bbox)
    pad = max(10, round(max(image.size) * 0.05))
    canvas = Image.new("RGBA", (image.width + pad * 2, image.height + pad * 2), (0, 0, 0, 0))
    canvas.alpha_composite(image, (pad, pad))
    canvas.save(destination, "PNG", optimize=True)

    verify = Image.open(destination).convert("RGBA")
    alpha_min, alpha_max = verify.getchannel("A").getextrema()
    corners = [
        verify.getpixel((0, 0))[3],
        verify.getpixel((verify.width - 1, 0))[3],
        verify.getpixel((0, verify.height - 1))[3],
        verify.getpixel((verify.width - 1, verify.height - 1))[3],
    ]
    if alpha_min != 0 or alpha_max == 0 or any(corners):
        raise RuntimeError(
            f"Transparency validation failed for {destination.name}: "
            f"alpha={alpha_min}-{alpha_max}, corners={corners}"
        )
    print(
        f"ASSET {destination.name}: {verify.width}x{verify.height} "
        f"alpha={alpha_min}-{alpha_max} corners={corners}"
    )


def write_component() -> None:
    items = "\n".join(
        f'  {{ name: "{name}", src: "/client-logos/{slug}.png" }},'
        for name, slug, _source, _fallbacks in ASSETS
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


def write_css() -> None:
    css = '''.client-logos { position:relative; width:100%; max-width:100%; min-width:0; overflow:hidden; background:transparent; }
.client-logos-heading { display:flex; flex-direction:column; align-items:center; padding:0 20px; text-align:center; }
.client-logos-heading > span { color:hsl(var(--primary)); font-size:11px; font-weight:650; letter-spacing:.22em; line-height:1.55; text-transform:uppercase; }
.client-logos-heading h3 { max-width:760px; margin:14px 0 0; color:hsl(var(--foreground)); font-size:clamp(34px,4vw,56px); font-weight:750; letter-spacing:-.035em; line-height:1; text-wrap:balance; }
.client-logos-viewport { position:relative; width:100%; max-width:100%; min-width:0; margin-top:38px; overflow:hidden; background:transparent; -webkit-mask-image:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent); mask-image:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent); }
.client-logos-track { display:flex; width:max-content; align-items:center; animation:client-logos-marquee 42s linear infinite; will-change:transform; }
.client-logos-group { display:flex; flex:0 0 auto; align-items:center; gap:clamp(42px,4.5vw,76px); padding-right:clamp(42px,4.5vw,76px); }
.client-logo-item { display:flex; width:clamp(120px,12vw,176px); height:78px; flex:0 0 auto; align-items:center; justify-content:center; background:transparent; }
.client-logo-item img { display:block; width:auto; max-width:100%; height:auto; max-height:70px; object-fit:contain; background:transparent; user-select:none; }
@keyframes client-logos-marquee { from { transform:translate3d(-50%,0,0); } to { transform:translate3d(0,0,0); } }
@media (hover:hover) and (pointer:fine) { .client-logos-viewport:hover .client-logos-track { animation-play-state:paused; } }
@media (max-width:720px) {
  .client-logos-heading { padding-inline:14px; }
  .client-logos-heading > span { max-width:330px; font-size:9px; letter-spacing:.16em; }
  .client-logos-heading h3 { max-width:340px; margin-top:12px; font-size:clamp(32px,10vw,42px); }
  .client-logos-viewport { margin-top:28px; -webkit-mask-image:linear-gradient(90deg,transparent,#000 3%,#000 97%,transparent); mask-image:linear-gradient(90deg,transparent,#000 3%,#000 97%,transparent); }
  .client-logos-track { animation-duration:36s; }
  .client-logos-group { gap:30px; padding-right:30px; }
  .client-logo-item { width:112px; height:62px; }
  .client-logo-item img { max-height:54px; }
}
@media (prefers-reduced-motion:reduce) {
  .client-logos-viewport { -webkit-mask-image:none; mask-image:none; }
  .client-logos-track { width:100%; animation:none; transform:none; will-change:auto; }
  .client-logos-group { width:100%; flex-wrap:wrap; justify-content:center; gap:28px 38px; padding-right:0; }
  .client-logos-group[data-clone="true"] { display:none; }
}
'''
    (ROOT / "src/components/site/client-logos.css").write_text(css, encoding="utf-8")


recovered: dict[str, tuple[bytes, str]] = {}
errors: list[str] = []
for name, slug, source_url, fallbacks in ASSETS:
    try:
        recovered[slug] = fetch_asset(name, source_url, fallbacks)
    except Exception as exc:
        errors.append(str(exc))

if errors:
    raise RuntimeError("\n".join(errors))

expected: set[str] = set()
for name, slug, _source_url, _fallbacks in ASSETS:
    raw, source = recovered[slug]
    destination = OUT / f"{slug}.png"
    save_png(raw, destination)
    expected.add(destination.name)
    print(f"DONE {name}: {source} -> {destination.relative_to(ROOT)}")

for path in OUT.iterdir():
    if path.is_file() and path.name not in expected:
        path.unlink()

write_component()
write_css()

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

print(f"Generated {len(ASSETS)} independent local PNG logos with verified alpha transparency.")
