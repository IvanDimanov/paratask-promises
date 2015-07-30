/*
  This file will cover test cases of using "paratask.usePromise()" functionality for setting
  custom/user preferred Promise constructor function
*/
'use strict';

var paratask = require('../lib/index.js');
var promise  = require('../lib/promise.js');
var bluebird = require('bluebird');


module.exports = {
  'calling "paratask.usePromise()" with wrong argument': function (test) {
    test.expect(3);

    try {
      paratask.usePromise();
    } catch (error) {
      test.ok( error instanceof TypeError, 'Empty call triggers a "TypeError"');
    }

    try {
      paratask.usePromise({});
    } catch (error) {
      test.ok( error instanceof TypeError, 'Called with empty object {} triggers a "TypeError"');
    }

    try {
      paratask.usePromise(function () {});
    } catch (error) {
      test.ok( error instanceof TypeError, 'Called with empty function "function () {}" triggers a "TypeError"');
    }

    test.done();
  },


  'calling "paratask.usePromise()" with valid Promise constructor functions': function (test) {
    test.expect(3);

    var task = {
      fork: function (resolve) {
        resolve(true);
      }
    };

    paratask([task])
      .then(function (resolved) {
        test.ok( resolved, 'Calling "paratask()" without setting "paratask.usePromise()" should use a default Promise constructor');

        paratask.usePromise( promise );
        return paratask([task]);
      })
      .then(function (resolved) {
        test.ok( resolved, 'Calling "paratask()" with set custom Promise constructor');

        paratask.usePromise( bluebird.Promise );
        return paratask([task]);
      })
      .then(function (resolved) {
        test.ok( resolved, 'Calling "paratask()" with set "bluebird" Promise constructor');
        test.done();
      })
  }
};