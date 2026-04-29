# Screenshot Guide

Capture screenshots of the Drinks & Desserts app automatically while you browse. Useful for generating documentation images.

## Prerequisites

```bash
pip install playwright
playwright install chromium
```

## Usage

Start the app locally, then run the recorder in a separate terminal:

```bash
# Mobile viewport (default — iPhone 14 size, 390x844 @2x)
python scripts/screenshot-recorder.py

# Desktop viewport (1280x800)
python scripts/screenshot-recorder.py --viewport desktop

# Custom URL and output directory
python scripts/screenshot-recorder.py --url http://localhost:8080 --output docs/images
```

A real Chromium window opens at the app URL. **Every time you navigate** to a new page, a full-page screenshot is automatically saved.

Press **Ctrl+C** in the terminal when you're done.

## Output

Screenshots are saved to `./screenshots/` (or your `--output` directory) with sequential naming:

```
001_mobile_home.png
002_mobile_items.png
003_mobile_items_abc123.png
004_mobile_capture.png
```

## Tips

- Run twice (once with `--viewport mobile`, once with `--viewport desktop`) for responsive documentation
- Screenshots include the full scrollable page, not just the visible viewport
- The recorder waits for network idle + 0.5s before capturing, so dynamic content should be loaded
- Add `screenshots/` to `.gitignore` to avoid committing large image files
