import type { DotPathsLeafOnly } from "../util-types";

export function getLeafDotPaths<O extends object>(
  obj: O,
  prefix = "",
): DotPathsLeafOnly<O>[] {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
    return (prefix ? [prefix] : []) as DotPathsLeafOnly<O>[];
  }

  const result: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    result.push(...getLeafDotPaths(value, path));
  }

  return result as DotPathsLeafOnly<O>[];
}
