export function mergeHeaders(a: HeadersInit, b: HeadersInit): Headers {
  const h = new Headers(a);
  new Headers(b).forEach((v, k) => {
    h.set(k, v);
  });

  return h;
}

export function joinUrl(
  base: string | undefined,
  path: string | undefined,
): string {
  if (!base && path) return path;
  if (!path && base) return base;

  if (!path || !base) {
    throw new Error("Both base and path are undefined");
  }

  const trimmedBase = base.replace(/\/+$/, "");
  const trimmedPath = path.replace(/^\/+/, "");

  return `${trimmedBase}/${trimmedPath}`;
}

export function isPlainObject(
  value: unknown,
): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") return false;
  return Object.getPrototypeOf(value) === Object.prototype;
}

export function validateStatusCode(code: number) {
  return code >= 200 && code < 300;
}
