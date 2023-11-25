// utility function to get environment variables

export function env(key: string, _default?: string): string | undefined {
  const value = process.env[key];
  if (value === undefined && _default === undefined) {
    throw new Error(`Missing environment variable ${key}`);
  }
  if (value === undefined) {
    return _default;
  }
  return value;
}
