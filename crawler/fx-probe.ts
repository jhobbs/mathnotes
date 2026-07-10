// One-off probe: measure \tag label geometry under candidate CSS layouts
// in both Firefox and Chromium. Usage: npx tsx fx-probe.ts <url>
import { firefox, chromium, Browser } from 'playwright';

const CANDIDATES: Record<string, string> = {
  current: '',
  table: `
    mtd.math-tag { position: static !important; transform: none !important; padding-block: 0 !important; }
    mtable.math-tagged { width: 100% !important; }
    mtable.math-tagged > mtr > mtd:first-child { width: 100% !important; }
  `,
  gap: `
    mtd.math-tag { position: static !important; transform: none !important; padding-block: 0 !important; padding-inline-start: 2em !important; }
  `,
};

async function probe(browser: Browser, name: string, url: string) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(url, { waitUntil: 'networkidle' });
  for (const [cand, css] of Object.entries(CANDIDATES)) {
    const handle = css ? await page.addStyleTag({ content: css }) : null;
    const rows = await page.evaluate(() => {
      const out: string[] = [];
      document.querySelectorAll('math[display="block"]').forEach((el) => {
        const tag = el.querySelector('mtd.math-tag');
        if (!tag || out.length >= 3) return;
        const er = el.getBoundingClientRect();
        const tr = tag.getBoundingClientRect();
        const eq = el.querySelector('mtable.math-tagged > mtr > mtd');
        const qr = eq ? eq.getBoundingClientRect() : null;
        out.push([
          (el.getAttribute('alttext') || '').slice(0, 12),
          'tagRightGap=' + (er.right - tr.right).toFixed(0),
          'tagVCenterOff=' + ((tr.top + tr.bottom) / 2 - (er.top + er.bottom) / 2).toFixed(0),
          'eqCenterOff=' + (qr ? ((qr.left + qr.right) / 2 - (er.left + er.right) / 2).toFixed(0) : '?'),
          'oy=' + ((el as HTMLElement).scrollHeight - (el as HTMLElement).clientHeight),
          'ox=' + ((el as HTMLElement).scrollWidth - (el as HTMLElement).clientWidth),
        ].join(' '));
      });
      return out;
    });
    console.log(`[${name}/${cand}]`);
    rows.forEach((r) => console.log('  ' + r));
    if (handle) await handle.evaluate((n) => n.remove());
  }
  await page.close();
}

(async () => {
  const url = process.argv[2];
  for (const [name, launcher] of [['firefox', firefox], ['chromium', chromium]] as const) {
    const b = await launcher.launch();
    try {
      await probe(b, name, url);
    } finally {
      await b.close();
    }
  }
})();
