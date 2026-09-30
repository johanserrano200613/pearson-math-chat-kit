export function nextState({ phase, mastery = 0, requiredMastery = 0, result = null }) {
  if (phase === 'QUIZ' && result === 'RESULT_UNKNOWN') return 'HUMAN_INTERVENTION_REQUIRED';
  if (phase === 'PRACTICE' && mastery < requiredMastery) return 'PRACTICE';
  if (phase === 'PRACTICE' && mastery >= requiredMastery) return 'QUIZ_READY';
  return phase;
}
