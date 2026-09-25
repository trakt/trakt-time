/**
 * PWA install-prompt screenshot generator.
 *
 * Captures the three unauth-friendly surfaces (discover, movie summary,
 * show summary) at the two viewport sizes the manifest declares, then
 * writes them into static/pwa/screenshots/ as webp.
 *
 * Run manually whenever the UI shifts:
 *
 *   # terminal 1
 *   deno task client:dev
 *
 *   # terminal 2 — once the dev server reports "ready"
 *   deno task client:pwa:screenshots
 *
 * The dev server URL can be overridden with PWA_SCREENSHOT_URL.
 */

import { spawn } from 'node:child_process';
import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const BASE_URL = process.env.PWA_SCREENSHOT_URL ?? 'http://localhost:5173';
const OUT_DIR = './static/pwa/screenshots';

type Orientation = 'portrait' | 'wide';

const VIEWPORTS: Record<Orientation, { width: number; height: number }> = {
  portrait: { width: 778, height: 1738 },
  wide: { width: 1298, height: 902 },
};

const ROUTES: ReadonlyArray<{ name: string; path: string }> = [
  { name: 'discover', path: '/discover' },
  // Picked for stability — both have lived on Trakt for over a decade and are
  // unlikely to disappear. Override with care if you swap them.
  { name: 'movie', path: '/movies/the-matrix-1999' },
  { name: 'show', path: '/shows/breaking-bad' },
];

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  console.log(`Capturing screenshots from ${BASE_URL}…`);

  try {
    for (const [orientation, viewport] of Object.entries(VIEWPORTS) as Array<
      [Orientation, typeof VIEWPORTS[Orientation]]
    >) {
      const context = await browser.newContext({
        viewport,
        deviceScaleFactor: 2,
      });

      for (const route of ROUTES) {
        const page = await context.newPage();
        const url = `${BASE_URL}${route.path}`;
        console.log(`  ${orientation}  ${route.name}  →  ${url}`);
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });

        // One extra frame so any post-load animations settle.
        await page.waitForTimeout(500);

        // Playwright only emits png/jpeg natively; we capture PNG, then
        // shell out to ImageMagick to convert to webp so the manifest's
        // existing `type: image/webp` entries keep working.
        const pngPath = join(OUT_DIR, `${route.name}-${orientation}.png`);
        const webpPath = join(OUT_DIR, `${route.name}-${orientation}.webp`);
        await page.screenshot({ path: pngPath, type: 'png' });
        await convertToWebp(pngPath, webpPath);
        await rm(pngPath);
        await page.close();
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }

  console.log(`\nDone. Wrote ${ROUTES.length * 2} files to ${OUT_DIR}/`);
}

function convertToWebp(input: string, output: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn('magick', [input, '-quality', '85', output], {
      stdio: 'inherit',
    });
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(
        new Error(
          `magick exited with code ${code}. Install ImageMagick (https://imagemagick.org) and retry.`,
        ),
      );
    });
    child.on('error', reject);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
