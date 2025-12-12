/**
 * Checks whether the required environment variables are present and returns an object containing them, if any of them is missing an error is thrown.
 * @param required environment variable keys
 * @throws {Error} if any of the required environment variables are missing
 * @returns an object containing the required environment variables
 */
export function requireEnv<K extends string>(...keys: K[]): Record<K, string> {
  const missing = Object.entries(process.env).filter(
    ([key, value]) => keys.includes(key as K) && !value,
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing environment variables: ${missing.map(([key]) => key).join(", ")}`,
    );
  }

  return Object.fromEntries(
    keys.map((key) => [key, process.env[key] as string]),
  ) as Record<K, string>;
}
