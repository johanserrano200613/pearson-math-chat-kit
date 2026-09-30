import { pathToFileURL } from 'node:url';
import { observePearsonPage } from './pearson-observe.mjs';
import { parseLinearConstantOde, solveCandidate, verifyCandidate } from './math-solver.mjs';
import { decideSubmission } from './submission-policy.mjs';
import { loadKnowledgeBase, resolveVerifiedAnswer } from './knowledge-base.mjs';

const playwrightModule = process.env.PEARSON_PLAYWRIGHT_MODULE
  ? pathToFileURL(process.env.PEARSON_PLAYWRIGHT_MODULE).href
  : 'playwright';
const { chromium } = await import(playwrightModule);

function isPearsonPage(page) {
  return /pearson\.(com|cmg\.com)|mylab/i.test(page.url());
}

async function readPractice(page) {
  return page.evaluate(() => {
    const visible = element => element.getClientRects().length > 0;
    const inputs = [...document.querySelectorAll('input, textarea')]
      .filter(visible)
      .map(element => ({
        type: element.type || 'textarea',
        name: element.name || null,
        id: element.id || null,
        value: element.value || '',
        placeholder: element.placeholder || '',
      }));
    const body = document.body?.innerText ?? '';
    return { body, inputs };
  });
}

function solveObservedPractice(practice, knowledgeBase) {
  try {
    const equation = parseLinearConstantOde(practice.body);
    const identity = {
      platform: 'pearson',
      family: 'linear-constant-ode-2',
      prompt: practice.body,
    };
    const storedAnswer = resolveVerifiedAnswer(knowledgeBase, identity);
    const answer = storedAnswer ?? solveCandidate(equation);
    return {
      status: verifyCandidate(equation, answer) ? 'ANSWER_VERIFIED' : 'HUMAN_INTERVENTION_REQUIRED',
      equation,
      answer,
      source: storedAnswer ? 'KNOWLEDGE_BASE' : 'LOCAL_SOLVER_NOT_YET_CATALOGUED',
    };
  } catch (error) {
    return {
      status: 'HUMAN_INTERVENTION_REQUIRED',
      reason: error.message,
    };
  }
}

const endpoint = process.env.PEARSON_CDP_ENDPOINT || 'http://127.0.0.1:9222';
const knowledgeBaseFile = process.env.PEARSON_KNOWLEDGE_BASE
  || new URL('./knowledge-base.json', import.meta.url);
const knowledgeBase = await loadKnowledgeBase(knowledgeBaseFile);
let browser;
try {
  browser = await chromium.connectOverCDP(endpoint);
} catch (error) {
  console.error(JSON.stringify({
    status: 'BLOCKED',
    reason: 'CDP_UNAVAILABLE',
    message: error.message,
    next: 'Inicia Edge con un endpoint CDP visible; el script no abre ni cierra otro navegador.',
  }));
  process.exitCode = 2;
}

if (browser) {
  const pages = browser.contexts().flatMap(context => context.pages()).filter(isPearsonPage);
  if (pages.length === 0) {
    console.error(JSON.stringify({
      status: 'BLOCKED',
      reason: 'NO_PEARSON_PAGE',
      next: 'Deja abierto el curso de Pearson en la sesión CDP indicada.',
    }));
    process.exitCode = 2;
  } else {
    for (const page of pages) {
      const observed = await observePearsonPage(page);
      const output = { status: 'OBSERVED', ...observed };
      if (/PlayerPractice\.aspx/i.test(page.url())) {
        const practice = await readPractice(page);
        output.practice = solveObservedPractice(practice, knowledgeBase);
        output.submission = decideSubmission({
          verified: output.practice.status === 'ANSWER_VERIFIED',
          allowSubmit: false,
        });
      }
      console.log(JSON.stringify(output));
    }
  }
}

// El navegador pertenece al usuario: nunca se cierra desde este proceso.
