'use strict';

/*Node.js file that will be spawn with different task instructions every time when new Node process is needed*/
var TASK_EXECUTOR_FILE_PATH = __dirname +'/task_executor.js';

/*Folder location from which JSON file task instructions will be exchanged between the parent and child processes*/
var SHARED_DATA_FOLDER_PATH = __dirname +'/shared_data/';


var fs    = require('fs');
var utils = require('./utils');
var log   = utils.log;

/*Used to 'spawn' new Node processes*/
var child_process_module = require('child_process');


/*
  This variable will hold the user preferred Promise constructor function.
  By default we'll use the Node/io.js Promise constructor if same is available
  or fallback to a predefined Promise/A+ constructor.
*/
var PromiseConstructor = typeof Promise === 'function' ? Promise : require('./promise');

/*Will tell whether or not we have "fs" function in a Promise variant*/
var is_fs_promisified = false;


/*
  Create a set of File System common functions that
  uses Promises in order to stay consistent with the main code
*/
function promisifyFs() {
  fs.existsPromise = function (path) {
    return new PromiseConstructor(function (resolve) {
      fs.exists(path, resolve);
    });
  }


  fs.unlinkPromise = function (path) {
    return new PromiseConstructor(function (resolve, reject) {
      fs.unlink(path, function (error) {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }


  fs.writeFilePromise = function (filename, data, options) {
    return new PromiseConstructor(function (resolve, reject) {
      fs.writeFile(filename, data, options, function (error) {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  is_fs_promisified = true;
}


/*
  This is the function that will be exported to 'module.exports'.
  Its purpose is to create a child process for each task in the tasks list and
  call the 'resolve/reject' function when all tasks are completed.

  Each task need to have the following properties:
    fork  - Promise-like function with arguments of 'resolve', 'reject' that the task need to execute with possible error state or calculation result upon completion;
    scope - JSON dependencies used from the fork() function; must contain only information data, i.e. no function () {}, new RegExp(), new Date(), etc.

  Example:
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
      console.log( results );  // [100, 200], 1st task result will be always the 1st in the results array even if complete last
    });
*/
function paratask(tasks) {
  if (typeof PromiseConstructor !== 'function') {
    throw new ReferenceError('"paratask-promises" package needs Promise constructor function (currently not available). You can use ECMAScript 5 "callback" style with: https://www.npmjs.com/package/paratask');
  }


  /*Be sure all "fs" function we need are in Promise variants*/
  if (!is_fs_promisified) {
    promisifyFs();
  }


  return new PromiseConstructor(function (resolve, reject) {

    /*
      Basic tasks list validation,
      detailed validation of each task will come when iterating over them
    */
    if (!(tasks instanceof Array) ||
        !tasks.length
    ) {
      throw new TypeError('1st argument must be an Array of task objects but was: {'+ typeof tasks +'} '+ utils.toString( tasks ));
    }


    var results                = [];  /*An array of all workers returned results.*/
    var shared_data_file_paths = [];  /*An array of each child worker JSON file path. Thees files hold the dependency injections for each worker.*/
    var child_processes        = [];  /*An array of all spawned worker processes. On successfully program completion, this list will be empty.*/


    /*Common function for killing any spawned child process and removing any records assign with it*/
    function killProcess(child_process_id) {

      /*Kill the child process*/
      if (child_processes[ child_process_id ]) {
          child_processes[ child_process_id ].kill();
      }


      /*Remove the fork task instructions*/
      fs.existsPromise( shared_data_file_paths[ child_process_id ] )
        .then(function (does_file_exist) {
          return does_file_exist ? fs.unlinkPromise( shared_data_file_paths[ child_process_id ] ) : false;
        })
        .catch(function (error) {

          /*No need to alarm if the file is already deleted*/
          if (!(error instanceof Error) ||
              !~error.message.indexOf('no such file')
          ) {
            throw new Error('Unable to delete processing file "'+ shared_data_file_paths[ child_process_id ] +'": '+ error);
          }
        });


      /*Erase the internal record for the child process*/
      if (child_processes[ child_process_id ]) {
        delete child_processes[ child_process_id ];
      }
    }


    /*Stops all currently started processes*/
    function killAllProcesses() {
      utils.each( child_processes, function (child_process, child_process_id) {
        killProcess( child_process_id );
      });
    }


    /*
      Will kill all workers and send the so far collected 'results'
      with explanation for the kill as 'error'.
    */
    var finishMainProcess = (function () {
      var was_final_callback_called = false;

      return function (error) {

        /*Be sure this function will be executed only once*/
        if (was_final_callback_called) {
          return;
        }
        was_final_callback_called = true;

        if (error) {
          reject(error);
        } else {
          resolve(results);
        }

        killAllProcesses();
      };
    })();


    /*Uses the "new Error().stack" property to return the related error message*/
    function getErrorMessageFromStack(stack) {
      if (typeof stack !== 'string' ||
          !stack.length
      ) {
        return '';
      }

      var message = stack.substr( stack.indexOf('Error: ') + 7);
      return message.substr(0, message.indexOf('\n'));
    }


    /*
      Not all data types are available for exchange with the Inter Process Communicator.
      That's why using a predefined 'typeof' schema, we'll try to return the 'variable' original form and properties.
      NOTE: Currently only "new Error()" object conversion is supported.
    */
    function convertProcessMessage(exact_typeof, variable) {

      /*Recreate original Error object using the incoming stack*/
      if (exact_typeof && 
          exact_typeof === 'Error'
      ) {
        var temp_error = new Error( getErrorMessageFromStack( variable ) );
        temp_error.stack = variable;

        variable = temp_error;
      }

      return variable;
    }


    /*Create a Node process for each task*/
    utils.each( tasks, function (task, task_index) {

      /*Detailed task validation with (hopefully) reasonable errors*/
      (function () {
        if (!task ||
            typeof task !== 'object'
        ) {
          throw new TypeError('Task with index '+ task_index +' is invalid object: {'+ typeof task +'} '+ utils.toString( task ));
        }

        if (typeof task.fork !== 'function') {
          throw new TypeError('Task with index '+ task_index +' must have "fork" property as a function but was: {'+ typeof task.fork +'} '+ utils.toString( task.fork ));
        }

        /*Alias the 'context' legacy property with the current (and most common) 'scope' property*/
        if (typeof task.scope   === 'undefined' &&
            typeof task.context !== 'undefined'
        ) {
          task.scope   = task.context;
          task.context = undefined;
        }

        if (typeof task.scope !== 'undefined' &&
            typeof task.scope !== 'object'
        ) {
          throw new TypeError('Task with index '+ task_index +', if sent, "scope" property must be of type {object} but was: {'+ typeof task.scope +'} '+ utils.toString( task.scope ));
        }
      })();


      /*Create a child Node process and keep its instance for later message binding*/
      var child_process_id = child_processes.length;
      child_processes.push( child_process_module.fork( TASK_EXECUTOR_FILE_PATH ));


      /*TODO: Inter process communication with '.send()'' is limited to short messages, hence,
              sending long functions or large amount of 'scope' dependencies will
              either be concatenated before sending, or the communication will fail duo time limit.
              A workaround is to save all data as JSON in a file (file name ~ 'child_process_id') and
              send only the file name so the 'child' process could JSON.parse() the data by itself.
              The huge challenge is to create a "global scope namespace" where the 'fork()'
              will "live" with all of its 'scope' dependencies (functions and variables external for 'fork()').
      */
      shared_data_file_paths[ child_process_id ] = SHARED_DATA_FOLDER_PATH + new Date().getTime() +'_'+ child_process_id +'_'+ Math.random() +'.json';
      var shared_data_json = {
        fork_string: task.fork.toString(),
        scope      : task.scope
      };


      /*Send the instructions only if all are been correctly recorded*/
      fs.writeFilePromise( shared_data_file_paths[ child_process_id ], JSON.stringify( shared_data_json ))
        .then(function () {
          child_processes[ child_process_id ].send({shared_data_file_path: shared_data_file_paths[ child_process_id ]});


          /*Wait for any process update of the started task*/
          child_processes[ child_process_id ].on('message', function (message) {
            if (message.error) {

              /*
                Interprocess communicator is unable to exchange Error objects.
                In order to return the original error to the callee,
                we'll use a common converter
              */
              message.error = convertProcessMessage( message.error_exact_typeof, message.error );

              /*
                All processes calculations are assumed to be connected so
                error in one of them should cancel further work in all
              */
              finishMainProcess( message.error );

            } else {

              /*Keep the calculated result from the child process and kill the spawned process since it's no longer needed*/
              results[ child_process_id ] = convertProcessMessage( message.result_exact_typeof, message.result );
              killProcess( child_process_id );
            }

          }, function (error) {
            finishMainProcess( error );
          });


        /*Notify the end-user whenever all of the child processes are been completed (or canceled)*/
        child_processes[ child_process_id ].on('close', function () {

          /*Check if that was the last process we waited to complete*/
          if (!utils.objectLength( child_processes )) {
            finishMainProcess( null );
          }
        });


        /*Clear process settings in all cases*/
        child_processes[ child_process_id ].on('disconnect', function () {
          killProcess( child_process_id );
        });
        child_processes[ child_process_id ].on('exit', function () {
          killProcess( child_process_id );
        });

      })/*End of 'fs.writeFilePromise().then'*/

    });/*End of 'utils.each( tasks )'*/
  });
}


/*Letting the user choose his own version of Promise constructor function*/
paratask.usePromise = function (_Promise) {

  /*Secure valid Promise uses*/
  if (typeof _Promise !== 'function') {
    throw new TypeError('Incoming parameter must be a Promise constructor function');
  }


  var test_pomise = new _Promise(function () {});

  if (typeof test_pomise !== 'object') {
    throw new TypeError('Current Promise constructor function must return Promise object');
  }

  if (typeof test_pomise.then !== 'function') {
    throw new TypeError('Current Promise constructor function must return Promise object with "then" function property');
  }

  /*Start using the validated user preferred Promise constructor*/
  PromiseConstructor = _Promise;

  /*
    Use the user preferred Promise constructor as
    the de facto function for File System access
  */
  promisifyFs();
}


/*Give external access to the main function*/
module.exports = paratask;