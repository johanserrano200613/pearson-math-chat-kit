function numberFrom(text, pattern) {
  const match = String(text).match(pattern);
  return match ? Number(match[1]) : null;
}

export function extractStudyPlanSummary(text) {
  const source = String(text ?? '').replace(/\r/g, '');
  const mastery = source.match(/MP Earned\s+(\d+)\s*\/\s*(\d+)/i);
  const requiredMastery = numberFrom(source, /at least\s+(\d+)\s+mastery points/i);
  const objectives = source.split('\n')
    .map(line => line.replace(/\s+/g, ' ').trim())
    .filter(line => /Practice\s+Quiz Me/i.test(line))
    .map(line => line.replace(/\s+Practice\s+Quiz Me.*$/i, '').trim())
    .filter(Boolean);
  return {
    masteryEarned: mastery?.[1] ? Number(mastery[1]) : null,
    masteryTotal: mastery?.[2] ? Number(mastery[2]) : null,
    requiredMastery,
    objectives,
    actions: source.includes('Practice') && source.includes('Quiz Me') ? ['Practice', 'Quiz Me'] : [],
  };
}

export async function observePearsonPage(page) {
  const data = await page.evaluate(() => ({
    url: location.href,
    title: document.title,
    text: document.body?.innerText ?? '',
    buttons: [...document.querySelectorAll('button, a')]
      .filter(element => element.getClientRects().length)
      .map(element => ({
        tag: element.tagName.toLowerCase(),
        text: (element.innerText || element.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim(),
        id: element.id || null,
      }))
      .filter(item => item.text),
  }));
  return { ...data, studyPlan: extractStudyPlanSummary(data.text) };
}
