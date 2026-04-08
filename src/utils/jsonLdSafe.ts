/**
 * Safely serializes an object to a JSON-LD string by escaping
 * characters that could break out of a <script> tag in HTML.
 */
export function jsonLdSafe(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}
