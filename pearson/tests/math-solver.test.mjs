import test from 'node:test';
import assert from 'node:assert/strict';
import { parseLinearConstantOde, solveCandidate, verifyCandidate } from '../math-solver.mjs';

test('identifica y resuelve la ecuacion y doble prima menos 400 y igual a cero', () => {
  const equation = parseLinearConstantOde('y double prime minus 400 y equals 0');
  assert.deepEqual(equation, { order: 2, coefficient: -400 });
  assert.deepEqual(equation.solution, undefined);
});

test('verifica una solucion general por sustitucion simbolica basica', () => {
  const equation = parseLinearConstantOde('y double prime minus 400 y equals 0');
  const candidate = solveCandidate(equation);
  assert.equal(candidate, 'c1*e^(20*x)+c2*e^(-20*x)');
  assert.equal(verifyCandidate(equation, candidate), true);
  assert.equal(verifyCandidate(equation, 'c1*e^(10*x)+c2*e^(-10*x)'), false);
});

test('rechaza una propuesta no soportada en vez de inventar una respuesta', () => {
  assert.throws(() => parseLinearConstantOde('integral of sin x'), /UNSUPPORTED_EQUATION/);
});
