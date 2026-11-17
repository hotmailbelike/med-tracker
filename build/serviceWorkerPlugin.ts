import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Plugin } from 'vite';

const TEMPLATE_FILE = 'service-worker/sw-template.js';
const SERVICE_WORKER_FILE = 'sw.js';
const VERSION_PLACEHOLDER = '__CACHE_VERSION__';
const URLS_PLACEHOLDER = '__PRECACHE_URLS__';
const VERSION_LENGTH = 12;
/** Files the browser never needs offline. */
const EXCLUDED_FILES = new Set([SERVICE_WORKER_FILE, '.DS_Store']);

async function listFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && !EXCLUDED_FILES.has(entry.name))
    .map((entry) => path.relative(directory, path.join(entry.parentPath, entry.name)))
    .sort();
}

/**
 * Writes dist/sw.js after the build, precaching every emitted file. The cache version is a hash of
 * all file contents, so any change to the app produces a new service worker and a fresh cache.
 */
export function serviceWorkerPlugin(): Plugin {
  let outDir = '';
  let templatePath = '';

  return {
    name: 'med-tracker:service-worker',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
      templatePath = path.resolve(config.root, TEMPLATE_FILE);
    },
    async closeBundle() {
      const files = await listFiles(outDir);
      if (!files.includes('index.html')) {
        throw new Error(`Service worker: index.html is missing from ${outDir}.`);
      }

      const hash = createHash('sha256');
      for (const file of files) {
        hash.update(file);
        hash.update(await readFile(path.join(outDir, file)));
      }
      const version = hash.digest('hex').slice(0, VERSION_LENGTH);
      const urls = files.map((file) => `/${file.split(path.sep).join('/')}`);

      const template = await readFile(templatePath, 'utf8');
      // Function replacers, so a `$` in a file name is never read as a replacement pattern.
      const source = template
        .replace(`'${VERSION_PLACEHOLDER}'`, () => JSON.stringify(version))
        .replace(URLS_PLACEHOLDER, () => JSON.stringify(urls, null, 2));
      await writeFile(path.join(outDir, SERVICE_WORKER_FILE), source);
    },
  };
}
