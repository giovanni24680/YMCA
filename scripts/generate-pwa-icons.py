from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


def try_font(size: int):
    candidates = [
        r"C:\Windows\Fonts\Times New Roman.ttf",
        r"C:\Windows\Fonts\times.ttf",
        r"C:\Windows\Fonts\georgia.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
    ]
    for p in candidates:
        try:
            return ImageFont.truetype(p, size=size)
        except Exception:
            continue
    return ImageFont.load_default()


def draw_tile(size: int, *, maskable: bool) -> Image.Image:
    bg = (26, 18, 16, 255)
    paper = (245, 236, 224, 255)
    gold = (218, 168, 64, 255)
    bronze = (194, 117, 58, 255)

    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    pad = int(round(size * (0.18 if maskable else 0.08)))
    draw.rounded_rectangle([pad, pad, size - pad, size - pad], radius=int(size * 0.22), fill=bg)

    ring_inset = int(size * 0.18)
    draw.arc(
        [ring_inset, ring_inset, size - ring_inset, size - ring_inset],
        start=200,
        end=520,
        fill=gold,
        width=max(3, size // 64),
    )

    font = try_font(max(18, int(size * 0.18)))
    text = "Oulm"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(((size - tw) // 2, (size - th) // 2 - int(size * 0.02)), text, fill=paper, font=font)

    dot_r = max(3, size // 90)
    draw.ellipse(
        [
            int(size * 0.78) - dot_r,
            int(size * 0.22) - dot_r,
            int(size * 0.78) + dot_r,
            int(size * 0.22) + dot_r,
        ],
        fill=bronze,
    )

    return img


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    out = root / "assets" / "icons"
    out.mkdir(parents=True, exist_ok=True)

    for s in (192, 512):
        draw_tile(s, maskable=False).convert("RGB").save(out / f"icon-{s}.png", optimize=True)

    draw_tile(512, maskable=True).convert("RGB").save(out / "icon-512-maskable.png", optimize=True)

    img32 = draw_tile(64, maskable=False).resize((32, 32), Image.Resampling.LANCZOS)
    img32.convert("RGB").save(out / "favicon-32.png", optimize=True)


if __name__ == "__main__":
    main()
