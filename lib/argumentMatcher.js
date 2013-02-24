module.exports = function timeoutableArgumentMatcher(a, b, c) {
  var opts = {};

  if(c) {
    opts.instance = a;
    opts.method = b;
    opts.args = c || [];
  } else {
    if(!b) {
      opts.fn = a;
      opts.args = [];
    } else if(Array.isArray(b)) {
      opts.fn = a;
      opts.args = b;
    } else {
      opts.instance = a;
      opts.method = b;
      opts.args = [];
    }
  }

  return opts;
};