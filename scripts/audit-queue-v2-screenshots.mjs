/**
 * Capture queue V2 audit screenshots (Haroon Wahed's Regie / haroonwahed org).
 * Usage: node scripts/audit-queue-v2-screenshots.mjs
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = "http://127.0.0.1:3000";
const DJANGO = "http://127.0.0.1:8000";
const OUT = path.resolve("docs/visual-audit-queue-v2");

const ROUTES = [
  { file: "00-regiekamer-desktop.png", path: "/regiekamer" },
  { file: "01-casussen-desktop.png", path: "/casussen" },
  { file: "02-acties-desktop.png", path: "/acties" },
  { file: "03-matching-desktop.png", path: "/matching" },
  { file: "04-plaatsingen-desktop.png", path: "/plaatsingen" },
  { file: "05-signalen-desktop.png", path: "/signalen" },
  { file: "06-beoordelingen-desktop.png", path: "/beoordelingen" },
  { file: "07-intake-desktop.png", path: "/intake" },
  { file: "01-casussen-mobile-390.png", path: "/casussen", width: 390, height: 844 },
];

async function login(page) {
  await page.goto(`${DJANGO}/login/`, { waitUntil: "networkidle" });
  await page.fill('input[name="username"]', "haroonwahed");
  await page.fill('input[name="password"]', "pilot_demo_pass_123");
  await page.click('button[type="submit"]');
  await page.waitForURL(/127\.0\.0\.1:8000/, { timeout: 15000 }).catch(() => {});
}

async function setOrg(page) {
  const res = await page.request.post(`${DJANGO}/care/api/session/active-organization/`, {
    data: { organization_slug: "haroonwahed" },
  });
  if (!res.ok()) {
    console.warn("active-organization failed", res.status());
  }
}

async function capture(page, route, outfile) {
  const w = route.width ?? 1440;
  const h = route.height ?? 900;
  await page.setViewportSize({ width: w, height: h });
  await page.goto(`${BASE}${route.path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: outfile, fullPage: true });
  console.log("saved", outfile);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  await login(page);
  await page.goto(`${BASE}/casussen`, { waitUntil: "domcontentloaded" });
  await setOrg(page);
  for (const route of ROUTES) {
    await capture(page, route, path.join(OUT, route.file));
  }
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
