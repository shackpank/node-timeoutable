var matchArguments   = require('./argumentMatcher');
var TimeoutableError = require('./TimeoutableError');

timeoutable = function timeoutable(duration, callback) {
  return {
    run: function(a, b, c) {
      var opts = matchArguments(a, b, c);

      var calledBack = 0;

      var callbackHandler = function timeoutableCallbackHandler(error) {
        if(calledBack) {
          if(calledBack > 1) {
            // Callbacks should only be called once.
            trackMultipleCallback();
          }
          timeoutable.orphanedCallbacks--;
          calledBack++;
          return;
        }

        if(error instanceof TimeoutableError) {
          // Then there is still a method running somewhere. Keep track -
          // we expect it to call in eventually.
          trackOrphanedCallback();
        }

        calledBack++;
        clearTimeout(timeout);

        __apply(callback, Array.prototype.slice.call(arguments));
      }

      var timeout = setTimeout(function timeoutableTimeout() {
        var fnName = opts.method || opts.fn.name || '(anonymous)'
        var message = 'Function ' + fnName + ' timed out after ' + duration + 'ms';
        callbackHandler(new TimeoutableError(message));
      }, duration);

      if(opts.instance) {
        opts.instance[opts.method].apply(opts.instance, opts.args.concat(callback));
      } else {
        __apply(opts.fn, opts.args.concat(callback));
      }
    }
  }
};

// ensure "this" is what it would usually be in a function without
// a context
var __apply = function applyWithoutContext(fn, argsArray) {
  fn.apply(this, argsArray);
};

// If callback is never called, your code may be leaking memory. Put
// an upper limit on the number of times we'll allow that to happen.
timeoutable.orphanedCallbacks = 0;
timeoutable.maxOrphanedCallbacks = 50000;

var trackOrphanedCallback = function timeoutableTrackOrphanedCallback() {
  timeoutable.orphanedCallbacks++;
  if(timeoutable.orphanedCallbacks > timeoutable.maxOrphanedCallbacks) {
    throw new TimeoutableError('Maximum number (' + timeoutable.maxOrphanedCallbacks + ') of orphaned callbacks exceeded.')
  }
};

// Multiple calls to callback is probably a bug, this module would
// effectively mask that. By default it's just tracked in this variable,
// in development this should probably be set to "1".
timeoutable.multipleCallbacks = 0;
timeoutable.maxMultipleCallbacks = Infinity;

var trackMultipleCallback = function timeoutableTrackMultipleCallback() {
  timeoutable.multipleCallbacks++;
  if(timeoutable.multipleCallbacks > timeoutable.maxMultipleCallbacks) {
    throw new TimeoutableError('Maximum number (' + timeoutable.maxMultipleCallbacks + ') of multiple callbacks exceeded.')
  }
};

// Re-export our error instance, so it can be tested for
// without regexing on the message
timeoutable.TimeoutableError = TimeoutableError;

module.exports = timeoutable;
