/*
  The purpose of this file is to test how long it'll take for the process.nextTick() method to calculate 4 "light" tasks
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


  var
  task_counter_1 = 10000000,
  task_counter_2 = 10000000,
  task_counter_3 = 1000,
  task_counter_4 = 1000;


  log('');
  log('task_counter_1 =', task_counter_1);
  log('task_counter_2 =', task_counter_2);
  log('task_counter_3 =', task_counter_3);
  log('task_counter_4 =', task_counter_4);
  log('');


  var start_time = new Date().getTime();


  process.nextTick(function () {
    console.log('Task 1 - start');

    while (--task_counter_1);

    console.log('Task 1 - complete');
    callback(null, task_counter_1);
  });


  process.nextTick(function () {
    console.log('Task 2 - start');

    while (--task_counter_2);

    console.log('Task 2 - complete');
    callback(null, task_counter_2);
  });


  process.nextTick(function () {
    console.log('Task 3 - start');

    while (--task_counter_3);

    console.log('Task 3 - complete');
    callback(null, task_counter_3);
  });


  process.nextTick(function () {
    console.log('Task 4 - start');

    while (--task_counter_4);

    console.log('Task 4 - complete');
    callback(null, task_counter_4);
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