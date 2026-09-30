export function decideSubmission({ verified = false, allowSubmit = false } = {}) {
  if (!verified) {
    return {
      status: 'HUMAN_INTERVENTION_REQUIRED',
      reason: 'UNVERIFIED_ANSWER',
    };
  }

  if (!allowSubmit) {
    return {
      status: 'DRY_RUN',
      reason: 'SUBMISSION_DISABLED',
    };
  }

  return { status: 'SUBMIT_ALLOWED' };
}
