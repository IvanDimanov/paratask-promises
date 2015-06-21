/*
  The purpose of this file is to test how long it'll take for the async.parallel() method to calculate 4 "heavy" tasks
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


  /*Create a "heavy object" that will take some time to iterate over*/
  var
  complex_object          = {},
  total_object_properties = 1000,
  _i                      = total_object_properties;
  while (_i--) complex_object[ Math.random() ] = Infinity;

  log('complex_object.length =', utils.objectLength( complex_object ));


  /*Create an array which will take a lot of time to loop over*/
  var
  arr_1                = [],
  total_arr_1_elements = 1000,
  _i                   = total_arr_1_elements;
  while (_i--) arr_1.push( complex_object );

  log('arr_1.length =', arr_1.length);


  /*Create an array which will take a lot of time to loop over*/
  var
  arr_2                = [],
  total_arr_2_elements = 1000,
  _i                   = total_arr_2_elements;
  while (_i--) arr_2.push( complex_object );

  log('arr_2.length =', arr_2.length);


  /*Create an array which will take a lot of time to loop over*/
  var
  arr_3                = [],
  total_arr_3_elements = 1000,
  _i                   = total_arr_3_elements;
  while (_i--) arr_3.push( complex_object );

  log('arr_3.length =', arr_3.length);


  /*Create an array which will take a lot of time to loop over*/
  var
  arr_4                = [],
  total_arr_4_elements = 1000,
  _i                   = total_arr_4_elements;
  while (_i--) arr_4.push( complex_object );

  log('arr_4.length =', arr_4.length);


  var looping_iterations = 5000;
  log('looping_iterations =', looping_iterations);
  log('');



  var start_time = new Date().getTime();


  async.parallel([
    function (callback) {
      console.log('Task 1 - start');

      arr_1.forEach(function (element, id) {

        /*Present a huge time consuming test, (quite good we just have one :) )*/
        (function () {
          var
          _complex_object = {},
          _i              = looping_iterations;
          while (_i--) _complex_object[ Math.random() ] = Infinity;
        })();
      });

      /*Announce the exact time when the array looping is been completed*/
      console.log('Task 1 - complete');

      callback(null, 11);
    },


    function (callback) {
      console.log('Task 2 - start');

      arr_2.forEach(function (element, id) {

        /*Present a huge time consuming test, (quite good we just have one :) )*/
        (function () {
          var
          _complex_object = {},
          _i              = looping_iterations;
          while (_i--) _complex_object[ Math.random() ] = Infinity;
        })();
      });

      /*Announce the exact time when the array looping is been completed*/
      console.log('Task 2 - complete');

      callback(null, 22);
    },


    function (callback) {
      console.log('Task 3 - start');

      arr_3.forEach(function (element, id) {

        /*Present a huge time consuming test, (quite good we just have one :) )*/
        (function () {
          var
          _complex_object = {},
          _i              = looping_iterations;
          while (_i--) _complex_object[ Math.random() ] = Infinity;
        })();
      });

      /*Announce the exact time when the array looping is been completed*/
      console.log('Task 3 - complete');

      callback(null, 33);
    },


    function (callback) {
      console.log('Task 4 - start');

      arr_4.forEach(function (element, id) {

        /*Present a huge time consuming test, (quite good we just have one :) )*/
        (function () {
          var
          _complex_object = {},
          _i              = looping_iterations;
          while (_i--) _complex_object[ Math.random() ] = Infinity;
        })();
      });

      /*Announce the exact time when the array looping is been completed*/
      console.log('Task 4 - complete');

      callback(null, 44);
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