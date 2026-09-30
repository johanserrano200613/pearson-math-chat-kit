import { pathToFileURL } from 'node:url';
import { observePearsonPage } from './pearson-observe.mjs';

const playwrightModule = process.env.PEARSON_PLAYWRIGHT_MODULE
  ? pathToFileURL(process.env.PEARSON_PLAYWRIGHT_MODULE).href
  : 'playwright';
const { chromium } = await import(playwrightModule);

const endpoint = process.env.PEARSON_CDP_ENDPOINT || 'http://127.0.0.1:9222';
const browser = await chromium.connectOverCDP(endpoint);
const pages = browser.contexts().flatMap(context => context.pages())
  .filter(page => /pearson\.(com|cmg\.com)|mylab/i.test(page.url()));

if (pages.length === 0) {
  console.error(JSON.stringify({
    status: 'BLOCKED',
    reason: 'NO_PEARSON_PAGE',
    next: 'Abre Edge con un endpoint CDP y deja visible el curso de Pearson.',
  }));
  process.exitCode = 2;
} else {
  for (const page of pages) {
    const observed = await observePearsonPage(page);
    console.log(JSON.stringify({ status: 'OBSERVED', ...observed }));
  }
}

// No se llama browser.close(): el endpoint pertenece a la sesión visible del usuario.
// El proceso termina después de la observación y deja Edge intacto.
