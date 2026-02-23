/**
 * Configuration Engine
 *
 * Module 02 - Provides:
 * - 4-level config resolution (Platform → Company → Project → User)
 * - Feature flags with plan gating
 * - Customizable terminology (~50 display terms)
 * - Numbering sequence generation
 * - Workflow definitions (approval state machines)
 * - Custom fields (EAV)
 * - Config versioning with rollback
 */

// Types
export * from './types'

// Config Resolution (4-level hierarchy)
export {
  resolveConfig,
  resolveSectionConfig,
  getCompanySettings,
  updateCompanySetting,
  updateCompanySettings,
  getConfig,
  configEquals,
  getPlatformDefault,
  listPlatformDefaults,
  clearConfigCache,
} from './resolve-config'

// Feature Flags
export {
  isFeatureEnabled,
  getFeatureFlags,
  setFeatureFlag,
  setFeatureFlags,
  areFeaturesEnabled,
  getFeatureFlagDefinitions,
  clearFeatureFlagCache,
  FEATURE_FLAG_DEFINITIONS,
} from './feature-flags'

// Terminology
export {
  getTerm,
  getTermPlural,
  getTerms,
  getAllTerminology,
  setTerminology,
  setTerminologyBulk,
  resetTerminology,
  getDefaultTerminology,
  createTerminologyHelper,
  clearTerminologyCache,
} from './terminology'

// Numbering Sequences
export {
  getNextNumber,
  previewNextNumber,
  getNumberingPatterns,
  setNumberingPattern,
  resetSequence,
  validatePattern,
  getDefaultPatterns,
  clearNumberingCache,
} from './numbering'
