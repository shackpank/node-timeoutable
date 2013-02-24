timeoutable = require '../'
sinon       = require 'sinon'
assert      = require 'assert'

describe 'timeoutable', ->
  # pending
  describe 'detecting multiple callbacks', ->
    beforeEach ->
      @clock = sinon.useFakeTimers()

    afterEach ->
      @clock.restore()

    it 'tracks when input calls their callbacks multiple times', ->

      spy = sinon.spy()
      timeoutable.maxMultipleCallbacks = Infinity
      current = timeoutable.multipleCallbacks

      timeoutable(5000, spy).run( (callback) ->
        callback() for i in [1..25]
      )

      assert.equal spy.callCount, 1
      assert.equal timeoutable.multipleCallbacks, current + 24

    it 'does not count the builtin timeout callback', ->
      spy = sinon.spy()
      timeoutable.maxMultipleCallbacks = Infinity
      current = timeoutable.multipleCallbacks

      timeoutable(5000, spy).run( (callback) ->
        callback() for i in [1..25]
      )

      @clock.tick(6000)

      assert.equal spy.callCount, 1
      assert.equal timeoutable.multipleCallbacks, current + 25
