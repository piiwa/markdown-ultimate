export const MODE = { Source: "source", Preview: "preview" } as const;
export type Mode = (typeof MODE)[keyof typeof MODE];

/**
 * Coerces an untrusted configuration value into a valid editor mode, defaulting
 * to source. Config values are user-controlled, so this validates the input
 * rather than trusting it.
 */
export function normalizeMode(value: unknown): Mode {
  return value === MODE.Preview ? MODE.Preview : MODE.Source;
}
