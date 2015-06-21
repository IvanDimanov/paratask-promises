/*
  This file will test if our main module is compatible with its old legacy versions.
*/
'use strict';

var paratask = require('../lib/index.js');


module.exports = {
  'calling "paratask()" with "context" function': function (test) {
    test.expect(2);

    var task = {
      fork: function (resolve) {
        resolve(i);
      },
      context: {
        i: 1
      }
    };

    paratask([ task ])
    .then(function (results) {
      test.equal( results instanceof Array, true, '"results" must be an array of fork calculation results');
      test.equal( results[0]              ,    1, '"results[0]" must be its "context.i" property = 1');

      /*Mark the test as completed*/
      test.done();
    });
  }
};