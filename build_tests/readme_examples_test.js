/*
  This file will test if all of the example usages of the 'paratask-promises' module mentioned in the 'readme.md' are correct
*/
'use strict';

var paratask = require('../lib/index.js');


module.exports = {
  'Test the 1st example from the "readme.md"': function (test) {
    test.expect(3);

    /*Follow the 1st example from the 'readme.md'*/

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

      /*Verify task performance*/
      test.equal( results.length,   2, 'There should be exactly 2 task results');
      test.equal( results[0]    , 100, '1st result should be 10x greater than "task_1.scope.count"');
      test.equal( results[1]    , 200, '2nd result should be 10x greater than "task_2.scope.count"');

      /*Mark the test as completed*/
      test.done();
    });
  },


  'Test the 2nd example from the "readme.md"': function (test) {
    test.expect(1);

    /*Follow the 2nd example from the 'readme.md'*/

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

      /*Verify task performance*/
      test.equal( error, 'Error message', 'The incoming error should be exactly the same as the one we executed in "task_2"');

      /*Mark the test as completed*/
      test.done();
    });
  }
};