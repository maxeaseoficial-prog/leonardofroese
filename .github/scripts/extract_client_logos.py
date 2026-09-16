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

TARGETS = [
    ("Claro", "claro"),
    ("NET", "net"),
    ("Megasom", "megasom"),
    ("Leo Madeiras", "leo-madeiras"),
    ("Procria", "procria"),
    ("LEGO", "lego"),
    ("Maxvinil", "maxvinil"),
    ("Tupperware", "tupperware"),
    ("Águas de Sorriso", "aguas-de-sorriso"),
    ("Aliança", "alianca"),
    ("Campo Solar", "campo-solar"),
    ("Cobertura Imasa", "cobertura-imasa"),
    ("Eletricidade Paraense", "eletricidade-paraense"),
    ("Fatex", "fatex"),
    ("Frota", "frota"),
    ("Octech", "octech"),
    ("Pantanal", "pantanal"),
    ("Tempermat", "tempermat"),
    ("Prime Lente", "prime-lente"),
    ("Trevo", "trevo"),
]


def load_strip() -> Image.Image:
    # Prefer the larger WebP that was embedded by the previous implementation.
    # It is used only as a migration source and is deleted after extraction.
    ts_path = ROOT / "src/assets/client-logo-transparent-webp-base64.ts"
    if ts_path.exists():
        text = ts_path.read_text(encoding="utf-8")
        match = re.search(r'Base64\s*=\s*"([A-Za-z0-9+/=]+)"', text)
        if match:
            raw = base64.b64decode(match.group(1))
            image = Image.open(io.BytesIO(raw)).convert("RGBA")
            image.load()
            print(f"SOURCE {ts_path}: {image.width}x{image.height} mode={image.mode}")
            return image

    b64_path = OUT / "clients-strip.b64.txt"
    if b64_path.exists():
        encoded = re.sub(r"\s+", "", b64_path.read_text(encoding="utf-8"))
        raw = base64.b64decode(encoded)
        image = Image.open(io.BytesIO(raw)).convert("RGBA")
        image.load()
        print(f"SOURCE {b64_path}: {image.width}x{image.height} mode={image.mode}")
        return image

    raise RuntimeError("No legacy client-logo strip source found")


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

    # The old strip used either transparent pixels or a neutral white/gray field.
    neutral = max(background) - min(background) <= 38
    light = min(background) >= 150
    uniform = p90 <= 34
    if not ((neutral and light) or uniform):
        raise RuntimeError(
            f"Could not identify a removable edge background: bg={background} p90={p90:.1f}"
        )

    threshold = 78 if neutral and light else 46
    seen = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def add(x: int, y: int) -> None:
        idx = y * width + x
        if seen[idx]:
            return
        seen[idx] = 1
        pixel = pixels[x, y]
        if pixel[3] <= 30 or color_distance(pixel, background) <= threshold:
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


def finish_asset(slot: Image.Image, destination: Path) -> None:
    slot = remove_edge_background(slot)
    bbox = slot.getchannel("A").getbbox()
    if not bbox:
        raise RuntimeError(f"No visible logo pixels in {destination.name}")
    logo = slot.crop(bbox)

    # Resize only with standard Lanczos so the browser never has to enlarge the
    # small source aggressively. This does not redraw or alter the brand.
    if logo.width < 220 and logo.height < 160:
        scale = min(3.0, 240 / max(1, logo.width), 180 / max(1, logo.height))
        if scale > 1.05:
            logo = logo.resize(
                (max(1, round(logo.width * scale)), max(1, round(logo.height * scale))),
                Image.Resampling.LANCZOS,
            )

    pad = max(12, round(max(logo.size) * 0.06))
    canvas = Image.new("RGBA", (logo.width + pad * 2, logo.height + pad * 2), (0, 0, 0, 0))
    canvas.alpha_composite(logo, (pad, pad))
    canvas.save(destination, "PNG", optimize=True)

    verify = Image.open(destination).convert("RGBA")
    amin, amax = verify.getchannel("A").getextrema()
    corners = [
        verify.getpixel((0, 0))[3],
        verify.getpixel((verify.width - 1, 0))[3],
        verify.getpixel((0, verify.height - 1))[3],
        verify.getpixel((verify.width - 1, verify.height - 1))[3],
    ]
    bbox2 = verify.getchannel("A").getbbox()
    if amin != 0 or amax == 0 or any(corners) or not bbox2:
        raise RuntimeError(
            f"Transparency validation failed for {destination.name}: alpha={amin}-{amax}, corners={corners}"
        )
    print(
        f"ASSET {destination.name}: {verify.width}x{verify.height} alpha={amin}-{amax} "
        f"corners={corners} visible_bbox={bbox2}"
    )


def generate_component() -> None:
    items = "\n".join(
        f'  {{ name: "{display}", src: "/client-logos/{slug}.png" }},'
        for display, slug in TARGETS
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


def generate_css() -> None:
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
  .client-logos-heading > span { max-width: 330px; font-size: 9px; letter-spacing: .16em; }
  .client-logos-heading h3 { max-width: 340px; margin-top: 12px; font-size: clamp(32px, 10vw, 42px); }
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
  .client-logos-viewport { overflow: hidden; -webkit-mask-image: none; mask-image: none; }
  .client-logos-track { width: 100%; max-width: 100%; animation: none; transform: none; will-change: auto; }
  .client-logos-group { width: 100%; flex-wrap: wrap; justify-content: center; gap: 28px 38px; padding-right: 0; }
  .client-logos-group[data-clone="true"] { display: none; }
}
'''
    (ROOT / "src/components/site/client-logos.css").write_text(css, encoding="utf-8")


strip = load_strip()
count = len(TARGETS)
if strip.width % count != 0:
    raise RuntimeError(
        f"Legacy strip width {strip.width} is not divisible by the expected {count} logos"
    )
slot_width = strip.width // count
print(f"SPLIT {strip.width}x{strip.height}: {count} slots of {slot_width}x{strip.height}")

expected: set[str] = set()
for index, (display, slug) in enumerate(TARGETS):
    left = index * slot_width
    slot = strip.crop((left, 0, left + slot_width, strip.height))
    destination = OUT / f"{slug}.png"
    finish_asset(slot, destination)
    expected.add(destination.name)
    print(f"DONE {index + 1:02d}/{count}: {display} -> {destination.relative_to(ROOT)}")

# Remove the old strip and every obsolete generated file from the public folder.
for path in OUT.iterdir():
    if path.is_file() and path.name not in expected:
        path.unlink()

generate_component()
generate_css()

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

print(f"Generated {count} independent transparent PNG assets and removed all strip-based runtime assets.")
