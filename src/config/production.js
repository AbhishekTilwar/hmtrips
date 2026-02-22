/**
 * Production Configuration and Optimization Settings
 * 
 * Configuration for handling millions of users and smooth performance
 * Includes caching strategies, performance optimizations, and scaling settings
 */

// Performance optimization constants
export const PERFORMANCE_CONFIG = {
  // Cache settings (in milliseconds)
  CACHE: {
    RECOMMENDATIONS: 5 * 60 * 1000,      // 5 minutes
    USER_PROFILE: 10 * 60 * 1000,        // 10 minutes
    TRENDING_TOURS: 2 * 60 * 1000,       // 2 minutes
    RECENT_TOURS: 1 * 60 * 1000,         // 1 minute
  },
  
  // Pagination settings
  PAGINATION: {
    RECOMMENDATIONS_LIMIT: 12,
    TRENDING_LIMIT: 8,
    RECENT_LIMIT: 6,
    RECENTLY_VIEWED_LIMIT: 6,
  },
  
  // Debouncing delays (in milliseconds)
  DEBOUNCE: {
    VIEW_TRACKING: 3000,      // 3 seconds for view tracking
    SEARCH_INPUT: 500,        // 500ms for search input
    INTERACTION_BUTTONS: 300, // 300ms for button interactions
  },
  
  // Retry configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    BASE_DELAY: 1000,         // 1 second
    MAX_DELAY: 10000,         // 10 seconds
  },
  
  // Network optimization
  NETWORK: {
    TIMEOUT: 10000,           // 10 seconds
    RETRY_ON_FAILURE: true,
    FALLBACK_ENABLED: true,
  }
}

/**
 * Production-Ready Error Handling Configuration
 */
export const ERROR_HANDLING = {
  // Log levels
  LOG_LEVEL: 'warn', // 'debug' | 'info' | 'warn' | 'error'
  
  // Error reporting
  REPORTING: {
    ENABLED: true,
    SAMPLE_RATE: 0.1,        // Report 10% of errors in production
    IGNORED_ERRORS: [
      'Network Error',
      'Failed to fetch',
      'QuotaExceededError'
    ]
  },
  
  // Graceful degradation
  DEGRADATION: {
    FALLBACK_TO_DEFAULT: true,
    SHOW_USER_FRIENDLY_MESSAGES: true,
    MAINTAIN_BASIC_FUNCTIONALITY: true
  }
}

/**
 * Scalability Configuration for Millions of Users
 */
export const SCALABILITY_CONFIG = {
  // Firebase Firestore optimization
  FIRESTORE: {
    BATCH_SIZE: 500,          // Maximum batch operations
    INDEXES: {
      // Composite indexes for better query performance
      USER_INTERACTIONS: ['userId', 'tourId'],
      TRENDING_TOURS: ['views', 'likes', 'shares'],
      USER_PREFERENCES: ['userId', 'categoryScores']
    }
  },
  
  // Memory management
  MEMORY: {
    MAX_RECOMMENDATIONS_CACHE: 100,
    MAX_USER_PROFILES_CACHE: 1000,
    CLEANUP_INTERVAL: 30000   // 30 seconds
  },
  
  // Concurrency limits
  CONCURRENCY: {
    MAX_PARALLEL_REQUESTS: 10,
    MAX_RECOMMENDATION_CALCULATIONS: 5
  }
}

/**
 * Monitoring and Analytics Configuration
 */
export const MONITORING_CONFIG = {
  // Performance monitoring
  PERFORMANCE: {
    ENABLED: true,
    METRICS: [
      'page_load_time',
      'api_response_time',
      'recommendation_calculation_time',
      'interaction_tracking_time'
    ]
  },
  
  // User analytics
  ANALYTICS: {
    TRACK_USER_BEHAVIOR: true,
    ANONYMIZE_USER_DATA: true,
    OPT_OUT_OPTION: true
  }
}

/**
 * Feature Flags for Production Control
 */
export const FEATURE_FLAGS = {
  // CRM Features
  CRM_RECOMMENDATIONS: true,
  PERSONALIZED_CONTENT: true,
  TRENDING_ANALYTICS: true,
  USER_PREFERENCES: true,
  
  // Performance Features
  LAZY_LOADING: true,
  CODE_SPLITTING: true,
  CACHING_ENABLED: true,
  
  // Experimental Features
  AI_RECOMMENDATIONS: false,    // Disabled by default
  REAL_TIME_UPDATES: false,     // Disabled by default
  ADVANCED_FILTERING: true
}

/**
 * Environment-based Configuration
 */
export const getEnvironmentConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isProduction = process.env.NODE_ENV === 'production'
  
  return {
    isDevelopment,
    isProduction,
    isStaging: process.env.REACT_APP_ENV === 'staging',
    
    // Environment-specific settings
    logging: isDevelopment ? 'debug' : 'warn',
    caching: isProduction ? PERFORMANCE_CONFIG.CACHE : { ...PERFORMANCE_CONFIG.CACHE, RECOMMENDATIONS: 30000 }, // 30 seconds in dev
    errorReporting: isProduction ? ERROR_HANDLING.REPORTING : { ...ERROR_HANDLING.REPORTING, SAMPLE_RATE: 1 }, // 100% in dev
    featureFlags: isDevelopment ? 
      { ...FEATURE_FLAGS, AI_RECOMMENDATIONS: true, REAL_TIME_UPDATES: true } : 
      FEATURE_FLAGS
  }
}

// Export default configuration
export default {
  PERFORMANCE_CONFIG,
  ERROR_HANDLING,
  SCALABILITY_CONFIG,
  MONITORING_CONFIG,
  FEATURE_FLAGS,
  getEnvironmentConfig
}