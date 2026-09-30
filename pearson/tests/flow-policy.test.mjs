import test from 'node:test';
import assert from 'node:assert/strict';
import { nextState } from '../flow-policy.mjs';

test('no permite quiz sin los puntos de dominio minimos', () => {
  assert.equal(nextState({ phase: 'PRACTICE', mastery: 1, requiredMastery: 3 }), 'PRACTICE');
});

test('permite quiz solo despues de alcanzar el dominio requerido', () => {
  assert.equal(nextState({ phase: 'PRACTICE', mastery: 3, requiredMastery: 3 }), 'QUIZ_READY');
});

test('un resultado desconocido bloquea el reenvio', () => {
  assert.equal(nextState({ phase: 'QUIZ', result: 'RESULT_UNKNOWN' }), 'HUMAN_INTERVENTION_REQUIRED');
});
