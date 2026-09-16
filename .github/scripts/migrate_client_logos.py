from __future__ import annotations

import base64
import io
import re
import shutil
from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path.cwd()
OUT = ROOT / "public/client-logos"
OUT.mkdir(parents=True, exist_ok=True)

ASSETS = [
    ("Frota", "frota"),
    ("Octech", "octech"),
    ("Pantanal", "pantanal"),
    ("Tempermat", "tempermat"),
    ("Prime Lente", "prime-lente"),
    ("Trevo", "trevo"),
    ("Claro", "claro"),
    ("NET", "net"),
    ("Megasom", "megasom"),
]

LEGACY_SOURCE = ROOT / "src/assets/client-logo-transparent-webp-base64.ts"


def color_distance(a, b) -> float:
    return ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2) ** 0.5


def remove_edge_background(image: Image.Image) -> Image.Image:
    # Remove only a background connected to the cell edges. Interior logo colors
    # are never flood-filled unless they are connected to that edge background.
    rgba = image.convert("RGBA")
    width, height = rgba.size
    pixels = rgba.load()

    border = []
    for x in range(width):
        border.extend((pixels[x, 0], pixels[x, height - 1]))
    for y in range(height):
        border.extend((pixels[0, y], pixels[width - 1, y]))

    transparent_ratio = sum(1 for p in border if p[3] <= 20) / max(1, len(border))
    if transparent_ratio >= 0.60:
        return rgba

    opaque = [p for p in border if p[3] >= 180]
    if not opaque:
        return rgba

    channels = list(zip(*[(p[0], p[1], p[2]) for p in opaque]))
    background = tuple(sorted(channel)[len(channel) // 2] for channel in channels)
    deviations = sorted(color_distance(p, background) for p in opaque)
    p90 = deviations[min(len(deviations) - 1, int((len(deviations) - 1) * 0.90))]

    neutral = max(background) - min(background) <= 42
    light = min(background) >= 135
    uniform = p90 <= 26
    if not ((neutral and light) or uniform):
        return rgba

    threshold = 72 if neutral and light else 42
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
        if x:
            add(x - 1, y)
        if x + 1 < width:
            add(x + 1, y)
        if y:
            add(x, y - 1)
        if y + 1 < height:
            add(x, y + 1)

    return rgba


def load_legacy_strip() -> Image.Image:
    text = LEGACY_SOURCE.read_text(encoding="utf-8")
    match = re.search(
        r'clientLogoTransparentWebpBase64\s*=\s*"([A-Za-z0-9+/=]+)"',
        text,
    )
    if not match:
        raise RuntimeError("Could not find the existing client logo WebP base64 payload")

    encoded = match.group(1)
    encoded += "=" * ((4 - len(encoded) % 4) % 4)
    raw = base64.b64decode(encoded, validate=False)

    image = Image.open(io.BytesIO(raw)).convert("RGBA")
    image.load()
    if image.width < len(ASSETS) * 40 or image.height < 20:
        raise RuntimeError(f"Unexpected legacy strip dimensions: {image.width}x{image.height}")

    print(f"LEGACY STRIP {image.width}x{image.height} mode={image.mode}")
    return image


def visible_bbox(image: Image.Image):
    alpha = image.getchannel("A")
    thresholded = alpha.point(lambda a: 255 if a >= 12 else 0)
    return thresholded.getbbox()


def save_logo(image: Image.Image, destination: Path) -> None:
    image = remove_edge_background(image)

    bbox = visible_bbox(image)
    if not bbox:
        raise RuntimeError(f"No visible pixels in {destination.name}")
    image = image.crop(bbox)

    pad = max(10, round(max(image.size) * 0.06))
    canvas = Image.new(
        "RGBA",
        (image.width + pad * 2, image.height + pad * 2),
        (0, 0, 0, 0),
    )
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


def validate_existing_assets() -> bool:
    paths = [OUT / f"{slug}.png" for _name, slug in ASSETS]
    if not all(path.exists() for path in paths):
        return False

    for path in paths:
        image = Image.open(path).convert("RGBA")
        image.load()
        if image.width <= 0 or image.height <= 0:
            return False
        alpha_min, alpha_max = image.getchannel("A").getextrema()
        corners = [
            image.getpixel((0, 0))[3],
            image.getpixel((image.width - 1, 0))[3],
            image.getpixel((0, image.height - 1))[3],
            image.getpixel((image.width - 1, image.height - 1))[3],
        ]
        if alpha_min != 0 or alpha_max == 0 or any(corners):
            return False
    return True


def extract_from_legacy_strip() -> None:
    strip = load_legacy_strip()
    count = len(ASSETS)

    # The current strip was authored as nine equal logo slots. Split those slots
    # before trimming transparent/background pixels so each final logo is a
    # genuinely independent local asset.
    edges = [round(i * strip.width / count) for i in range(count + 1)]
    widths = [edges[i + 1] - edges[i] for i in range(count)]
    print(f"SPLIT widths={widths}")

    if min(widths) < 40:
        raise RuntimeError(f"Legacy strip cells are unexpectedly narrow: {widths}")

    for index, (name, slug) in enumerate(ASSETS):
        cell = strip.crop((edges[index], 0, edges[index + 1], strip.height))
        destination = OUT / f"{slug}.png"
        save_logo(cell, destination)
        print(f"EXTRACTED {name} -> {destination.relative_to(ROOT)}")


def write_component() -> None:
    items = "\n".join(
        f'  {{ name: "{name}", src: "/client-logos/{slug}.png" }},'
        for name, slug in ASSETS
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


def write_css() -> None:
    css = '''.client-logos {
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
  letter-spacing: 0.22em;
  line-height: 1.55;
  text-transform: uppercase;
}

.client-logos-heading h3 {
  max-width: 760px;
  margin: 14px 0 0;
  color: hsl(var(--foreground));
  font-size: clamp(34px, 4vw, 56px);
  font-weight: 750;
  letter-spacing: -0.035em;
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
  .client-logos-viewport:hover .client-logos-track {
    animation-play-state: paused;
  }
}

@media (max-width: 720px) {
  .client-logos-heading {
    padding-inline: 14px;
  }

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

  .client-logos-track {
    animation-duration: 36s;
  }

  .client-logos-group {
    gap: 30px;
    padding-right: 30px;
  }

  .client-logo-item {
    width: 112px;
    height: 62px;
  }

  .client-logo-item img {
    max-height: 54px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .client-logos-viewport {
    -webkit-mask-image: none;
    mask-image: none;
  }

  .client-logos-track {
    width: 100%;
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

  .client-logos-group[data-clone="true"] {
    display: none;
  }
}
'''
    (ROOT / "src/components/site/client-logos.css").write_text(css, encoding="utf-8")


if LEGACY_SOURCE.exists():
    extract_from_legacy_strip()
elif not validate_existing_assets():
    raise RuntimeError(
        "The legacy source is gone and the nine final transparent logo assets are incomplete"
    )
else:
    print("Existing nine transparent local assets validated; regeneration is idempotent.")

write_component()
write_css()

expected = {f"{slug}.png" for _name, slug in ASSETS}
for path in OUT.iterdir():
    if path.is_file() and path.name not in expected:
        path.unlink()

legacy_files = [
    ROOT / "src/assets/client-logo-transparent-webp-base64.ts",
    ROOT / "src/components/site/client-logos-local.ts",
    ROOT / "src/components/site/client-logos-strip-placeholder.txt",
]
for path in legacy_files:
    if path.exists():
        path.unlink()

chunks = ROOT / "src/assets/client-logo-strip"
if chunks.exists():
    shutil.rmtree(chunks)

if not validate_existing_assets():
    raise RuntimeError("Final independent PNG logo validation failed")

print(f"Generated {len(ASSETS)} independent local PNG logos with verified alpha transparency.")
