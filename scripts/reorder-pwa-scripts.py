from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

REPLACEMENTS = [
    (
        "<script type=\"module\" src=\"assets/js/app.js\"></script>\n    <script src=\"register-sw.js\" defer></script>",
        "<script src=\"register-sw.js\" defer></script>\n<script type=\"module\" src=\"assets/js/app.js\"></script>",
    ),
    (
        "<script src=\"https://unpkg.com/leaflet@1.9.4/dist/leaflet.js\"></script>\n<script type=\"module\" src=\"assets/js/app.js\"></script>\n    <script src=\"register-sw.js\" defer></script>",
        "<script src=\"register-sw.js\" defer></script>\n<script src=\"https://unpkg.com/leaflet@1.9.4/dist/leaflet.js\"></script>\n<script type=\"module\" src=\"assets/js/app.js\"></script>",
    ),
    (
        "    <script type=\"module\" src=\"main.js\"></script>\n    <script src=\"register-sw.js\" defer></script>",
        "    <script src=\"register-sw.js\" defer></script>\n    <script type=\"module\" src=\"main.js\"></script>",
    ),
]


def main() -> None:
    for p in ROOT.glob("*.html"):
        text = p.read_text(encoding="utf-8")
        orig = text
        for a, b in REPLACEMENTS:
            text = text.replace(a, b)
        if text != orig:
            p.write_text(text, encoding="utf-8")
            print("reordered", p.name)


if __name__ == "__main__":
    main()
