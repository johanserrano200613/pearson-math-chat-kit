import test from 'node:test';
import assert from 'node:assert/strict';
import { extractStudyPlanSummary } from '../pearson-observe.mjs';

test('extrae dominio, objetivos y acciones del texto del Study Plan', () => {
  const summary = extractStudyPlanSummary(`
    Study Plan Prerequisites
    MP Earned 0 / 4
    You must earn at least 3 mastery points before you can take the test.
    Verify solutions of differential equations. Practice Quiz Me
  `);
  assert.deepEqual(summary, {
    masteryEarned: 0,
    masteryTotal: 4,
    requiredMastery: 3,
    objectives: ['Verify solutions of differential equations.'],
    actions: ['Practice', 'Quiz Me'],
  });
});
