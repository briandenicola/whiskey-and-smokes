"""
Screenshot Recorder for Drinks & Desserts

Opens a Chromium browser and automatically captures a full-page screenshot
every time you navigate to a new page. Browse the app normally and all
screens are saved to ./screenshots/.

Prerequisites:
    pip install playwright
    playwright install chromium

Usage:
    python scripts/screenshot-recorder.py [--url URL] [--viewport mobile|desktop] [--output DIR]

Examples:
    python scripts/screenshot-recorder.py
    python scripts/screenshot-recorder.py --viewport desktop
    python scripts/screenshot-recorder.py --url http://localhost:8080 --output docs/images
"""

import argparse
import asyncio
import os
import re

from playwright.async_api import async_playwright

VIEWPORTS = {
    "mobile": {"width": 390, "height": 844, "scale": 2},
    "desktop": {"width": 1280, "height": 800, "scale": 1},
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Auto-capture screenshots while browsing")
    parser.add_argument("--url", default="http://localhost:5173", help="App URL (default: http://localhost:5173)")
    parser.add_argument("--viewport", choices=["mobile", "desktop"], default="mobile", help="Viewport preset (default: mobile)")
    parser.add_argument("--output", default="./screenshots", help="Output directory (default: ./screenshots)")
    return parser.parse_args()


async def main() -> None:
    args = parse_args()
    vp = VIEWPORTS[args.viewport]
    output_dir = args.output

    os.makedirs(output_dir, exist_ok=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(
            viewport={"width": vp["width"], "height": vp["height"]},
            device_scale_factor=vp["scale"],
        )
        page = await context.new_page()

        counter = [0]

        def on_navigation(frame):
            if frame != page.main_frame:
                return
            counter[0] += 1
            asyncio.ensure_future(take_screenshot(page, counter[0]))

        async def take_screenshot(pg, idx):
            await pg.wait_for_load_state("networkidle")
            await asyncio.sleep(0.5)  # let animations settle
            path_part = pg.url.replace(args.url, "").strip("/") or "home"
            safe_name = re.sub(r"[^\w\-]", "_", path_part)
            filename = f"{idx:03d}_{args.viewport}_{safe_name}.png"
            filepath = os.path.join(output_dir, filename)
            await pg.screenshot(path=filepath, full_page=True)
            print(f"  Saved: {filename}")

        page.on("framenavigated", on_navigation)

        await page.goto(args.url)
        print(f"Viewport: {args.viewport} ({vp['width']}x{vp['height']})")
        print(f"Output:   {os.path.abspath(output_dir)}")
        print(f"URL:      {args.url}")
        print()
        print("Browse the app. Screenshots auto-save on each navigation.")
        print("Press Ctrl+C in this terminal when done.")
        print()

        try:
            while True:
                await asyncio.sleep(1)
        except KeyboardInterrupt:
            print("\nDone. Closing browser.")

        await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
