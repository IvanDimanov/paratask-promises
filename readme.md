# Paratask - Node/io.js Parallel Process Manager
[![Build Status](https://secure.travis-ci.org/IvanDimanov/paratask-promises.png?branch=master)](http://travis-ci.org/IvanDimanov/paratask-promises)
[![NPM version](https://badge.fury.io/js/paratask-promises.png)](http://badge.fury.io/js/paratask-promises)

Paratask is a tool that will execute your code in __parallel__ using the full potential of multi-process programming.
In contrast to asynchronous task management, Paratask will create a child Node/io.js process in which your task function will 'live'.

__Note:__ Scope dependency injection is at your service. More into in the examples below.

__Note:__ This modules embraces the __Promises/A+__ standard. If you're more into ES5 "callback" style you can use [paratask](https://github.com/IvanDimanov/paratask)


## Install
You can install Paratask __Promises/A+__ with the Node Package Manager:
```shell
npm install paratask-promises
```
or by getting it from [this repo](https://github.com/IvanDimanov/paratask-promises).

## Dependencies
Paratask uses only native Node/io.js modules that do not need additional installation: `fs` and `child_process`.


### Example: Parallel calculation
Both `task_1` and `task_2` will fork a new Node/io.js process and will run __concurrently__.
When both call `resolve()`, the final results will be printed in the console.

__Note:__ `scope` property is your dependency injector. Can only be a valid `JSON.parse()` value (i.e. no functions allowed).

```javascript
var paratask = require('paratask-promises');

var task_1 = {
  fork: function (resolve) {
    // Some calculation using the 'count' scope var
    var result = count * 10;
    resolve(result);
  },
  scope: {
    count: 10
  }
};

var task_2 = {
  fork: function (resolve) {
    // Some calculation using the 'count' scope var
    var result = count * 10;
    resolve(result);
  },
  scope: {
    count: 20
  }
};

paratask([ task_1, task_2 ])
.then(function (results) {
  console.log( results );  // [100, 200], 1st task result will be always the 1st in the results array even if completed last
});
```


### Example: Error handling

Both `task_1` and `task_2` will fork a new process but
when `task_2` call `reject('Error message')`
both processes will be killed and the final `.then()` will be executed.

__Note:__ `scope` property is optional.

```javascript
var paratask = require('paratask-promises');

var task_1 = {
  fork: function (resolve) {
    var count     = 100000;
    var factorial = 1;

    while (--count) factorial *= count;

    resolve(null, factorial);
  }
};

var task_2 = {
  fork: function (resolve, reject) {
    reject('Error message');
  }
};

paratask([ task_1, task_2 ])
.catch(function (error) {
  console.log( error );  // 'Error message'
});
```


## Comparison tests
A palette of comparison tests between `paratask()`, `async.parallel()`, and `process.nextTick()` are available in `./tests` folder.

### Heavy calculation test:

```shell
node tests/async_heavy_test.js
```
```shell
node tests/process_nextTick_heavy_test.js
```
```shell
node tests/paratask_heavy_test.js
```


## Conclusion
Paratask is great when you have several time consuming task functions with few external dependencies.
In such cases, __multi-processing__ is the best approach.
When you want to manage several relevantly quick functions with asynchronous logic, [async](https://github.com/caolan/async) will handle it with beauty.