/*
  The purpose of this file is to test how the process.nextTick() method will handle 4 setTimeout() tasks
*/
(function () {
  'use strict';


  /*Top level error handler*/
  process.on('uncaughtException', function (error) {
    var date = new Date;

    console.log(' ');
    console.log('   Final process Error at '+ date.getTime() +', '+ date.getHours() +':'+ date.getMinutes() +':'+ date.getSeconds() +', '+ date.getDate() +'.'+ (date.getMonth()+1) +'.'+ date.getFullYear() );
    console.log('----------------------------------------------------------------');
    console.log( error.stack );
  });


  var utils = require('../lib/utils');
  var log   = utils.log;



  var start_time = new Date().getTime();


  process.nextTick(function () {
    log('Task 1 - start');

    setTimeout(function () {
      log('Task 1 - complete');
      callback(null, 11);
    }, 5000);
  });


  process.nextTick(function () {
    log('Task 2 - start');

    setTimeout(function () {
      log('Task 2 - complete');
      callback(null, 22);
    }, 4000);
  });


  process.nextTick(function () {
    log('Task 3 - start');

    setTimeout(function () {
      log('Task 3 - complete');
      callback(null, 33);
    }, 3000);
  });


  process.nextTick(function () {
    log('Task 4 - start');

    setTimeout(function () {
      log('Task 4 - complete');
      callback(null, 44);
    }, 2000);
  });


  var
  total_callback = 4,
  error          = null,
  results        = [];

  function callback(_error, result) {
    --total_callback;

    error = error || _error;
    results.push( result );

    if (!total_callback) {
      log('');
      log('--------------------------------');
      log('error         : ', error  );
      log('results       : ', results);
      log('execution time: ', new Date().getTime() - start_time, 'millisecs')
      log('');
    }
  }
})();