var events = require('events')
  , util = require('util')
  ;

function Must () {
  var self = this
  events.EventEmitter.call(self)
  self._must = {}
  self.results = {}
  self._nt = false
  self.dests = []
  process.nextTick(function () {
    self._nt = true
    self._check()
  })
  self._emit = self.emit
  self.emit = function (key) {
    self._must[key] = true
    if (arguments.length > 2) {
      self.results[key] = Array.prototype.slice.call(arguments, 1)
    } else {
      self.results[key] = arguments[1]
    }
    self._emit.apply(self, arguments)
    if (!self._block) self._check()
  }
}
util.inherits(Must, events.EventEmitter)
Must.prototype.must = function () {
  var args = Array.prototype.slice.call(arguments)
    , cb
    ;
  if (typeof args[args.length - 1] === 'function') cb = args.pop()
  for (var i=0;i<args.length;i++) {
    if (args[i] === 'end' || args[i] === 'dest') throw new Error("Cannot used reserved names: end, dest.")
    this._must[args[i]] = false
    if (cb) this.once(args[i], cb)
  }
  return this
}
Must.prototype.set = function (key, value) {
  if (typeof key === 'object') {
    this._block = true // block checks from firing until complete
    for (i in key) {
      this.set(i, key[i])
    }
    this._block = false
    this._check()
    return
  }
  this.emit(key, value)
}
Must.prototype.pipe = function (dest, options) {
  this.dests.push([dest, options])
}
Must.prototype._check = function () {
  var self = this
  if (self._block || !self._nt) return
  
  if (Object.keys(self._must).filter(function (k) {return !self._must[k]}).length === 0) {
    self._emit('end')
    for (var i=0;i<self.dests.length;i++) {
      self._emit('dest', self.dests[i][0], self.dests[i][1])
    }
  }
}


module.exports = function () {return new Must() }
