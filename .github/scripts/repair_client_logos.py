from __future__ import annotations

import io
import re
import shutil
import unicodedata
from collections import deque
from pathlib import Path
from urllib.parse import urljoin, urlparse, urlunparse

import requests
from bs4 import BeautifulSoup
from PIL import Image

ROOT = Path.cwd()
OUT = ROOT / "public" / "client-logos"
OUT.mkdir(parents=True, exist_ok=True)

TARGETS = [
    ("Claro", "claro", ["CLARO", "claro"]),
    ("NET", "net", ["net", "net-1"]),
    ("Megasom", "megasom", ["Logo Megasom sem fundo", "megasom"]),
    ("Leo Madeiras", "leo-madeiras", ["LEO MADEIRAS", "leo madeiras"]),
    ("Procria", "procria", ["procria"]),
    ("LEGO", "lego", ["LEGO"]),
    ("Maxvinil", "maxvinil", ["MAXVINIL", "maxvinil"]),
    ("Tupperware", "tupperware", ["TUPPERWARE", "tupperware"]),
    ("Águas de Sorriso", "aguas-de-sorriso", ["AGUAS DE SORRISO", "aguas de sorriso"]),
    ("Aliança", "alianca", ["ALIANÇA", "alianca"]),
    ("Campo Solar", "campo-solar", ["CAMPO SOLAR", "campo solar"]),
    ("Cobertura Imasa", "cobertura-imasa", ["COBERTURA IMASA", "cobertura imasa"]),
    ("Eletricidade Paraense", "eletricidade-paraense", ["ELETRICIDADE PARAENSE", "eletricidade paraense"]),
    ("Fatex", "fatex", ["FATEX", "fatex"]),
    ("Frota", "frota", ["FROTA", "frota"]),
    ("Octech", "octech", ["OCTECH", "octech"]),
    ("Pantanal", "pantanal", ["PANTANAL", "pantanal"]),
    ("Tempermat", "tempermat", ["TEMPERMAT", "tempermat"]),
    ("Prime Lente", "prime-lente", ["prime-lente-logo-gradual", "prime lente"]),
    ("Trevo", "trevo", ["trevo"]),
]

PAGE_URL = "https://calibergestao.com.br/"


def norm(value: str) -> str:
    value = unicodedata.normalize("NFKD", value or "")
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    value = value.lower().replace("-", " ").replace("_", " ")
    return re.sub(r"[^a-z0-9]+", " ", value).strip()


session = requests.Session()
session.headers.update(
    {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/140 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    }
)

page = session.get(PAGE_URL, timeout=45)
page.raise_for_status()
soup = BeautifulSoup(page.text, "html.parser")


def add_unique(values: list[str], value: str | None) -> None:
    if value and value not in values:
        values.append(value)


def image_urls(img) -> list[str]:
    urls: list[str] = []
    for attr in ("data-lazy-src", "data-src", "data-original", "src"):
        value = img.get(attr)
        if value and not value.startswith("data:"):
            add_unique(urls, urljoin(PAGE_URL, value))
    for attr in ("data-lazy-srcset", "data-srcset", "srcset"):
        value = img.get(attr)
        if value:
            for item in value.split(","):
                candidate = item.strip().split()[0] if item.strip() else ""
                if candidate and not candidate.startswith("data:"):
                    add_unique(urls, urljoin(PAGE_URL, candidate))

    expanded: list[str] = []
    for url in urls:
        add_unique(expanded, url)
        parsed = urlparse(url)
        if parsed.hostname and parsed.hostname.endswith("wp.com") and "calibergestao.com.br/" in parsed.path:
            marker = parsed.path.find("calibergestao.com.br/")
            origin_path = "/" + parsed.path[marker + len("calibergestao.com.br/") :]
            add_unique(
                expanded,
                urlunparse(("https", "calibergestao.com.br", origin_path, "", "", "")),
            )
        add_unique(
            expanded,
            urlunparse((parsed.scheme, parsed.netloc, parsed.path, "", "", "")),
        )
    return expanded


IMAGE_RECORDS = []
for img in soup.find_all("img"):
    alt = (img.get("alt") or "").strip()
    title = (img.get("title") or "").strip()
    urls = image_urls(img)
    descriptor = norm(" ".join([alt, title, " ".join(urls)]))
    IMAGE_RECORDS.append((img, alt, title, urls, descriptor))


def wp_media_urls(search_term: str) -> list[str]:
    urls: list[str] = []
    try:
        response = session.get(
            "https://calibergestao.com.br/wp-json/wp/v2/media",
            params={"search": search_term, "per_page": 50},
            timeout=45,
        )
        if not response.ok:
            return urls
        for media in response.json():
            source_url = media.get("source_url")
            if source_url:
                add_unique(urls, source_url)
            details = media.get("media_details") or {}
            sizes = details.get("sizes") or {}
            for size in sizes.values():
                if isinstance(size, dict):
                    add_unique(urls, size.get("source_url"))
    except Exception as exc:
        print(f"WARN WP media search {search_term!r}: {exc}")
    return urls


def candidate_urls(aliases: list[str]) -> list[str]:
    scored: list[tuple[int, str]] = []
    aliases_n = [norm(alias) for alias in aliases if alias]
    for _img, alt, title, urls, descriptor in IMAGE_RECORDS:
        alt_n = norm(alt)
        title_n = norm(title)
        for alias_n in aliases_n:
            score = 0
            if alt_n == alias_n:
                score = 120
            elif title_n == alias_n:
                score = 110
            elif alias_n and alias_n in alt_n:
                score = 95
            elif alias_n and alias_n in title_n:
                score = 90
            elif alias_n and alias_n in descriptor:
                score = 65
            if score:
                for url in urls:
                    scored.append((score, url))

    for alias in aliases:
        for url in wp_media_urls(alias):
            scored.append((55, url))

    scored.sort(key=lambda item: item[0], reverse=True)
    result: list[str] = []
    for _score, url in scored:
        parsed = urlparse(url)
        variants = [url]
        if parsed.hostname and parsed.hostname.endswith("wp.com") and "calibergestao.com.br/" in parsed.path:
            marker = parsed.path.find("calibergestao.com.br/")
            origin_path = "/" + parsed.path[marker + len("calibergestao.com.br/") :]
            variants.append(
                urlunparse(("https", "calibergestao.com.br", origin_path, "", "", ""))
            )
        variants.append(
            urlunparse((parsed.scheme, parsed.netloc, parsed.path, "", "", ""))
        )
        for variant in variants:
            add_unique(result, variant)
    return result


def fetch_image(aliases: list[str], display: str) -> tuple[bytes, str]:
    errors: list[str] = []
    candidates = candidate_urls(aliases)
    if not candidates:
        raise RuntimeError(f"No image candidates found for {display}: {aliases}")
    for url in candidates:
        try:
            response = session.get(url, timeout=45, headers={"Referer": PAGE_URL})
            response.raise_for_status()
            if len(response.content) < 100:
                raise RuntimeError(f"image too small ({len(response.content)} bytes)")
            probe = Image.open(io.BytesIO(response.content))
            probe.verify()
            print(f"FETCH {display}: {url} ({len(response.content)} bytes)")
            return response.content, url
        except Exception as exc:
            errors.append(f"{url}: {exc}")
    raise RuntimeError(
        f"Could not download {display}. Attempts: " + " | ".join(errors[-15:])
    )


def make_transparent_png(raw: bytes, dest: Path) -> None:
    image = Image.open(io.BytesIO(raw))
    image.load()
    rgba = image.convert("RGBA")
    width, height = rgba.size
    pixels = rgba.load()
    alpha_min, _alpha_max = rgba.getchannel("A").getextrema()

    if alpha_min >= 245:
        border: list[tuple[int, int, int]] = []
        for x in range(width):
            border.append(pixels[x, 0][:3])
            border.append(pixels[x, height - 1][:3])
        for y in range(height):
            border.append(pixels[0, y][:3])
            border.append(pixels[width - 1, y][:3])

        background = tuple(
            sorted(c[i] for c in border)[len(border) // 2] for i in range(3)
        )
        deviations = sorted(
            sum(abs(c[i] - background[i]) for i in range(3)) / 3 for c in border
        )
        uniform_border = deviations[int(len(deviations) * 0.90)] < 28
        near_white = min(background) >= 218

        if uniform_border or near_white:
            threshold = 64 if near_white else 44
            seen = bytearray(width * height)
            queue: deque[tuple[int, int]] = deque()

            def add(x: int, y: int) -> None:
                index = y * width + x
                if seen[index]:
                    return
                r, g, b, _a = pixels[x, y]
                distance = (
                    (r - background[0]) ** 2
                    + (g - background[1]) ** 2
                    + (b - background[2]) ** 2
                ) ** 0.5
                if distance <= threshold or (near_white and min(r, g, b) >= 242):
                    seen[index] = 1
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

    alpha = rgba.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        raise RuntimeError(f"No visible pixels left in {dest.name}")

    rgba = rgba.crop(bbox)
    pad = max(10, round(max(rgba.size) * 0.05))
    canvas = Image.new(
        "RGBA",
        (rgba.width + pad * 2, rgba.height + pad * 2),
        (0, 0, 0, 0),
    )
    canvas.alpha_composite(rgba, (pad, pad))
    canvas.save(dest, "PNG", optimize=True)

    verify = Image.open(dest).convert("RGBA")
    min_alpha, max_alpha = verify.getchannel("A").getextrema()
    corners = [
        verify.getpixel((0, 0))[3],
        verify.getpixel((verify.width - 1, 0))[3],
        verify.getpixel((0, verify.height - 1))[3],
        verify.getpixel((verify.width - 1, verify.height - 1))[3],
    ]
    if min_alpha != 0 or max_alpha == 0 or any(corners):
        raise RuntimeError(
            f"Transparency validation failed for {dest.name}: "
            f"alpha={min_alpha}-{max_alpha}, corners={corners}"
        )
    print(
        f"ASSET {dest.name}: {verify.width}x{verify.height}, "
        f"alpha={min_alpha}-{max_alpha}"
    )


resolved_sources: list[tuple[str, str, str]] = []
for display, slug, aliases in TARGETS:
    raw, source_url = fetch_image(aliases, display)
    dest = OUT / f"{slug}.png"
    make_transparent_png(raw, dest)
    resolved_sources.append((display, slug, source_url))

keep = {f"{slug}.png" for _display, slug, _aliases in TARGETS}
for path in OUT.iterdir():
    if path.is_file() and path.name not in keep:
        path.unlink()

tsx_lines = [
    'import "./client-logos.css";',
    "",
    "const clientLogos = [",
]
for display, slug, _source in resolved_sources:
    safe_name = display.replace("\\", "\\\\").replace('"', '\\"')
    tsx_lines.append(
        f'  {{ name: "{safe_name}", src: "/client-logos/{slug}.png" }},'
    )
tsx_lines += [
    "] as const;",
    "",
    "function LogoGroup({ clone = false }: { clone?: boolean }) {",
    "  return (",
    '    <div className="client-logos-group" aria-hidden={clone || undefined} data-clone={clone || undefined}>',
    "      {clientLogos.map((logo) => (",
    '        <div className="client-logo-item" key={`${clone ? "clone-" : ""}${logo.name}`}>',
    "          <img",
    "            src={logo.src}",
    '            alt={clone ? "" : logo.name}',
    "            aria-hidden={clone || undefined}",
    '            decoding="async"',
    "            draggable={false}",
    "          />",
    "        </div>",
    "      ))}",
    "    </div>",
    "  );",
    "}",
    "",
    'export function ClientLogos({ className = "" }: { className?: string }) {',
    "  return (",
    '    <section className={`client-logos ${className}`} aria-label="Parceiros e clientes da Cáliber">',
    '      <div className="client-logos-heading">',
    "        <span>Algumas das empresas que confiam no nosso trabalho</span>",
    "        <h3>Parceiros &amp; Clientes</h3>",
    "      </div>",
    "",
    '      <div className="client-logos-viewport">',
    '        <div className="client-logos-track">',
    "          <LogoGroup />",
    "          <LogoGroup clone />",
    "        </div>",
    "      </div>",
    "    </section>",
    "  );",
    "}",
    "",
]
(ROOT / "src/components/site/client-logos.tsx").write_text(
    "\n".join(tsx_lines), encoding="utf-8"
)

css = r'''.client-logos {
  position: relative;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
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
  letter-spacing: 0.24em;
  line-height: 1.55;
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
  margin-top: 38px;
  overflow: hidden;
  background: transparent;
  mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent);
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent);
}

.client-logos-track {
  display: flex;
  width: max-content;
  align-items: center;
  animation: client-logos-marquee 58s linear infinite;
  will-change: transform;
}

.client-logos-group {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: clamp(40px, 4.2vw, 72px);
  padding-right: clamp(40px, 4.2vw, 72px);
}

.client-logo-item {
  display: flex;
  width: clamp(118px, 11vw, 168px);
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

@media (hover: hover) and (pointer: fine) {
  .client-logos-viewport:hover .client-logos-track {
    animation-play-state: paused;
  }
}

@keyframes client-logos-marquee {
  from { transform: translate3d(-50%, 0, 0); }
  to { transform: translate3d(0, 0, 0); }
}

@media (max-width: 720px) {
  .client-logos-heading { padding-inline: 14px; }
  .client-logos-heading > span {
    max-width: 330px;
    font-size: 9px;
    letter-spacing: 0.17em;
  }
  .client-logos-heading h3 {
    max-width: 340px;
    margin-top: 12px;
    font-size: clamp(32px, 10vw, 42px);
  }
  .client-logos-viewport {
    margin-top: 28px;
    mask-image: linear-gradient(90deg, transparent, #000 3%, #000 97%, transparent);
    -webkit-mask-image: linear-gradient(90deg, transparent, #000 3%, #000 97%, transparent);
  }
  .client-logos-track { animation-duration: 52s; }
  .client-logos-group { gap: 28px; padding-right: 28px; }
  .client-logo-item { width: 108px; height: 60px; }
  .client-logo-item img { max-height: 52px; }
}

@media (prefers-reduced-motion: reduce) {
  .client-logos-viewport {
    overflow: hidden;
    mask-image: none;
    -webkit-mask-image: none;
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

obsolete_files = [
    ROOT / "src/assets/client-logo-transparent-webp-base64.ts",
    ROOT / "src/components/site/client-logos-local.ts",
    ROOT / "src/components/site/client-logos-strip-placeholder.txt",
]
for path in obsolete_files:
    if path.exists():
        path.unlink()

chunks = ROOT / "src/assets/client-logo-strip"
if chunks.exists():
    shutil.rmtree(chunks)

print(f"Generated {len(TARGETS)} individual local logo assets.")
for display, _slug, source_url in resolved_sources:
    print(f"SOURCE {display}: {source_url}")
