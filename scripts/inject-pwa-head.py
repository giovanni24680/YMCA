from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

PWA_BLOCK = """    <meta name="description" content="Oulm by One YMCA — community Homebase, events, hosting, and county venues across Hertfordshire, Bedfordshire, and Buckinghamshire.">
    <link rel="manifest" href="site.webmanifest">
    <meta name="theme-color" content="#1a1210">
    <meta name="application-name" content="Oulm">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-title" content="Oulm">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <link rel="apple-touch-icon" href="assets/icons/icon-192.png">
    <link rel="icon" type="image/png" sizes="32x32" href="assets/icons/favicon-32.png">
"""

REGISTER = "    <script src=\"register-sw.js\" defer></script>\n"

FILES = [
    "index.html",
    "homebase.html",
    "events.html",
    "event-detail.html",
    "rsvp.html",
    "onboarding.html",
    "map.html",
    "host.html",
    "booking.html",
    "progress.html",
    "partners.html",
    "about.html",
    "wireframes.html",
]


def inject(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    if "site.webmanifest" in text:
        return False

    v1 = "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, viewport-fit=cover\">\n"
    v2 = "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n"

    if v1 in text:
        text = text.replace(v1, v1 + PWA_BLOCK, 1)
    elif v2 in text:
        text = text.replace(v2, v2 + PWA_BLOCK, 1)
    else:
        raise RuntimeError(f"No viewport meta found: {path}")

    if "register-sw.js" not in text:
        if "</body>" not in text:
            raise RuntimeError(f"No </body>: {path}")
        text = text.replace("</body>", REGISTER + "</body>", 1)

    path.write_text(text, encoding="utf-8")
    return True


def main() -> None:
    changed = 0
    for name in FILES:
        p = ROOT / name
        if not p.exists():
            continue
        if inject(p):
            changed += 1
    print(f"updated {changed} files")


if __name__ == "__main__":
    main()
