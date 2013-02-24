timeoutable = require '../'
sinon       = require 'sinon'
assert      = require 'assert'

describe 'timeoutable', ->
  describe 'detecting orphaned/leftover callbacks', ->
    before ->
      @clock = sinon.useFakeTimers()

    after ->
      @clock.restore()

    it 'tracks when leftover callbacks build up', ->
      spy = sinon.spy()
      timeoutable.maxOrphanedCallbacks = Infinity
      current = timeoutable.orphanedCallbacks

      ( -> 
        timeoutable(5000, spy).run( (callback) ->
          setTimeout callback, 10000
        )
      )() for i in [1..25]

      @clock.tick(6000)

      assert.equal spy.callCount, 25
      assert.equal timeoutable.orphanedCallbacks, current + 25

      @clock.tick(6000)

      assert.equal timeoutable.orphanedCallbacks, current
