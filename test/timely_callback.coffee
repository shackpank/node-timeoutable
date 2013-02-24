timeoutable = require '../'
sinon       = require 'sinon'
assert      = require 'assert'

describe 'timeoutable', ->
  describe 'functions calling back within the timeout duration', ->
    it 'passes arguments through if calling a function', ->
      spy = sinon.spy()

      timeoutable(10000, spy).run( (one, two, callback) -> 
        callback null, one + two
      , [ 1, 2 ])

      assert.equal spy.called, true
      assert.equal spy.callCount, 1
      assert.deepEqual spy.lastCall.args, [ null, 3 ]

    it 'passes on errors if there was a problem', ->
      spy = sinon.spy()

      timeoutable(10000, spy).run( (one, two, callback) -> 
        callback new Error('there was a problem')
      , [ 1, 2 ])

      assert.equal spy.called, true
      assert.equal spy.callCount, 1
      assert.equal spy.lastCall.args[0] instanceof Error, true
      assert.equal spy.lastCall.args[0].message, 'there was a problem'

    it 'has the same behaviour with "instance methods"', ->
      spy = sinon.spy()
      class SomeClass
        currentValue: 6
        increaseValue: (amount, callback) ->
          @currentValue += amount
          callback(null, true)
      instance = new SomeClass()

      timeoutable(10000, spy).run(instance, "increaseValue", [ 3 ])

      assert.equal spy.called, true
      assert.equal spy.callCount, 1
      assert.deepEqual spy.lastCall.args, [ null, true ]
      assert.equal instance.currentValue, 9
