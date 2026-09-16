from __future__ import annotations

import io
import re
import shutil
import unicodedata
from collections import deque
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup
from PIL import Image

ROOT = Path.cwd()
OUT = ROOT / "public/client-logos"
OUT.mkdir(parents=True, exist_ok=True)

REFERENCE_URL = "https://calibergestao.com.br/"
LEGACY_SOURCE = ROOT / "src/assets/client-logo-transparent-webp-base64.ts"
LEGACY_CHUNKS = ROOT / "src/assets/client-logo-strip"

LOGOS = [
    ("Frota", "frota", ["frota"]),
    ("Octech", "octech", ["octech"]),
    ("Pantanal", "pantanal", ["pantanal"]),
    ("Tempermat", "tempermat", ["tempermat"]),
    ("Prime Lente", "prime-lente", ["prime lente", "prime-lente-logo-gradual", "prime lente logo gradual"]),
    ("Trevo", "trevo", ["trevo"]),
    ("Claro", "claro", ["claro"]),
    ("NET", "net", ["net"]),
    ("Megasom", "megasom", ["megasom", "logo megasom sem fundo"]),
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/140.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
}


def norm(value: str) -> str:
    value = unicodedata.normalize("NFKD", value or "")
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    value = re.sub(r"[^a-zA-Z0-9]+", " ", value).strip().lower()
    return re.sub(r"\s+", " ", value)


def best_image_url(img) -> str | None:
    # Prefer lazy/original attributes, then the largest srcset entry, then src.
    attrs = [
        "data-lazy-src",
        "data-src",
        "data-original",
        "data-orig-file",
        "data-full-url",
    ]
    for attr in attrs:
        value = img.get(attr)
        if value and not value.startswith("data:"):
            return urljoin(REFERENCE_URL, value)

    for attr in ("data-srcset", "srcset"):
        srcset = img.get(attr)
        if not srcset:
            continue
        candidates = []
        for part in srcset.split(","):
            bits = part.strip().split()
            if not bits:
                continue
            url = bits[0]
            score = 0
            if len(bits) > 1:
                match = re.match(r"(\d+)(w|x)", bits[1])
                if match:
                    score = int(match.group(1))
            candidates.append((score, url))
        if candidates:
            return urljoin(REFERENCE_URL, max(candidates)[1])

    src = img.get("src")
    if src and not src.startswith("data:"):
        return urljoin(REFERENCE_URL, src)
    return None


def find_logo_sources() -> dict[str, str]:
    response = requests.get(REFERENCE_URL, headers=HEADERS, timeout=45)
    response.raise_for_status()
    print(f"REFERENCE PAGE: status={response.status_code}; bytes={len(response.content)}")
    soup = BeautifulSoup(response.text, "html.parser")

    found: dict[str, str] = {}
    images = soup.find_all("img")
    print(f"REFERENCE IMAGES FOUND: {len(images)}")

    for display_name, slug, aliases in LOGOS:
        alias_norms = {norm(alias) for alias in aliases}
        candidates = []
        for img in images:
            alt = norm(img.get("alt", ""))
            title = norm(img.get("title", ""))
            classes = norm(" ".join(img.get("class", [])))
            src_text = norm(
                " ".join(
                    str(img.get(attr, ""))
                    for attr in ("src", "data-src", "data-lazy-src", "srcset", "data-srcset")
                )
            )
            haystacks = [alt, title, classes, src_text]
            score = 0
            for alias in alias_norms:
                for hay in haystacks:
                    if not hay:
                        continue
                    if hay == alias:
                        score = max(score, 100)
                    elif alias in hay:
                        score = max(score, 80)
                    elif all(token in hay for token in alias.split()):
                        score = max(score, 60)
            if score:
                url = best_image_url(img)
                if url:
                    candidates.append((score, url, img.get("alt", "")))

        if not candidates:
            raise RuntimeError(f"Could not locate real logo on Cáliber page: {display_name}")

        candidates.sort(key=lambda item: (item[0], len(item[1])), reverse=True)
        score, url, alt = candidates[0]
        found[slug] = url
        print(f"SOURCE {display_name}: score={score}; alt={alt!r}; url={url}")

    if len(found) != len(LOGOS):
        raise RuntimeError(f"Expected 9 logo sources, found {len(found)}")
    return found


def color_distance(a, b) -> float:
    return ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2) ** 0.5


def make_background_transparent(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    width, height = rgba.size
    pixels = rgba.load()

    border = []
    for x in range(width):
        border.extend((pixels[x, 0], pixels[x, height - 1]))
    for y in range(height):
        border.extend((pixels[0, y], pixels[width - 1, y]))

    transparent_share = sum(1 for p in border if p[3] <= 20) / max(1, len(border))
    if transparent_share >= 0.55:
        return rgba

    opaque = [p for p in border if p[3] >= 180]
    if not opaque:
        return rgba

    channels = list(zip(*[(p[0], p[1], p[2]) for p in opaque]))
    background = tuple(sorted(channel)[len(channel) // 2] for channel in channels)
    deviations = sorted(color_distance(p, background) for p in opaque)
    p90 = deviations[int((len(deviations) - 1) * 0.90)]

    neutral_light = max(background) - min(background) <= 48 and min(background) >= 125
    uniform = p90 <= 30
    if not (neutral_light or uniform):
        # Do not destroy colored logo edges when no safely identifiable background exists.
        print(f"BACKGROUND: already/nonuniform edge preserved; bg={background}; p90={p90:.1f}")
        return rgba

    threshold = 76 if neutral_light else 44
    visited = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def add(x: int, y: int) -> None:
        idx = y * width + x
        if visited[idx]:
            return
        visited[idx] = 1
        r, g, b, a = pixels[x, y]
        if a <= 25 or color_distance((r, g, b), background) <= threshold:
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
        if x:
            add(x - 1, y)
        if x + 1 < width:
            add(x + 1, y)
        if y:
            add(x, y - 1)
        if y + 1 < height:
            add(x, y + 1)

    return rgba


def validate_png(path: Path) -> None:
    image = Image.open(path).convert("RGBA")
    image.load()
    alpha = image.getchannel("A")
    alpha_min, alpha_max = alpha.getextrema()
    bbox = alpha.getbbox()
    corners = [
        image.getpixel((0, 0))[3],
        image.getpixel((image.width - 1, 0))[3],
        image.getpixel((0, image.height - 1))[3],
        image.getpixel((image.width - 1, image.height - 1))[3],
    ]
    if image.width < 8 or image.height < 8 or not bbox:
        raise RuntimeError(f"Invalid logo content: {path.name} {image.size}")
    if alpha_min != 0 or alpha_max == 0 or any(corners):
        raise RuntimeError(
            f"Transparency failed for {path.name}: alpha={alpha_min}-{alpha_max}; corners={corners}"
        )
    print(
        f"VALID ASSET {path.name}: {image.width}x{image.height}; "
        f"alpha={alpha_min}-{alpha_max}; corners={corners}; visible_bbox={bbox}"
    )


def download_and_process_assets() -> None:
    sources = find_logo_sources()
    session = requests.Session()
    session.headers.update(HEADERS)
    session.headers["Referer"] = REFERENCE_URL

    for display_name, slug, _aliases in LOGOS:
        url = sources[slug]
        response = session.get(url, timeout=45)
        response.raise_for_status()
        if len(response.content) < 100:
            raise RuntimeError(f"Downloaded image is unexpectedly small: {display_name}")

        source = Image.open(io.BytesIO(response.content))
        source.load()
        print(
            f"DOWNLOAD {display_name}: format={source.format}; size={source.width}x{source.height}; "
            f"bytes={len(response.content)}"
        )
        logo = make_background_transparent(source)
        alpha = logo.getchannel("A")
        bbox = alpha.point(lambda a: 255 if a >= 12 else 0).getbbox()
        if not bbox:
            raise RuntimeError(f"No visible logo pixels after processing: {display_name}")
        logo = logo.crop(bbox)

        pad = max(10, round(max(logo.size) * 0.06))
        canvas = Image.new(
            "RGBA",
            (logo.width + pad * 2, logo.height + pad * 2),
            (0, 0, 0, 0),
        )
        canvas.alpha_composite(logo, (pad, pad))
        destination = OUT / f"{slug}.png"
        canvas.save(destination, "PNG", optimize=True)
        validate_png(destination)


def write_component() -> None:
    rows = "\n".join(
        f'  {{ name: "{name}", src: "/client-logos/{slug}.png" }},'
        for name, slug, _aliases in LOGOS
    )
    content = f'''import "./client-logos.css";

const clientLogos = [
{rows}
] as const;

function LogoGroup({{ clone = false }}: {{ clone?: boolean }}) {{
  return (
    <div
      className="client-logos-group"
      aria-hidden={{clone || undefined}}
      data-clone={{clone ? "true" : undefined}}
    >
      {{clientLogos.map((logo) => (
        <div className="client-logo-item" key={{`${{clone ? "clone-" : ""}}${{logo.name}}`}}>
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
    (ROOT / "src/components/site/client-logos.tsx").write_text(content, encoding="utf-8")


def write_css() -> None:
    (ROOT / "src/components/site/client-logos.css").write_text(
        '''.client-logos {
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
  padding: 0 20px;
  text-align: center;
}

.client-logos-heading > span {
  color: hsl(var(--primary));
  font-size: 11px;
  font-weight: 650;
  letter-spacing: .22em;
  line-height: 1.55;
  text-transform: uppercase;
}

.client-logos-heading h3 {
  max-width: 760px;
  margin: 14px 0 0;
  color: hsl(var(--foreground));
  font-size: clamp(34px, 4vw, 56px);
  font-weight: 750;
  letter-spacing: -.035em;
  line-height: 1;
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
  animation: client-logos-marquee 42s linear infinite;
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
  width: clamp(120px, 12vw, 176px);
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
  .client-logos-heading > span { max-width: 330px; font-size: 9px; letter-spacing: .16em; }
  .client-logos-heading h3 { max-width: 340px; margin-top: 12px; font-size: clamp(32px, 10vw, 42px); }
  .client-logos-viewport {
    margin-top: 28px;
    -webkit-mask-image: linear-gradient(90deg, transparent, #000 3%, #000 97%, transparent);
    mask-image: linear-gradient(90deg, transparent, #000 3%, #000 97%, transparent);
  }
  .client-logos-track { animation-duration: 36s; }
  .client-logos-group { gap: 30px; padding-right: 30px; }
  .client-logo-item { width: 112px; height: 62px; }
  .client-logo-item img { max-height: 54px; }
}

@media (prefers-reduced-motion: reduce) {
  .client-logos-viewport { -webkit-mask-image: none; mask-image: none; }
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
''',
        encoding="utf-8",
    )


def cleanup() -> None:
    expected = {f"{slug}.png" for _name, slug, _aliases in LOGOS}
    for path in OUT.iterdir():
        if path.is_file() and path.name not in expected:
            path.unlink()

    for path in [
        LEGACY_SOURCE,
        ROOT / "src/components/site/client-logos-local.ts",
        ROOT / "src/components/site/client-logos-strip-placeholder.txt",
    ]:
        if path.exists():
            path.unlink()
    if LEGACY_CHUNKS.exists():
        shutil.rmtree(LEGACY_CHUNKS)


download_and_process_assets()
write_component()
write_css()
cleanup()
for _name, slug, _aliases in LOGOS:
    validate_png(OUT / f"{slug}.png")
print("Generated 9 real, independent, local transparent PNG client logos from calibergestao.com.br.")
