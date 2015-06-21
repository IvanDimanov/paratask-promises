/*
  This file will cover cases where error occur in parallel process 'reject'.
  These errors can be expected (with 'reject' as 2nd argument) or unexpected (throwing on the process)
*/
'use strict';

var paratask = require('../lib/index.js');


module.exports = {
  'expected reject error': function (test) {
    test.expect(1);

    var task = {
      fork: function (resolve, reject) {
        reject('Test error');
      }
    };

    paratask([ task ])
    .catch(function (error) {
      test.equal( error, 'Test error', 'Correctly returned callback error');

      /*Mark the test as completed*/
      test.done();
    });
  },


  'unexpected throw error': function (test) {
    test.expect(1);

    var task = {
      fork: function () {
        JSON.parse();
      }
    };

    paratask([ task ])
    .catch(function (error) {
      test.equal( error.stack.indexOf('SyntaxError'), 0, '"JSON.parse()" of "undefined" in callback triggers "SyntaxError"');

      /*Mark the test as completed*/
      test.done();
    });
  },


  'unexpected time delayed throw error': function (test) {
    test.expect(1);

    var task = {
      fork: function (callback) {
        setTimeout(function () {
          JSON.parse();
        });
      }
    };

    paratask([ task ])
    .catch(function (error) {
      test.equal( error.stack.indexOf('SyntaxError'), 0, '"JSON.parse()" of "undefined" in "setTimeout()" in callback triggers "SyntaxError"');

      /*Mark the test as completed*/
      test.done();
    });
  }
};