Timeoutable
===========

A lightweight (no dependencies) module written around the node callback-as-last-argument pattern, that interrupts if something is slow to respond.

What's this for?
----------------

You don't trust libraries you use, or the web services behind them to respond in a timely manner; and waiting potentially forever is worse than failing fast.

Your application uses several libraries communicating with different remote services, so their individual timeout options aren't adequate to fail fast.

You want to guard against callbacks being called more or less than once (once being the best number of times for a callback to be called)

Basic usage
----------

    var timeoutable = require('timeoutable');

    timeoutable(2000, callback).run(function(callback){
      thing.thatMightTakeMoreThanTwoSeconds(callback);
    });

If the thing that _might_ take more than two seconds _actually_ takes more than two seconds, callback is invoked and passed an instance of TimeoutableError as the first argument. TimeoutableError is exported, so you can decide how severe of an error a timeout is:

    var timeoutable = require('timeoutable');
    var TimeoutableError = timeoutable.TimeoutableError;

    function callback(err, response) {
      if(err) {
        if(err instanceof TimeoutableError) {
          // idgaf, continue
        } else {
          return callback(err);
        }
      }
    };

Less basic usage
----------

Still not a lot to it.

    var timeoutable = require('timeoutable');

timeoutable expects a timeout duration, in milliseconds, and a callback; and returns an object with a "run" method.

    timeoutable(5000, function() { alert('this does nothing') });
    timeoutable(5000, function() { alert('hello') }).run(function(){
      callback(); // this alerts "hello"
    });

If you're just wrapping a function without any state, the above example holds.

Arguments are passed in as arrays:

    timeoutable(100, function() {}).run(function(a, b, c) {
      console.log(a, b, c);
    }, [ 1, 2, 3 ])
    // logs 1, 2, 3

If the timeoutable thing is a property of an instance of a "class", you need to do this:

    something = {
      state: 5,
      editState: function(newState, callback) {
        this.state = newState;
        callback()
      }
    }
    timeoutable(5000, function() { /* the callback */ })
      .run(something, "editState", [ 4 ])
    // something.state is now 4

Bonus features
---------

Timeoutable absorbs things that might normally cause errors (eg: express app, callback being called multiple times, & the callback calls res.send, that would throw); it tracks them, but how loudly it complains is configurable. The default behaviour is:

  - in development, throw immediately if a callback is called multiple times (1)
  - in development, throw if 50 callbacks haven't been called (2)
  - otherwise, don't throw unless you tell it to by reconfiguring upper limits

This is assuming you set the NODE_ENV environment variable to something (if you don't, everything is in development).

### Callbacks that callback and callback and callback and ca.. (1) ###

This is bad.

If you're using callbacks for control flow, as most node applications do, you'll repeat actions that you probably only meant to happen once. All it takes is missing out a `return;`

If you actually mean to call the same callback multiple times, an [EventEmitter](http://nodejs.org/api/events.html#events_class_events_eventemitter) is almost certainly the better choice.

Timeoutable prevents that bad thing happening, at the risk of making things incredibly difficult to debug; so in development it will complain very quickly about it.

Change the threshold with `timeoutable.maxMultipleCallbacks = ...`

### Callbacks that don't. (2) ###

This is bad.

You're almost definitely leaking memory. Probably not a lot, but it'll build up.

Timeoutable has quite a low crashing threshold in development, so hopefully if you are just leaving unresolved callbacks sitting around, it'll throw after an hour or so and you can figure out the problem.

Change the threshold with `timeoutable.maxOrphanedCallbacks = ...`
