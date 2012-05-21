var must = require('./index')
  , assert = require('assert')
  ;
  
var test1 = must()
test1.set('key', true)
test1.on('end', function () {
  test1.passed = true
  assert.ok(test1.results['key'])
})

var test2 = must()
test2.must('key', function (value) {
  test2.passed = value
})
process.nextTick(function () {
  test2.set('key', true)
})

var test3 = must()
test3.must('key1', 'key2', 'key3')
test3.passed = true
test3.on('end', function () {
  test3.passed = false
})
process.nextTick(function () {
  test3.set('key', true)
  test3.set('key1', true)
  test3.set('key2', true)
})

