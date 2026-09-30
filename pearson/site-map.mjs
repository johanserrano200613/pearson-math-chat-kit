export const pearsonMap = Object.freeze({
  courseHome: {
    leftNav: ['Course Home', 'Assignments', 'Student Gradebook', 'eText Contents', 'Study Plan'],
    assignmentKinds: ['Study Plan', 'Quiz'],
  },
  studyPlan: {
    tabs: ['Prerequisites', 'Progress', 'All Chapters'],
    rule: 'Practice objectives until required mastery points are reached before Quiz Me.',
    actions: ['Practice', 'Quiz Me'],
    observedSamples: [
      { label: 'Q-EOS-4.3', masteryRequired: 2, masteryTotal: 4 },
      { label: 'Q-EPO-1.1', masteryRequired: 3, masteryTotal: 4 },
    ],
  },
  practice: {
    controls: ['Previous question', 'Next question', 'Close', 'Check answer'],
    questionIdentity: ['section', 'question number', 'objective', 'prompt', 'all answer fields'],
    observed: { checkAnswerDisabledUntilInput: true },
  },
  quiz: {
    preflight: ['Start', 'Cancel'],
    observed: { questions: 3, attempts: 'unlimited', requiredMasteryPercent: 75 },
  },
});
