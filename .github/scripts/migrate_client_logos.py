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

LOGOS = [
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
CHUNKS_DIR = ROOT / "src/assets/client-logo-strip"


def color_distance(a, b) -> float:
    return sum((a[i] - b[i]) ** 2 for i in range(3)) ** 0.5


def remove_edge_background(image: Image.Image) -> Image.Image:
    """Remove only a solid/light background connected to a cell edge."""
    rgba = image.convert("RGBA")
    width, height = rgba.size
    pixels = rgba.load()

    border = [pixels[x, y] for x in range(width) for y in (0, height - 1)]
    border += [pixels[x, y] for y in range(height) for x in (0, width - 1)]

    transparent_ratio = sum(p[3] <= 20 for p in border) / max(1, len(border))
    if transparent_ratio >= 0.55:
        return rgba

    opaque = [p for p in border if p[3] >= 180]
    if not opaque:
        return rgba

    channels = list(zip(*[(p[0], p[1], p[2]) for p in opaque]))
    background = tuple(sorted(channel)[len(channel) // 2] for channel in channels)
    deviations = sorted(color_distance(p, background) for p in opaque)
    p90 = deviations[int((len(deviations) - 1) * 0.90)]

    neutral_light = max(background) - min(background) <= 42 and min(background) >= 135
    uniform = p90 <= 26
    if not (neutral_light or uniform):
        return rgba

    tolerance = 72 if neutral_light else 42
    visited = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def add(x: int, y: int) -> None:
        idx = y * width + x
        if visited[idx]:
            return
        visited[idx] = 1
        pixel = pixels[x, y]
        if pixel[3] <= 25 or color_distance(pixel, background) <= tolerance:
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


def reconstruct_legacy_strip() -> Image.Image:
    """
    Rebuild the original WebP from its historical base64 chunks.

    The legacy one-file constant is truncated. The chunk directory still contains
    the complete base64 stream, split across TypeScript strings. Padding that was
    introduced at intermediate splits must not remain inside one base64 stream.
    """
    if not CHUNKS_DIR.exists():
        raise RuntimeError("Legacy chunk directory is missing")

    runs: list[str] = []
    for index in range(8):
        path = CHUNKS_DIR / f"chunk{index}.ts"
        if not path.exists():
            raise RuntimeError(f"Missing legacy chunk: {path}")
        text = path.read_text(encoding="utf-8")
        found = re.findall(r"[A-Za-z0-9+/=]{1000,}", text)
        if not found:
            raise RuntimeError(f"Could not find base64 payload in {path}")
        print(f"CHUNK {index}: runs={[len(run) for run in found]}")
        runs.extend(found)

    # A real base64 stream can only contain padding at the very end. Historical
    # chunk boundaries contain intermediate '=' characters, so remove those,
    # then use the RIFF header to recover the exact canonical payload length.
    joined = "".join(run.replace("=", "") for run in runs)
    if len(joined) < 32:
        raise RuntimeError("Recovered base64 payload is too short")

    prefix = joined[:32]
    prefix += "=" * ((4 - len(prefix) % 4) % 4)
    header = base64.b64decode(prefix, validate=True)
    if header[:4] != b"RIFF" or header[8:12] != b"WEBP":
        raise RuntimeError(f"Recovered payload is not a WebP RIFF container: {header[:12]!r}")

    declared_bytes = int.from_bytes(header[4:8], "little") + 8
    # Number of non-padding base64 characters needed for exactly N bytes.
    required_data_chars = (declared_bytes * 8 + 5) // 6
    if len(joined) < required_data_chars:
        raise RuntimeError(
            f"Incomplete legacy WebP: need {required_data_chars} base64 data chars, got {len(joined)}"
        )

    canonical = joined[:required_data_chars]
    canonical += "=" * ((4 - len(canonical) % 4) % 4)
    raw = base64.b64decode(canonical, validate=True)
    if len(raw) != declared_bytes:
        raise RuntimeError(
            f"Decoded WebP length mismatch: expected {declared_bytes}, got {len(raw)}"
        )
    if raw[:4] != b"RIFF" or raw[8:12] != b"WEBP":
        raise RuntimeError("Canonical legacy payload lost its WebP signature")

    image = Image.open(io.BytesIO(raw)).convert("RGBA")
    image.load()
    if image.width < len(LOGOS) * 40 or image.height < 20:
        raise RuntimeError(f"Unexpected legacy strip size: {image.width}x{image.height}")

    print(
        f"LEGACY STRIP: {image.width}x{image.height}, bytes={declared_bytes}, "
        f"base64_data_chars={required_data_chars}"
    )
    return image


def validate_png(path: Path) -> None:
    image = Image.open(path).convert("RGBA")
    image.load()
    alpha_min, alpha_max = image.getchannel("A").getextrema()
    corners = [
        image.getpixel((0, 0))[3],
        image.getpixel((image.width - 1, 0))[3],
        image.getpixel((0, image.height - 1))[3],
        image.getpixel((image.width - 1, image.height - 1))[3],
    ]
    if image.width <= 0 or image.height <= 0:
        raise RuntimeError(f"Invalid dimensions for {path.name}: {image.size}")
    if alpha_min != 0 or alpha_max == 0 or any(corners):
        raise RuntimeError(
            f"Invalid alpha for {path.name}: alpha={alpha_min}-{alpha_max}, corners={corners}"
        )
    print(
        f"ASSET {path.name}: {image.width}x{image.height}, "
        f"alpha={alpha_min}-{alpha_max}, corners={corners}"
    )


def final_assets_are_valid() -> bool:
    try:
        for _name, slug in LOGOS:
            path = OUT / f"{slug}.png"
            if not path.exists():
                return False
            validate_png(path)
        return True
    except Exception as exc:
        print(f"EXISTING ASSET VALIDATION FAILED: {exc}")
        return False


def extract_individual_logos() -> None:
    strip = reconstruct_legacy_strip()
    count = len(LOGOS)

    # The legacy strip was laid out as nine equal logo slots. Split the source
    # before trimming backgrounds so every final file is an independent asset.
    edges = [round(i * strip.width / count) for i in range(count + 1)]
    widths = [edges[i + 1] - edges[i] for i in range(count)]
    if min(widths) < 40:
        raise RuntimeError(f"Legacy logo cells are unexpectedly narrow: {widths}")
    print(f"CELL WIDTHS: {widths}")

    for index, (name, slug) in enumerate(LOGOS):
        cell = strip.crop((edges[index], 0, edges[index + 1], strip.height))
        cell = remove_edge_background(cell)

        visible_alpha = cell.getchannel("A").point(lambda a: 255 if a >= 12 else 0)
        bbox = visible_alpha.getbbox()
        if not bbox:
            raise RuntimeError(f"No visible pixels found for {name}")
        cell = cell.crop(bbox)

        pad = max(10, round(max(cell.size) * 0.06))
        final = Image.new(
            "RGBA",
            (cell.width + pad * 2, cell.height + pad * 2),
            (0, 0, 0, 0),
        )
        final.alpha_composite(cell, (pad, pad))

        destination = OUT / f"{slug}.png"
        final.save(destination, "PNG", optimize=True)
        validate_png(destination)
        print(f"EXTRACTED {name} -> {destination.relative_to(ROOT)}")


def write_component() -> None:
    items = "\n".join(
        f'  {{ name: "{name}", src: "/client-logos/{slug}.png" }},'
        for name, slug in LOGOS
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


if CHUNKS_DIR.exists():
    extract_individual_logos()
elif not final_assets_are_valid():
    raise RuntimeError(
        "Legacy chunks are gone and the nine final transparent logo assets are incomplete"
    )
else:
    print("Existing nine independent transparent logo assets validated.")

write_component()
write_css()

expected = {f"{slug}.png" for _name, slug in LOGOS}
for path in OUT.iterdir():
    if path.is_file() and path.name not in expected:
        path.unlink()

for legacy_path in [
    LEGACY_SOURCE,
    ROOT / "src/components/site/client-logos-local.ts",
    ROOT / "src/components/site/client-logos-strip-placeholder.txt",
]:
    if legacy_path.exists():
        legacy_path.unlink()

if CHUNKS_DIR.exists():
    shutil.rmtree(CHUNKS_DIR)

for _name, slug in LOGOS:
    validate_png(OUT / f"{slug}.png")

print("Generated 9 independent local PNG client logos with verified alpha transparency.")
