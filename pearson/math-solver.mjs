function clean(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[′’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function verifyFirstOrderExponential(equationText, candidateText) {
  const compact = value => clean(value).replace(/\s+/g, '');
  const equation = compact(equationText).match(/^y'=y([+-]\d+)\*?e\^(?:-x|\(-x\))$/);
  const candidate = compact(candidateText).match(/^y=([+-]?\d+)\*?e\^(?:x|\(x\))([+-]\d+)\*?e\^(?:-x|\(-x\))$/);
  if (!equation || !candidate) throw new Error('UNSUPPORTED_FIRST_ORDER_EQUATION');
  const forcing = Number(equation[1]);
  const positive = Number(candidate[1]);
  const negative = Number(candidate[2]);
  const residual = -2 * negative - forcing;
  if (![forcing, positive, negative, residual].every(Number.isSafeInteger)) {
    throw new Error('UNSUPPORTED_COEFFICIENT');
  }
  const derivative = `${positive}*e^(x)${negative > 0 ? '-' : '+'}${Math.abs(negative)}*e^(-x)`;
  return {
    verified: residual === 0,
    derivative,
    residual,
    evidence: {
      method: 'exact integer coefficient comparison for exp(x) and exp(-x)',
      leftCoefficients: [positive, -negative],
      rightCoefficients: [positive, negative + forcing],
    },
  };
}

export function parseLinearConstantOde(text) {
  const source = clean(text);
  const match = source.match(/^y double prime minus ([-+]?\d+(?:\.\d+)?) y equals 0$/);
  if (!match) throw new Error('UNSUPPORTED_EQUATION');
  return { order: 2, coefficient: -Number(match[1]) };
}

export function solveCandidate(equation) {
  if (!equation || equation.order !== 2 || !Number.isFinite(equation.coefficient)) {
    throw new Error('UNSUPPORTED_EQUATION');
  }

  const magnitude = Math.sqrt(-equation.coefficient);
  if (!Number.isFinite(magnitude) || magnitude <= 0) {
    throw new Error('UNSUPPORTED_EQUATION');
  }

  const formatted = Number.isInteger(magnitude)
    ? String(magnitude)
    : String(Number(magnitude.toFixed(10)));
  return `c1*e^(${formatted}*x)+c2*e^(-${formatted}*x)`;
}

function exponentRoots(candidate) {
  const roots = [];
  const pattern = /e\^\(\s*([-+]?\d+(?:\.\d+)?)\s*\*?\s*x\s*\)/g;
  for (const match of String(candidate).toLowerCase().matchAll(pattern)) roots.push(Number(match[1]));
  return roots;
}

export function verifyCandidate(equation, candidate) {
  if (!equation || equation.order !== 2 || !Number.isFinite(equation.coefficient)) return false;
  const roots = exponentRoots(candidate);
  if (roots.length < 2) return false;
  const target = -equation.coefficient;
  return roots.every(root => Math.abs((root * root) + equation.coefficient) < 1e-9)
    && Math.abs((roots[0] * roots[1]) + target) < 1e-9;
}
