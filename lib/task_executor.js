/*
  This file is spawned as a separate Node.js process which will
  execute tasks, described with task instructions, exchanged with inter process communication
*/

/*Notify the main process about the reason of a possible unexpected shutdown*/
process.on('uncaughtException', function (error) {
  process.send({
    error             : error.stack,
    error_exact_typeof: 'Error'
  });
});

/*Catch and send any throws of Promises that are missing '.catch()' property*/
process.on('unhandledRejection', function (error) {
  process.send({
    error             : error.stack,
    error_exact_typeof: 'Error'
  });
});


var fs    = require('fs');
var utils = require('./utils');
var log   = utils.log;


/*Wait till the parent is ready to send task instructions*/
process.on('message', function (message) {

  /*Extract the instruction file location and the data records from it*/
  var shared_data_file_path = message.shared_data_file_path;
  var shared_data_string    = fs.readFileSync( shared_data_file_path );
  var shared_data_json      = {};

  /*This process is the only who'll use the data*/
  fs.unlinkSync( shared_data_file_path );


  /*
    Even if there's no need for specific function scope,
    having a valid JSON scope description is crucial for the fork function execution
  */
  try {
    shared_data_json = JSON.parse( shared_data_string );
  } catch (error) {
    process.send({
      error             : new Error('Unable to execute "JSON.parse()" over file content "'+ shared_data_file_path +'": '+ error).stack,
      error_exact_typeof: 'Error'
    });
    return;
  }


  /*Find the fork function that will be executed, its function body, and the scope it depends on*/
  var fork_string = shared_data_json.fork_string;
  var fork_body   = fork_string.substring( fork_string.indexOf('{')+1, fork_string.lastIndexOf('}'));
  var scope       = shared_data_json.scope;


  /*
    For any given function string,
    it will return an array of strings,
    presenting the incoming function arguments as names.
    Inspired from Angular.js dependency management.

    Example:
      getFunctionStringArgumentsNames( function (name, _uid, callback) { ... }.toString() )  =>  ['name', '_uid', 'callback']
  */
  var getFunctionStringArgumentsNames = (function () {
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    var FN_ARGS        = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
    var FN_ARG_SPLIT   = /,/;
    var FN_ARG         = /^\s*(_?)(\S+?)\1\s*$/;

    return function (fn_string) {
      if (typeof fn_string !== 'string') {
        throw new TypeError('1st argument must be a string');
      }

      var fn_text                = fn_string.replace(STRIP_COMMENTS, '');
      var args_declaration_match = fn_text.match(FN_ARGS);

      if (!args_declaration_match) {
        return [];
      }


      /*Go through all matched arguments and format them*/
      return args_declaration_match[1]
        .split(FN_ARG_SPLIT)
        .map(function (arg) {
          return arg.split(FN_ARG)[2]
        });
    };
  })();


  /*
    Find the names of the functions that will be called
    when the task is finally resolved: fulfilled (resolved) or rejected
  */
  var fork_arguments_names_arr = getFunctionStringArgumentsNames( fork_string );
  var resolve_name             = fork_arguments_names_arr[0];
  var reject_name              = fork_arguments_names_arr[1];


  /*Be sure there are no more arguments to the fork function except the 'resolve' and 'reject' functions*/
  if (fork_arguments_names_arr.length > 2) {
    process.send({
      error             : new Error('Fork function below must have no more than 2 arguments (reject and resolve) but it have '+ fork_arguments_names_arr.length +':\n'+ fork_string).stack,
      error_exact_typeof: 'Error'
    });
    return;
  }


  /*
    The logic below will separate all 'scope' arguments in 2 lists,
    where the 1st list is a {string} with all of the arguments' names,
    and the 2nd list is an {array} of all arguments' values.
    The point of this is to use them later as new arguments on the Fork function.
  */
  var fork_arguments_names  = 'require';  /*Give fork the opportunity to 'require' own packages*/
  var fork_arguments_values = [require];
  (function () {

    /*All all dependencies mentioned in 'scope'*/
    utils.each( scope, function (value, name) {
      fork_arguments_names += ','+ name;
      fork_arguments_values.push( value );
    });


    /*If any 'resolve' function is needed from the fork, we'll assign it*/
    if (resolve_name &&
        typeof resolve_name === 'string'
    ) {
      fork_arguments_names += ','+ resolve_name;
      fork_arguments_values.push(function (result) {
        var result_exact_typeof = utils.exactTypeof( result );

        process.send({
          result             : result_exact_typeof === 'Error' ? result.stack : result,
          result_exact_typeof: result_exact_typeof
        });
      });
    }


    /*If any 'reject' function is needed from the fork, we'll assign it*/
    if (reject_name &&
        typeof reject_name === 'string'
    ) {
      fork_arguments_names += ','+ reject_name;
      fork_arguments_values.push(function (error) {
        var error_exact_typeof = utils.exactTypeof( error );

        process.send({
          error             : error_exact_typeof === 'Error' ? error.stack : error,
          error_exact_typeof: error_exact_typeof,
        });
      });
    }
  })();


  /*
    Execute the Fork function body
    with all of its 'scope' variables as newly added arguments
    in a new error controlled environment
  */
  new Function( fork_arguments_names, fork_body ).apply(null, fork_arguments_values );
});