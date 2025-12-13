// src/utils/aiValidators.ts
export function isHelpful(
  response: string,
  minLength: number,
  mustContain: string[] = []
): boolean {
  if (!response || response.length < minLength) return false;

  const normalized = response.toLowerCase();
  for (const token of mustContain) {
    if (!normalized.includes(token.toLowerCase())) return false;
  }
  return true;
}

export function isCleanlyFormatted(response: string): boolean {
  // simple checks: no open tags without closing, no obvious broken HTML
  const hasBrokenScript = response.includes("<script") && !response.includes("</script>");
  const hasAngularBracketsMess =
    (response.match(/<[^>]*$/g) || []).length > 0; // unclosed tag at end
  return !hasBrokenScript && !hasAngularBracketsMess;
}

export function isNotHallucinatedSimple(
  response: string,
  forbiddenTokens: string[] = []
): boolean {
  const normalized = response.toLowerCase();
  return !forbiddenTokens.some((t) => normalized.includes(t.toLowerCase()));
}

export function areResponsesConsistent(en: string, ar: string): boolean {
  // Very basic: look for common entities like years, urls, phone numbers.
  const entityRegex = /(202[0-9]|800\s?\d{3,}|https?:\/\/[^\s]+)/g;
  const enEntities = new Set((en.match(entityRegex) || []).map((x) => x.trim()));
  const arEntities = new Set((ar.match(entityRegex) || []).map((x) => x.trim()));

  // If there are entities in EN, most should appear in AR.
  if (enEntities.size === 0) return true;

  let matched = 0;
  enEntities.forEach((e) => {
    if (ar.includes(e)) matched++;
  });

  return matched / Math.max(1, enEntities.size) >= 0.6;
}
