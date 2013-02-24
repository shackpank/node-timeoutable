Timeoutable
-----------

A lightweight module written around the node callback-as-last-argument pattern, that interrupts if something is slow to respond.

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

This module absorbs things that might normally cause errors (example: callback being called multiple times, & the callback calls res.send); it tracks them, but doesn't complain unless you configure it to. (I need to add a bit more detail to this.)

Yeah, also
-----

Wrote this on a Sunday evening. Please open an issue, or a pull request, if you have ideas for improvements!