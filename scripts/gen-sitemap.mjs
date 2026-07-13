#!/usr/bin/env node
/**
 * gotcos.com sitemap generator — the HubSpot-equivalent for a static repo.
 *
 * Walks every real page route in the repo, SKIPS anything carrying a
 * `noindex` robots meta tag, stamps <lastmod> from the file's last git
 * commit date, and writes sitemap.xml. Run by hand or via the
 * .github/workflows/sitemap.yml watcher on every push to main.
 *
 * No dependencies — Node built-ins only.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join, relative, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'https://www.gotcos.com';

// Infrastructure / non-page dirs — never crawled for routes.
const SKIP_DIRS = new Set([
  '.git', '.github', 'node_modules', 'assets', 'scripts',
  'templates', 'examples', 'skills', 'integrations', 'assess',
]);

const ROBOTS_NOINDEX = /<meta[^>]+name=["']robots["'][^>]*noindex/i;

/** Recursively collect every .html file, minus skipped dirs. */
function collectHtml(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const abs = join(dir, name);
    const rel = relative(ROOT, abs);
    if (statSync(abs).isDirectory()) {
      if (SKIP_DIRS.has(name)) continue;
      collectHtml(abs, out);
    } else if (name.endsWith('.html')) {
      out.push(rel);
    }
  }
  return out;
}

/** Repo-relative html path -> public URL path, or null if not a canonical route. */
function toRoute(rel) {
  if (basename(rel) === 'index.html') {
    const d = dirname(rel);
    return d === '.' ? '/' : `/${d}/`;
  }
  // Standalone .html (e.g. a one-off diagram) keeps its extension.
  return `/${rel}`;
}

/** Last git commit date (YYYY-MM-DD) for a file; falls back to today. */
function lastmod(rel) {
  try {
    const d = execSync(`git log -1 --format=%cs -- "${rel}"`, {
      cwd: ROOT, encoding: 'utf8',
    }).trim();
    if (d) return d;
  } catch { /* not committed yet */ }
  return new Date().toISOString().slice(0, 10);
}

const entries = [];
for (const rel of collectHtml(ROOT)) {
  const html = readFileSync(join(ROOT, rel), 'utf8');
  if (ROBOTS_NOINDEX.test(html)) continue; // respect noindex — mirrors HubSpot
  entries.push({ loc: `${BASE}${toRoute(rel)}`, lastmod: lastmod(rel) });
}

// Root first, then alphabetical — stable, review-friendly diffs.
entries.sort((a, b) => {
  if (a.loc === `${BASE}/`) return -1;
  if (b.loc === `${BASE}/`) return 1;
  return a.loc.localeCompare(b.loc);
});

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  entries.map(e => `  <url><loc>${e.loc}</loc><lastmod>${e.lastmod}</lastmod></url>`).join('\n') +
  `\n</urlset>\n`;

writeFileSync(join(ROOT, 'sitemap.xml'), xml);
console.log(`sitemap.xml written — ${entries.length} indexable URLs`);
for (const e of entries) console.log(`  ${e.loc}  (${e.lastmod})`);
