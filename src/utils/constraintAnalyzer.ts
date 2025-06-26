
// Re-export everything from the refactored modules for backward compatibility
export type { GuessData, WordConstraints, GuessHistory } from './constraints/types';
export { analyzeConstraints } from './constraints/analyzer';
export { validateWordAgainstConstraints } from './constraints/validator';
export { calculateWordScore } from './constraints/scorer';
export { findPotentialMatches } from './constraints/matcher';
