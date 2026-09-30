import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { mkdtemp, readFile } from 'node:fs/promises';
import {
  createEmptyKnowledgeBase,
  loadKnowledgeBase,
  saveKnowledgeBase,
  recordAnswerRule,
  findAnswerRule,
  resolveVerifiedAnswer,
  classifyIncident,
} from '../knowledge-base.mjs';

test('encuentra una respuesta solo por contenido normalizado y contexto', () => {
  const base = createEmptyKnowledgeBase();
  recordAnswerRule(base, {
    platform: 'pearson',
    family: 'linear-constant-ode-2',
    prompt: 'y double prime minus 400 y equals 0',
    answer: 'c1*e^(20*x)+c2*e^(-20*x)',
    verification: 'local-substitution',
  });

  assert.equal(findAnswerRule(base, {
    platform: 'pearson',
    family: 'linear-constant-ode-2',
    prompt: '  Y   DOUBLE PRIME minus 400 y equals 0 ',
  })?.answer, 'c1*e^(20*x)+c2*e^(-20*x)');
  assert.equal(findAnswerRule(base, {
    platform: 'pearson',
    family: 'linear-constant-ode-2',
    prompt: 'y double prime minus 225 y equals 0',
  }), null);
});

test('no devuelve una respuesta guardada para otra familia', () => {
  const base = createEmptyKnowledgeBase();
  recordAnswerRule(base, {
    platform: 'pearson',
    family: 'linear-constant-ode-2',
    prompt: 'y double prime minus 400 y equals 0',
    answer: 'c1*e^(20*x)+c2*e^(-20*x)',
    verification: 'local-substitution',
  });
  assert.equal(resolveVerifiedAnswer(base, {
    platform: 'pearson',
    family: 'first-order-separable',
    prompt: 'y double prime minus 400 y equals 0',
  }), null);
});

test('persiste la base sin contrasenas ni datos de cuenta', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'pearson-kb-'));
  const file = path.join(directory, 'knowledge-base.json');
  const base = createEmptyKnowledgeBase();
  recordAnswerRule(base, {
    platform: 'pearson',
    family: 'linear-constant-ode-2',
    prompt: 'y double prime minus 400 y equals 0',
    answer: 'c1*e^(20*x)+c2*e^(-20*x)',
    verification: 'local-substitution',
  });
  await saveKnowledgeBase(file, base);
  const loaded = await loadKnowledgeBase(file);
  assert.equal(loaded.answerRules.length, 1);
  assert.equal(JSON.stringify(loaded).toLowerCase().includes('password'), false);
  assert.equal(JSON.stringify(loaded).toLowerCase().includes('credential'), false);
  assert.match(await readFile(file, 'utf8'), /schemaVersion/);
});

test('clasifica errores conocidos y no autoriza reintentos ilimitados', () => {
  assert.deepEqual(classifyIncident('CDP_UNAVAILABLE'), {
    action: 'STOP_AND_CONFIGURE',
    retryLimit: 0,
  });
  assert.deepEqual(classifyIncident('UNSUPPORTED_EQUATION'), {
    action: 'HUMAN_INTERVENTION_REQUIRED',
    retryLimit: 0,
  });
  assert.deepEqual(classifyIncident('UNKNOWN_ERROR'), {
    action: 'STOP_AND_RECORD',
    retryLimit: 0,
  });
});
