import test from 'node:test';
import assert from 'node:assert/strict';
import { decideSubmission } from '../submission-policy.mjs';

test('el modo normal nunca envia una respuesta aunque sea verificable', () => {
  assert.deepEqual(decideSubmission({ verified: true, allowSubmit: false }), {
    status: 'DRY_RUN',
    reason: 'SUBMISSION_DISABLED',
  });
});

test('el envio requiere verificacion local y autorizacion explicita', () => {
  assert.deepEqual(decideSubmission({ verified: true, allowSubmit: true }), {
    status: 'SUBMIT_ALLOWED',
  });
  assert.deepEqual(decideSubmission({ verified: false, allowSubmit: true }), {
    status: 'HUMAN_INTERVENTION_REQUIRED',
    reason: 'UNVERIFIED_ANSWER',
  });
});
