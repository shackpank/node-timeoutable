var config           = require('./config');
var matchArguments   = require('./argumentMatcher');
var TimeoutableError = require('./TimeoutableError');

timeoutable = function timeoutable(duration, callback) {
  return {
    run: function(a, b, c) {
      var opts = matchArguments(a, b, c);

      var calledBack = 0;

      var callbackHandler = function timeoutableCallbackHandler(error) {
        var timedOut = false;
        timeoutable.orphanedCallbacks--;

        if(error instanceof TimeoutableError) {
          timedOut = true;
        }

        if(calledBack) {
          if(!timedOut) {
            // Callbacks should only be called once.
            trackMultipleCallback();
          }
          calledBack++;
          return;
        }

        calledBack++;

        __apply(callback, Array.prototype.slice.call(arguments));
      }

      var timeout = setTimeout(function timeoutableTimeout() {
        var fnName = opts.method || opts.fn.name || '(anonymous)'
        var message = 'Function ' + fnName + ' timed out after ' + duration + 'ms';
        callbackHandler(new TimeoutableError(message));
      }, duration);

      // There is still a method running somewhere. Keep track -
      // we expect it to call in eventually.
      trackOrphanedCallback();

      if(opts.instance) {
        opts.instance[opts.method].apply(opts.instance, opts.args.concat(callbackHandler));
      } else {
        __apply(opts.fn, opts.args.concat(callbackHandler));
      }
    }
  }
};

// ensure "this" is what it would usually be in a function without
// a context
var __apply = function applyWithoutContext(fn, argsArray) {
  fn.apply(null, argsArray);
};

// If callback is never called, your code may be leaking memory. Put
// an upper limit on the number of times we'll allow that to happen.
timeoutable.orphanedCallbacks = 0;
timeoutable.maxOrphanedCallbacks = config.MAX_ORPHANED_CALLBACKS;

var trackOrphanedCallback = function timeoutableTrackOrphanedCallback() {
  timeoutable.orphanedCallbacks++; // What the user wants
  timeoutable.orphanedCallbacks++; // Our timeout callback
  if(timeoutable.orphanedCallbacks > timeoutable.maxOrphanedCallbacks) {
    throw new TimeoutableError('Maximum number (' + timeoutable.maxOrphanedCallbacks + ') of orphaned callbacks exceeded.')
  }
};

// Multiple (intentional) calls to callback is probably a bug,
// this module would effectively mask that. If you want that behaviour
// you're probably better off using an event emitter.
timeoutable.multipleCallbacks = 0;
timeoutable.maxMultipleCallbacks = config.MAX_MULTIPLE_CALLBACKS;

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
