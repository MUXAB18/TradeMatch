/**
 * Constants index - exports all constant values
 */

export * from './theme';

// Trade and country data will be added here per architecture.md
export const TRADES = {
  ELECTRICIAN: 'electrician',
  // Add more trades as needed per phases.md
} as const;

export const COUNTRIES = {
  // Will be populated once launch country is decided per memory.md Section 4
} as const;
