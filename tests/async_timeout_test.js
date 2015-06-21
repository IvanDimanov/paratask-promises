/*
  The purpose of this file is to test how the async.parallel() method will handle 4 setTimeout() tasks
*/
(function () {
  'use strict';


  /*Top level error handler*/
  process.on('uncaughtException', function (error) {
    var date = new Date;

    console.log(' ');
    console.log('   Final process Error at '+ date.getTime() +', '+ date.getDate() +'.'+ (date.getMonth()+1) +'.'+ date.getFullYear() +', '+ date.getHours() +':'+ date.getMinutes() +':'+ date.getSeconds() );
    console.log('----------------------------------------------------------------');
    console.log( error.stack );
  });



  var
  async = require('async'),
  utils = require('../lib/utils'),
  log   = utils.log;


  var start_time = new Date().getTime();


  async.parallel([
    function (callback) {
      log('Task 1 - start');

      setTimeout(function () {
        log('Task 1 - complete');
        callback(null, 11);
      }, 5000);
    },


    function (callback) {
      log('Task 2 - start');

      setTimeout(function () {
        log('Task 2 - complete');
        callback(null, 22);
      }, 4000);
    },


    function (callback) {
      log('Task 3 - start');

      setTimeout(function () {
        log('Task 3 - complete');
        callback(null, 33);
      }, 3000);
    },


    function (callback) {
      log('Task 4 - start');

      setTimeout(function () {
        log('Task 4 - complete');
        callback(null, 44);
      }, 2000);
    }
  ],

  function (error, results) {
    log('');
    log('--------------------------------');
    log('error         : ', error  );
    log('results       : ', results);
    log('execution time: ', new Date().getTime() - start_time, 'millisecs')
    log('');
  });
})();