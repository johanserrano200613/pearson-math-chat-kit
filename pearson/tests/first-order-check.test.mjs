import test from 'node:test';
import assert from 'node:assert/strict';
import * as solver from '../math-solver.mjs';

test('verifies the pending first-order exercise and differentiates the negative exponent', () => {
  assert.equal(typeof solver.verifyFirstOrderExponential, 'function');
  const result = solver.verifyFirstOrderExponential("y' = y + 18e^-x", 'y = 8e^x - 9e^-x');
  assert.equal(result.verified, true);
  assert.equal(result.derivative, '8*e^(x)+9*e^(-x)');
  assert.equal(result.residual, 0);
});

test('does not accept a wrong sign merely because the candidate has the right terms', () => {
  const result = solver.verifyFirstOrderExponential("y' = y + 18e^-x", 'y = 8e^x + 9e^-x');
  assert.equal(result.verified, false);
  assert.equal(result.residual, -36);
});

test('supports changed coefficients rather than memorizing the pending answer', () => {
  const result = solver.verifyFirstOrderExponential("y′ = y - 10e^(-x)", 'y = -3*e^(x) + 5*e^(-x)');
  assert.equal(result.verified, true);
  assert.equal(result.derivative, '-3*e^(x)-5*e^(-x)');
});

test('rejects appended content, unsupported powers and ambiguous whole-page text', () => {
  for (const candidate of ['y=8e^x-9e^-x+1', 'y=8e^x-9e^-2x', 'y=8e^x-9e^-x; next question']) {
    assert.throws(() => solver.verifyFirstOrderExponential("y'=y+18e^-x", candidate), /UNSUPPORTED/);
  }
  assert.throws(() => solver.verifyFirstOrderExponential("Find y: y'=y+18e^-x", 'y=8e^x-9e^-x'), /UNSUPPORTED/);
});
