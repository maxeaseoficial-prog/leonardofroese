from __future__ import annotations

import base64
import io
import re
import shutil
from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path.cwd()
SOURCE = ROOT / "src/assets/client-logo-transparent-webp-base64.ts"
OUT = ROOT / "public/client-logos"
OUT.mkdir(parents=True, exist_ok=True)

SOURCE_NAMES = [
    "Parceiro 01",
    "Parceiro 02",
    "Parceiro 03",
    "Parceiro 04",
    "Parceiro 05",
    "Parceiro 06",
    "Parceiro 07",
    "Parceiro 08",
    "Parceiro 09",
]

text = SOURCE.read_text(encoding="utf-8")
match = re.search(
    r'clientLogoTransparentWebpBase64\s*=\s*"([^"]+)"',
    text,
    flags=re.DOTALL,
)
if not match:
    raise RuntimeError("Could not extract the local WebP base64 source")

encoded = re.sub(r"\s+", "", match.group(1))
# The historical source contains a few non-base64 characters introduced during
# earlier copy/chunk operations. Ignore only those transport artifacts, then
# validate the decoded image itself by format and exact dimensions below.
encoded = re.sub(r"[^A-Za-z0-9+/=]", "", encoded)
encoded += "=" * (-len(encoded) % 4)
raw = base64.b64decode(encoded, validate=False)
strip = Image.open(io.BytesIO(raw)).convert("RGBA")
strip.load()
print(f"SOURCE strip={strip.width}x{strip.height} mode={strip.mode} bytes={len(raw)}")

LOGO_COUNT = len(SOURCE_NAMES)
if strip.size != (2160, 120):
    raise RuntimeError(f"Unexpected source dimensions {strip.size}; expected 2160x120")
if strip.width % LOGO_COUNT:
    raise RuntimeError("Source width is not evenly divisible into logo cells")

CELL_WIDTH = strip.width // LOGO_COUNT


def color_distance(a, b) -> float:
    return ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2) ** 0.5


def clear_edge_background(image: Image.Image) -> Image.Image:
    rgba = image.copy().convert("RGBA")
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
    opaque_border = [pixel for pixel in border if pixel[3] >= 180]

    # Preserve cells that already have a genuinely transparent perimeter.
    if transparent_share >= 0.70 or len(opaque_border) < 12:
        return rgba

    channels = list(zip(*[(p[0], p[1], p[2]) for p in opaque_border]))
    background = tuple(sorted(channel)[len(channel) // 2] for channel in channels)
    deviations = sorted(color_distance(pixel, background) for pixel in opaque_border)
    p90 = deviations[min(len(deviations) - 1, int(len(deviations) * 0.90))]
    neutral_light = max(background) - min(background) <= 28 and min(background) >= 185
    uniform = p90 <= 38

    if not (neutral_light or uniform):
        return rgba

    threshold = 72 if neutral_light else 50
    seen = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def add(x: int, y: int) -> None:
        index = y * width + x
        if seen[index]:
            return
        seen[index] = 1
        pixel = pixels[x, y]
        if pixel[3] <= 20 or color_distance(pixel, background) <= threshold:
            queue.append((x, y))

    for x in range(width):
        add(x, 0)
        add(x, height - 1)
    for y in range(height):
        add(0, y)
        add(width - 1, y)

    while queue:
        x, y = queue.popleft()
        r, g, b, _alpha = pixels[x, y]
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


def save_logo(index: int) -> Path:
    left = index * CELL_WIDTH
    cell = strip.crop((left, 0, left + CELL_WIDTH, strip.height))
    cell = clear_edge_background(cell)

    alpha = cell.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        raise RuntimeError(f"Logo cell {index + 1} has no visible pixels")
    cell = cell.crop(bbox)

    pad = max(10, round(max(cell.size) * 0.05))
    canvas = Image.new("RGBA", (cell.width + pad * 2, cell.height + pad * 2), (0, 0, 0, 0))
    canvas.alpha_composite(cell, (pad, pad))

    destination = OUT / f"partner-{index + 1:02d}.png"
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
    return destination


generated = [save_logo(index) for index in range(LOGO_COUNT)]

# Keep only the new independent PNG assets in this directory.
keep = {path.name for path in generated}
for path in OUT.iterdir():
    if path.is_file() and path.name not in keep:
        path.unlink()

component = '''import "./client-logos.css";

const clientLogos = [
  { name: "Parceiro 01", src: "/client-logos/partner-01.png" },
  { name: "Parceiro 02", src: "/client-logos/partner-02.png" },
  { name: "Parceiro 03", src: "/client-logos/partner-03.png" },
  { name: "Parceiro 04", src: "/client-logos/partner-04.png" },
  { name: "Parceiro 05", src: "/client-logos/partner-05.png" },
  { name: "Parceiro 06", src: "/client-logos/partner-06.png" },
  { name: "Parceiro 07", src: "/client-logos/partner-07.png" },
  { name: "Parceiro 08", src: "/client-logos/partner-08.png" },
  { name: "Parceiro 09", src: "/client-logos/partner-09.png" },
] as const;

function LogoGroup({ clone = false }: { clone?: boolean }) {
  return (
    <div
      className="client-logos-group"
      aria-hidden={clone || undefined}
      data-clone={clone ? "true" : undefined}
    >
      {clientLogos.map((logo) => (
        <div className="client-logo-item" key={`${clone ? "clone-" : ""}${logo.src}`}>
          <img
            src={logo.src}
            alt={clone ? "" : logo.name}
            aria-hidden={clone || undefined}
            decoding="async"
            draggable={false}
          />
        </div>
      ))}
    </div>
  );
}

export function ClientLogos({ className = "" }: { className?: string }) {
  return (
    <section className={`client-logos ${className}`} aria-label="Parceiros e clientes">
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
}
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
  animation: client-logos-marquee 36s linear infinite;
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
  height: 76px;
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
  max-height: 68px;
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
  .client-logos-track { animation-duration: 31s; }
  .client-logos-group { gap: 30px; padding-right: 30px; }
  .client-logo-item { width: 112px; height: 60px; }
  .client-logo-item img { max-height: 52px; }
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

print(f"Generated {len(generated)} independent transparent local logo assets.")
