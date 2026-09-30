import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const KNOWLEDGE_SCHEMA_VERSION = 1;

export function normalizeKnowledgeText(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[′’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function createEmptyKnowledgeBase() {
  return {
    schemaVersion: KNOWLEDGE_SCHEMA_VERSION,
    answerRules: [],
    incidents: [],
    repairs: [],
  };
}

function assertKnowledgeBase(base) {
  if (!base || base.schemaVersion !== KNOWLEDGE_SCHEMA_VERSION
      || !Array.isArray(base.answerRules)
      || !Array.isArray(base.incidents)
      || !Array.isArray(base.repairs)) {
    throw new Error('INVALID_KNOWLEDGE_BASE');
  }
}

export async function loadKnowledgeBase(file) {
  try {
    const base = JSON.parse(await readFile(file, 'utf8'));
    assertKnowledgeBase(base);
    return base;
  } catch (error) {
    if (error.code === 'ENOENT') return createEmptyKnowledgeBase();
    throw error;
  }
}

export async function saveKnowledgeBase(file, base) {
  assertKnowledgeBase(base);
  await mkdir(path.dirname(file), { recursive: true });
  const temporary = `${file}.tmp-${process.pid}`;
  await writeFile(temporary, `${JSON.stringify(base, null, 2)}\n`, 'utf8');
  await rename(temporary, file);
}

export function recordAnswerRule(base, { platform, family, prompt, answer, verification, evidence = null }) {
  assertKnowledgeBase(base);
  if (!platform || !family || !prompt || !answer || verification !== 'local-substitution') {
    throw new Error('INVALID_ANSWER_RULE');
  }

  const rule = {
    platform,
    family,
    prompt: normalizeKnowledgeText(prompt),
    answer,
    verification,
    evidence,
    status: 'VERIFIED',
  };
  const existing = base.answerRules.findIndex(item =>
    item.platform === rule.platform
    && item.family === rule.family
    && item.prompt === rule.prompt);
  if (existing >= 0) base.answerRules[existing] = rule;
  else base.answerRules.push(rule);
  return rule;
}

export function findAnswerRule(base, { platform, family, prompt }) {
  assertKnowledgeBase(base);
  const normalized = normalizeKnowledgeText(prompt);
  return base.answerRules.find(item =>
    item.status === 'VERIFIED'
    && item.platform === platform
    && item.family === family
    && item.prompt === normalized) ?? null;
}

export function resolveVerifiedAnswer(base, identity) {
  return findAnswerRule(base, identity)?.answer ?? null;
}

const INCIDENTS = Object.freeze({
  CDP_UNAVAILABLE: { action: 'STOP_AND_CONFIGURE', retryLimit: 0 },
  UNSUPPORTED_EQUATION: { action: 'HUMAN_INTERVENTION_REQUIRED', retryLimit: 0 },
  UNKNOWN_ERROR: { action: 'STOP_AND_RECORD', retryLimit: 0 },
});

export function classifyIncident(code) {
  return INCIDENTS[code] ?? INCIDENTS.UNKNOWN_ERROR;
}
