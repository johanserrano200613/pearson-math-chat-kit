const ACTIONS = Object.freeze({
  CDP_UNAVAILABLE: 'STOP_AND_CONFIGURE',
  RESULT_UNKNOWN: 'STOP_AND_OBSERVE',
  QUESTION_CHANGED: 'DISCARD_AND_REOBSERVE',
  UNSUPPORTED_EQUATION: 'HUMAN_INTERVENTION_REQUIRED',
  UNKNOWN_ERROR: 'STOP_AND_RECORD',
});

export function recoveryDecision({ code, attempts = 0 } = {}) {
  const action = ACTIONS[code] ?? ACTIONS.UNKNOWN_ERROR;

  if (code === 'RESULT_UNKNOWN') {
    return { status: 'OBSERVE_ONLY', action };
  }

  if (attempts > 0) {
    return { status: 'STOP_AND_RECORD', action };
  }

  return { status: 'REPAIR_ALLOWED', action };
}
