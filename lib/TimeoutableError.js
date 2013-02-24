var TimeoutableError,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

TimeoutableError = (function(_super) {

  __extends(TimeoutableError, _super);

  function TimeoutableError() {
    return TimeoutableError.__super__.constructor.apply(this, arguments);
  }

  return TimeoutableError;

})(Error);

module.exports = TimeoutableError;
