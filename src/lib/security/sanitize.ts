/**
 * BUKKAPP Input Sanitization & Anti-XSS Engine
 * 
 * Neutralizes Cross-Site Scripting (XSS), script injection, and attribute-based exploits
 * across user-provided input strings (search queries, reviews, storefront profiles, booking notes).
 */

const SCRIPT_STYLE_BLOCKS_REGEX = /<(script|style|iframe|object|embed)\b[^>]*>[\s\S]*?<\/\1>/gi;
const DANGEROUS_TAGS_REGEX = /<\/?(script|iframe|object|embed|applet|style|link|meta|base|form|input|button)\b[^>]*>/gi;
const DANGEROUS_ATTRIBUTES_REGEX = /\s*(on\w+|formaction|action|xmlns)\s*=\s*(['"][^'"]*['"]|[^\s>]+)/gi;
const DANGEROUS_SCHEMES_REGEX = /(javascript|vbscript|data\s*:\s*text\/html)\s*:/gi;

/**
 * Escapes standard HTML special characters into safe entity representations.
 */
export function escapeHtml(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Strips dangerous HTML tags, attributes, and script protocols from arbitrary user text.
 */
export function sanitizeText(input?: string | null): string {
  if (!input || typeof input !== 'string') return '';
  let sanitized = input
    .replace(SCRIPT_STYLE_BLOCKS_REGEX, '')
    .replace(DANGEROUS_TAGS_REGEX, '')
    .replace(DANGEROUS_ATTRIBUTES_REGEX, '')
    .replace(DANGEROUS_SCHEMES_REGEX, 'blocked:');
  return sanitized.trim();
}

/**
 * Specifically cleans and validates a search query string.
 * Limits query length to prevent ReDoS and strips control characters.
 */
export function sanitizeSearchQuery(query: string, maxLength: number = 120): string {
  if (!query || typeof query !== 'string') return '';
  let cleaned = sanitizeText(query);
  // Remove control characters
  cleaned = cleaned.replace(/[\x00-\x1F\x7F]/g, '');
  return cleaned.slice(0, maxLength);
}

/**
 * Recursively sanitizes string fields within an object (e.g. form payloads).
 */
export function sanitizePayload<T>(payload: T): T {
  if (!payload || typeof payload !== 'object') {
    if (typeof payload === 'string') {
      return sanitizeText(payload) as unknown as T;
    }
    return payload;
  }

  if (Array.isArray(payload)) {
    return payload.map((item) => sanitizePayload(item)) as unknown as T;
  }

  const sanitizedObj: Record<string, any> = {};
  for (const [key, value] of Object.entries(payload)) {
    sanitizedObj[key] = sanitizePayload(value);
  }
  return sanitizedObj as T;
}
