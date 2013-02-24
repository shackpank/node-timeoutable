var inDev = function() {
  return !!(!process.env.NODE_ENV || process.env.NODE_ENV === 'development');
}

// Don't throw errors that may or may not be problems in production
// unless you ask for it.
var config = {
  MAX_ORPHANED_CALLBACKS: Infinity,
  MAX_MULTIPLE_CALLBACKS: Infinity
}

// ... but crash early in development, so you know there may be a problem
if(inDev()) {
  var config = {
    MAX_ORPHANED_CALLBACKS: 50, // Could maybe be even lower.
    MAX_MULTIPLE_CALLBACKS: 0
  }
}

module.exports = config;
