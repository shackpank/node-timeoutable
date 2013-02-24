timeoutable = require '../'
sinon       = require 'sinon'
assert      = require 'assert'

describe 'timeoutable', ->
  describe 'functions taking longer than the callback duration', ->
    before ->
      @clock = sinon.useFakeTimers()

    after ->
      @clock.restore()

    it 'passes an error to the callback if calling a function', ->
      spy = sinon.spy()

      timeoutable(10000, spy).run( (one, two, callback) -> 
        # never run the callback
        three = one + two
      , [ 1, 2 ])

      @clock.tick(10000)

      assert.equal spy.called, true
      assert.equal spy.callCount, 1
      assert.equal spy.lastCall.args[0] instanceof Error, true
      assert.ok /.*timed out.*10000ms/.test(spy.lastCall.args[0].message)

    it 'passes an error to the callback if calling a method on an instance', ->
      spy = sinon.spy()
      class SomeClass
        stall: (callback) ->
          # do nothing
      instance = new SomeClass()

      timeoutable(10000, spy).run(instance, "stall")

      @clock.tick(10000)

      assert.equal spy.called, true
      assert.equal spy.callCount, 1
      assert.equal spy.lastCall.args[0] instanceof Error, true
      assert.ok /.*stall.*timed out.*10000ms/.test(spy.lastCall.args[0].message)
