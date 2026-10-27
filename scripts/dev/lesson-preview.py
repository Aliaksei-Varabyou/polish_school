#!/usr/bin/env python3
"""Render one history lesson without the portal: bundle it with esbuild, open it in headless
Chromium with the built Tailwind stylesheet, click every button and push every slider, and save a
full-page screenshot. Reports page errors. Usage:

  python3 scripts/dev/lesson-preview.py packages/trainers/history/src/web/lessons/ch1/DiscoveriesLesson.tsx out.png [ru|pl] [width]

Needs `npm run build -w @portal/web` to have run once (for the stylesheet)."""
import asyncio, glob, os, subprocess, sys, tempfile
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
lesson, out = os.path.abspath(sys.argv[1]), os.path.abspath(sys.argv[2])
lang = sys.argv[3] if len(sys.argv) > 3 else "ru"
width = int(sys.argv[4]) if len(sys.argv) > 4 else 900
css = sorted(glob.glob(f"{ROOT}/apps/web/dist/assets/index-*.css"))
if not css:
    sys.exit("no built stylesheet: run `npm run build -w @portal/web` first")

work = tempfile.mkdtemp(prefix="lesson-preview-")
entry = os.path.join(work, "entry.tsx")
with open(entry, "w") as f:
    f.write(f'''import {{ createRoot }} from "react-dom/client";
import {{ Suspense }} from "react";
import Lesson from "{lesson}";
createRoot(document.getElementById("root")!).render(<div className="mx-auto max-w-3xl p-4"><Suspense fallback="…"><Lesson lang="{lang}" /></Suspense></div>);
''')
subprocess.run([f"{ROOT}/node_modules/.bin/esbuild", entry, "--bundle", f"--outfile={work}/bundle.js", "--jsx=automatic",
                "--loader:.tsx=tsx", "--loader:.json=json", '--define:process.env.NODE_ENV="production"', "--log-level=warning"],
               check=True, env={**os.environ, "NODE_PATH": f"{ROOT}/node_modules"}, cwd=ROOT)
with open(f"{work}/index.html", "w") as f:
    f.write(f'<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="file://{css[-1]}">'
            '<style>*{animation:none!important;transition:none!important}</style></head>'
            '<body class="bg-slate-50 text-slate-800"><div id="root"></div><script src="bundle.js"></script></body></html>')

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width": width, "height": 900})
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("console", lambda m: m.type == "error" and errs.append(m.text[:300]))
        await pg.goto(f"file://{work}/index.html")
        await pg.wait_for_timeout(500)
        await pg.screenshot(path=out, full_page=True)
        # poke everything: every button a few times, every slider to its end
        for _ in range(3):
            buttons = pg.locator("button:enabled, [role=button]")
            n = await buttons.count()
            for i in range(n):
                try:
                    await buttons.nth(i).click(timeout=1500, force=True)
                except Exception:
                    pass
        sliders = pg.locator("input[type=range]")
        for i in range(await sliders.count()):
            s = sliders.nth(i)
            await s.evaluate("el => { el.value = el.max; el.dispatchEvent(new Event('input', {bubbles:true})); el.dispatchEvent(new Event('change', {bubbles:true})); }")
        await pg.wait_for_timeout(300)
        await pg.screenshot(path=out.replace(".png", "-after.png"), full_page=True)
        sections = await pg.locator("section[id]").count()
        print(f"sections: {sections}; buttons clicked: {n}; errors: {errs}")
        await b.close()
        if errs:
            sys.exit(1)

asyncio.run(main())
