from __future__ import annotations

import base64
import io
import re
import shutil
import subprocess
from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path.cwd()
OUT = ROOT / "public/client-logos"
OUT.mkdir(parents=True, exist_ok=True)

HISTORICAL_REF = "fbf98698b74f4c6f10d6b415192a63b0cdb4f3f2"
LEGACY_SOURCE = ROOT / "src/assets/client-logo-transparent-webp-base64.ts"
CHUNKS_DIR = ROOT / "src/assets/client-logo-strip"

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


def parse_historical_chunk(index: int) -> str:
    path = f"src/assets/client-logo-strip/chunk{index}.ts"
    text = subprocess.check_output(
        ["git", "show", f"{HISTORICAL_REF}:{path}"],
        cwd=ROOT,
        text=True,
    )
    matches = re.findall(r'"([A-Za-z0-9+/=]+)"', text)
    if not matches:
        raise RuntimeError(f"Could not parse historical {path}")
    payload = max(matches, key=len)
    print(
        f"HISTORICAL CHUNK {index}: chars={len(payload)} "
        f"prefix={payload[:8]!r} suffix={payload[-8:]!r}"
    )
    return payload


def load_consistent_legacy_strip() -> Image.Image:
    parts = [parse_historical_chunk(i) for i in range(8)]
    encoded = "".join(parts)

    # The eight files are slices of one base64 stream. Only the final stream may
    # contain padding; no intermediate padding is accepted because that would
    # indicate mixed/corrupt revisions again.
    first_padding = encoded.find("=")
    if first_padding != -1 and any(ch != "=" for ch in encoded[first_padding:]):
        raise RuntimeError("Historical source contains padding before the final base64 tail")

    encoded += "=" * ((4 - len(encoded) % 4) % 4)
    raw = base64.b64decode(encoded, validate=True)
    if raw[:4] != b"RIFF" or raw[8:12] != b"WEBP":
        raise RuntimeError(f"Historical source is not a WebP RIFF file: {raw[:12]!r}")

    declared_size = int.from_bytes(raw[4:8], "little") + 8
    if len(raw) < declared_size:
        raise RuntimeError(
            f"Historical WebP is incomplete: decoded={len(raw)} declared={declared_size}"
        )
    if len(raw) > declared_size:
        raw = raw[:declared_size]

    image = Image.open(io.BytesIO(raw)).convert("RGBA")
    image.load()
    if image.width % len(LOGOS) != 0:
        raise RuntimeError(
            f"Unexpected strip width {image.width} for {len(LOGOS)} logo cells"
        )
    if image.height < 20:
        raise RuntimeError(f"Unexpected strip height: {image.height}")

    print(
        f"CONSISTENT LEGACY STRIP: {image.width}x{image.height}; "
        f"bytes={len(raw)}; cell_width={image.width // len(LOGOS)}"
    )
    return image


def color_distance(a, b) -> float:
    return ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2) ** 0.5


def make_background_transparent(cell: Image.Image) -> Image.Image:
    rgba = cell.convert("RGBA")
    width, height = rgba.size
    pixels = rgba.load()

    border = []
    for x in range(width):
        border.extend((pixels[x, 0], pixels[x, height - 1]))
    for y in range(height):
        border.extend((pixels[0, y], pixels[width - 1, y]))

    transparent_share = sum(1 for p in border if p[3] <= 20) / max(1, len(border))
    if transparent_share >= 0.60:
        return rgba

    opaque = [p for p in border if p[3] >= 180]
    if not opaque:
        return rgba

    channels = list(zip(*[(p[0], p[1], p[2]) for p in opaque]))
    background = tuple(sorted(channel)[len(channel) // 2] for channel in channels)
    deviations = sorted(color_distance(p, background) for p in opaque)
    p90 = deviations[int((len(deviations) - 1) * 0.90)]

    neutral_light = max(background) - min(background) <= 45 and min(background) >= 130
    uniform = p90 <= 28
    if not (neutral_light or uniform):
        raise RuntimeError(
            f"Could not safely identify edge background: bg={background}, p90={p90:.1f}"
        )

    threshold = 74 if neutral_light else 44
    seen = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def add(x: int, y: int) -> None:
        idx = y * width + x
        if seen[idx]:
            return
        seen[idx] = 1
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
        if x > 0:
            add(x - 1, y)
        if x + 1 < width:
            add(x + 1, y)
        if y > 0:
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
        raise RuntimeError(f"Invalid logo asset dimensions/content: {path.name} {image.size}")
    if alpha_min != 0 or alpha_max == 0:
        raise RuntimeError(
            f"Asset does not contain real alpha transparency: {path.name} alpha={alpha_min}-{alpha_max}"
        )
    if any(corners):
        raise RuntimeError(f"Asset corners are not transparent: {path.name} corners={corners}")

    print(
        f"VALID ASSET {path.name}: {image.width}x{image.height}; "
        f"alpha={alpha_min}-{alpha_max}; corners={corners}; visible_bbox={bbox}"
    )


def all_final_assets_valid() -> bool:
    try:
        for _name, slug in LOGOS:
            path = OUT / f"{slug}.png"
            if not path.exists():
                return False
            validate_png(path)
        return True
    except Exception as exc:
        print(f"FINAL ASSET CHECK: {exc}")
        return False


def extract_individual_assets() -> None:
    strip = load_consistent_legacy_strip()
    cell_width = strip.width // len(LOGOS)

    for index, (name, slug) in enumerate(LOGOS):
        left = index * cell_width
        right = left + cell_width
        cell = strip.crop((left, 0, right, strip.height))
        cell = make_background_transparent(cell)

        alpha = cell.getchannel("A")
        bbox = alpha.point(lambda a: 255 if a >= 12 else 0).getbbox()
        if not bbox:
            raise RuntimeError(f"No visible pixels found in source cell for {name}")

        logo = cell.crop(bbox)
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
        print(f"EXTRACTED {index + 1:02d}/09 {name} -> {destination.relative_to(ROOT)}")


def write_component() -> None:
    rows = "\n".join(
        f'  {{ name: "{name}", src: "/client-logos/{slug}.png" }},'
        for name, slug in LOGOS
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
    content = '''.client-logos {
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

  .client-logos-group[data-clone="true"] {
    display: none;
  }
}
'''
    (ROOT / "src/components/site/client-logos.css").write_text(content, encoding="utf-8")


def cleanup_legacy_assets() -> None:
    expected = {f"{slug}.png" for _name, slug in LOGOS}
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

    if CHUNKS_DIR.exists():
        shutil.rmtree(CHUNKS_DIR)


if not all_final_assets_valid():
    extract_individual_assets()
else:
    print("Nine final local PNG assets already exist and pass alpha validation.")

write_component()
write_css()
cleanup_legacy_assets()

for _name, slug in LOGOS:
    validate_png(OUT / f"{slug}.png")

print("Generated 9 independent local PNG client logos with verified alpha transparency.")
