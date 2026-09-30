import test from 'node:test';
import assert from 'node:assert/strict';
import { recoveryDecision } from '../recovery-policy.mjs';

test('un incidente conocido puede aplicar una sola reparacion documentada', () => {
  assert.deepEqual(recoveryDecision({ code: 'CDP_UNAVAILABLE', attempts: 0 }), {
    status: 'REPAIR_ALLOWED',
    action: 'STOP_AND_CONFIGURE',
  });
});

test('un segundo intento no convierte el fallo en reintentos infinitos', () => {
  assert.deepEqual(recoveryDecision({ code: 'CDP_UNAVAILABLE', attempts: 1 }), {
    status: 'STOP_AND_RECORD',
    action: 'STOP_AND_CONFIGURE',
  });
});

test('resultados desconocidos nunca se reparan repitiendo el envio', () => {
  assert.deepEqual(recoveryDecision({ code: 'RESULT_UNKNOWN', attempts: 0 }), {
    status: 'OBSERVE_ONLY',
    action: 'STOP_AND_OBSERVE',
  });
});
