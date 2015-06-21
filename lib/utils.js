/**
 * Common set of general purpose JS functions.
 * They will be directly exported if 'module.exports' is been provided as Node.js or
 * will overwrite 'window.utils' as object properties
 */
 (function () {
    'use strict';


    /*Short-hand debug function*/
    function log() {
        return console.log.apply( console, arguments );
    }


    /**
     * Intended to be used as 'console.log' method but in the browsers' page.
     * Will print every incoming arguments in using the 'document.write()' function
     * 
     * @dependences
     *   each()
     *   toString()
     * 
     * @example
     *   documentLog()                               Prints=>  '<br />'
     *   documentLog(17)                             Prints=>  '17 <br />'
     *   documentLog(typeof 17, 17)                  Prints=>  'number 17 <br />'
     *   documentLog('a', {"key":"val"}, undefined)  Prints=>  'a {"key":"val"}  <br />'
     */
    function documentLog() {

        /*Secure common browser 'document' object*/
        if (
          typeof document      !== 'object' ||
          typeof document.body !== 'object'
        ) return;


        var text = '';
        each( arguments, function (argument) {
            text += toString( argument ) +' ';
        });

        return document.body.innerHTML += '<pre>'+ text +'</pre>';
    }



    /*Remove spaces from both string ends*/
    function trim(str) {
        return typeof str == 'string' ? str.replace(/^\s+|\s+$/g, '') : '';
    }


    /**
     * Takes a string of words and removes all white spaces between, before and after the words,
     * 
     * @param  {String} str Presumably long string of words
     * @return {String}     Same as the income str but trimmed + with no long white spaces between each word
     *
     * @example
     *   normalize('   x x    x x') => "x x x x"
     *   normalize('x x')           => "x x"
     */
    function normalize(str) {
        return ( (str + '').match(/\S+/g) || [] ).join(' ');
    }


    /**
     * Convert any JS data type to secured {String} type
     * NOTE: 'toString()' is a received function for some browsers
     * 
     * @dependences
     *   JSON_stringify()
     * 
     * @param  {Mixed}  message  Any type of var that need a String convert
     * @return {String}          Secured String format or an empty string ('')
     */
    function toString(message) {
        switch (typeof message) {
            case 'string':
                return message;
            break;

            case 'boolean':
            case 'number':
                return message +'';
            break;

            case 'object':
                if (message instanceof Error ) return message.message;
                if (message instanceof RegExp) return message.toString();

                return JSON_stringify( message );
            break;

            case 'function':
                return message.toString();
            break;

            default:
                return '';
            break;
        }
    }


    /**
     * Check if the income var is a real number (integer, octal, or float).
     * 
     * @param  {Mixed}   number  The variable that need to be checked if it's a number var
     * @return {Boolean}         Return a true if the income var is a number (else false)
     */
    function isNumber(number) {
      return !isNaN( parseFloat(number) ) && isFinite(number);
    }


    /**
     * Check if the incoming 'float_number' is a floating point number
     * 
     * @dependences
     *     isNumber()
     */
    function isFloat(float_number) {
        return isNumber(float_number) && (float_number % 1);
    }


    /**
     * Check if the incoming 'int' is an Integer number
     * 
     * @dependences
     *     isNumber()
     */
    function isInteger(int) {
        return isNumber(int) && !(int % 1);
    }


    /**
     * Extend an integer number by adding '0' in front.
     * 
     * @author Ivan Dimanov
     * @param  n      An integer number to be extended
     * @param  digits Total number of final digits
     * 
     * @depends
     *     isNumber()
     * 
     * @example
     *   setDigits( 7  , 3)    => '007'
     *   setDigits('7' , 3)    => '007'
     *   setDigits('70', 3)    => '070'
     *   setDigits('a7', 3)    => 'a7'
     *   setDigits( 7  , 'a3') => 7
     * 
     */
    function setDigits(n, digets) {
        digets  *= 1;
        var diff = digets - (n + '').length;

        if (isNumber(n) && isNumber(digets) && diff > 0) {
            while (diff--) n = '0' + n;
        }

        return n;
    }


    /**
     * Set an incoming number between 2 number values
     * 
     * @param  {Number}  num      The number we want to get in between
     * @param  {Number}  limit_1  1st number limit
     * @param  {Number}  limit_2  2nd number limit
     * @return {Number}           Clamped number or if any errors occurred, the same incoming num
     */
    function clampNumber(num, limit_1, limit_2) {

        /*Echo the incoming test number if no valid input is been provided*/
        if (
            !isNumber( num )     ||
            !isNumber( limit_1 ) ||
            !isNumber( limit_2 )
        ) return num;

        var
        /*Take maximum and minimum values from the incoming limits*/
        clamped = num,
        max     = Math.max(limit_1, limit_2),
        min     = Math.min(limit_1, limit_2);

        /*Clamp the incoming number between its value limits*/
        if (num > max) clamped = max;
        if (num < min) clamped = min;

        return clamped;
    }


    /**
     * Takes any Real number and tries to round it till the new point position.
     * @example
     *     roundAfterPoint( 7.119511 ,  3 )  =>  7.12
     *     roundAfterPoint( 7.119411 ,  3 )  =>  7.119
     *     roundAfterPoint('7.119411',  3 )  =>  7.119
     *     roundAfterPoint( 7.119411 , '3')  =>  7.119
     *     roundAfterPoint('a.119411',  3 )  =>  'a.119411'
     *     roundAfterPoint( 7.119411 , -3 )  =>  7.119411
     *     roundAfterPoint( 7.119411 , 'a')  =>  7.119411
     */
    function roundAfterPoint(_number, _precession) {
        var
        number     = _number *1,
        precession = _precession *1;

        /*Validate number input*/
        if (isNaN(number)     || !number       ) return _number;
        if (isNaN(precession) || precession < 0) return _number;

        /*Calculate the exact position from where we should make a round*/
        var precession_coeff = 1;
        while (precession--) precession_coeff *= 10;

        return Math.round( number *precession_coeff ) /precession_coeff;
    }


    /**
     * Will search for the Greatest Common Divisor for any given 2 numbers
     * http://en.wikipedia.org/wiki/Greatest_common_divisor
     * 
     * @dependencies
     *   isNumber
     * 
     * @example
     *   greatestCommonDivisor( 8    , 12 )  =>  4
     *   greatestCommonDivisor( 0.750, 10 )  =>  0.25
     */
    function greatestCommonDivisor(number_1, number_2) {

      /*Number types check-in*/
      if (!isNumber(number_1) || !isNumber(number_2)) return NaN;

      /*Keep dividing till we find the exact divisor number as 'number_1'*/
      var temp_number_1;
      while (number_2) {
        temp_number_1 = number_1;
        number_1      = number_2;
        number_2      = temp_number_1 % number_2;
      }

      return number_1;
    }


    /**
     * Convert any floating point number to a fractional string 
     * 
     * @dependencies
     *   isNumber
     *   isInteger
     *   isFloat
     * 
     * @example
     *   floatToFraction( 0.750 )  =>  "3/4"
     *   floatToFraction( 15.12 )  =>  "378/25"
     */
    function floatToFraction(float_number) {

      /*Floating number types check*/
      if (!isNumber( float_number )) return NaN;

      /*"Easy" integer cases check*/
      if (isInteger( float_number )) return float_number +'/1';


      /*
          Perform the calculation using only positive numbers
          so keeping the 'float_number' sign is important
      */
      var sign = float_number < 0 ? '-' : '';
      float_number = Math.abs( float_number );


      var
      primal_numerator,
      primal_denominator = 1;

      /*Convert from floating to 2 integer fractional numbers*/
      while (isFloat(float_number)) {
        float_number        *= 10;
        primal_numerator     = Math.floor( float_number );
        primal_denominator  *= 10;
      }

      /*Find the GCD for both integer fractions*/
      var gcd = greatestCommonDivisor( primal_numerator, primal_denominator );

      /*Give the simplest fraction possible*/
      return sign + primal_numerator/gcd +'/'+ primal_denominator/gcd;
    }
 

    /**
     * Will return the power of the 'number_in_power' for a given 'base_number' using custom logarithm.
     * More info at https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/log => 'getBaseLog(x, y)'
     * 
     * @dependences:
     *     isNumber
     * 
     * @param  {Number} base_number
     * @param  {Number} number_in_power
     * @return {Mixed}                  Will return either the power as {Number} or 'NaN' for any invalid input.
     *
     * @examples
     *     getPowerLog( 2 , -1)  =>  NaN
     *     getPowerLog('3','a')  =>  NaN
     *     getPowerLog( 2 ,  0)  =>  -Infinity
     *     getPowerLog( 2 ,  8)  =>  3
     *     getPowerLog( 2 , 16)  =>  4
     *     getPowerLog( 3 ,  9)  =>  2
     *     getPowerLog('3',  9)  =>  2
     */
    function getPowerLog(base_number, number_in_power) {
        if (!isNumber(base_number) || !isNumber(number_in_power)) return NaN;
        return Math.log( number_in_power ) / Math.log( base_number );
    }



    /*
      Will convert any number 'converting_number' knowing its base as 'base_from' and
      will return its 'converted_number' to the requested base 'base_to'.

      @dependencies:
        isInteger

      @examples:
        convertNumberBase()              =>  NaN
        convertNumberBase(  10,  0, 16)  =>  NaN
        convertNumberBase(  10, -2, 16)  =>  NaN
        convertNumberBase('FF', 10, 16)  =>  NaN
        convertNumberBase('FF', 16, 16)  =>  FF
        convertNumberBase(   0,  2, 10)  =>  0
        convertNumberBase(1100,  2, 10)  =>  12
        convertNumberBase(  10, 10, 16)  =>  A
        convertNumberBase( -10, 10, 16)  =>  -A
        convertNumberBase('FF', 16, 10)  =>  255

      Special thanks to Dr Zhihua Lai
      http://rot47.net/_js/convert.js
    */
    function convertNumberBase(converting_number, base_from, base_to) {

      /*Complete converting alphabet*/
      var MAX_BASE_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

      /*Validate converting bases*/
      if (!isInteger( base_from ) || base_from <= 0) return NaN;
      if (!isInteger( base_to   ) || base_to   <= 0) return NaN;


      /*Detect common cases*/
      if (!converting_number  ) return 0;
      if (base_from == base_to) return converting_number;


      base_from *= 1;
      base_to   *= 1;

      /*Will help presenting negative numbers*/
      var number_sign = '';
      if (converting_number < 0) {
        number_sign       = '-';
        converting_number = Math.abs( converting_number );
      }

      var converting_number_chars = converting_number +'';


      /*Out of range basing*/
      if (base_from > MAX_BASE_CHARS.length) return NaN;
      if (base_to   > MAX_BASE_CHARS.length) return NaN;


      /*Create sub-alphabets for both converting bases*/
      var
      base_from_chars = MAX_BASE_CHARS.slice(0, base_from),
      base_to_chars   = MAX_BASE_CHARS.slice(0, base_to  ),

      base_from_chars_length = base_from_chars.length,
      base_to_chars_length   = base_to_chars.length;


      /*Convert the 'converting_number' characters into respective integer value*/
      var converting_number_int = 0;
      for (var i = 0; i < converting_number_chars.length; ++i) {
        converting_number_int = converting_number_int * base_from_chars_length + base_from_chars.indexOf( converting_number_chars.charAt(i) );
      }

      /*Base conversion check*/
      if (converting_number_int < 0) return NaN;

      /*Keep chunking off till we convert all 'converting_number_int' into 'converted_number'*/
      var
      base_to_char         = converting_number_int % base_to_chars_length,
      converted_number     = base_to_chars.charAt( base_to_char ),
      base_from_chars_left = Math.floor(converting_number_int / base_to_chars_length);

      while (base_from_chars_left) {
        base_to_char         = base_from_chars_left % base_to_chars_length;
        base_from_chars_left = Math.floor(base_from_chars_left / base_to_chars_length);
        converted_number     = base_to_chars.charAt( base_to_char ) + converted_number;
      }

      return number_sign + converted_number;
    }


    /**
     * Will return a pseudo-random number in a given range of the first two arguments.
     * If some of the arguments are missing, we'll fallback to default range limits or
     * to default 'Math.random()' function
     * 
     * @dependencies
     *   isNumber()
     *   roundAfterPoint()
     * 
     * @param  {Number} limit_1         [Optional] Range numbers limitation
     * @param  {Number} limit_2         [Optional] Range numbers limitation
     * @param  {Number} float_precision [Optional] Will tell how precise the returned number need to be, e.g. when float_precision=2, answer may be 7.45, float_precision=3, answer may be 7.453
     * @return {Number}
     * 
     * @examples
     *   getRandomNumber()           =>  0.4821015023626387  // default Math.random()
     *   getRandomNumber(10)         =>  1983785338          // default upper limit
     *   getRandomNumber(10, 15)     =>  12                  // Random number with floating point of 0
     *   getRandomNumber(10, 15, 3)  =>  14.206              // Random number with floating point of 3
     * 
     *   getRandomNumber('a')           =>  3906844682       // default upper & lower limits
     *   getRandomNumber('a', 17)       =>  -2537090446      // default lower limits
     *   getRandomNumber('a', 17, 'a')  =>  -3632881518      // default lower & floating limits
     */
    function getRandomNumber(limit_1, limit_2, float_precision) {

      /*Check if we need to round in a specific precision*/
      if (!isNumber( float_precision ) || float_precision < 0) float_precision = 0;


      /*Fallback to default Math function of no arguments were supported*/
      if (
       limit_1 == limit_2 &&
       !float_precision
      ) {
        return isNumber( limit_1 ) ? limit_1 : Math.random();
      }


      /*Set default range limitations*/
      var max_range = Math.pow(2, 32) - 1;
      if (!isNumber( limit_1 )) limit_1 = -max_range;
      if (!isNumber( limit_2 )) limit_2 =  max_range;


      var
      limit_lower = Math.min( limit_1, limit_2 ),
      limit_upper = Math.max( limit_1, limit_2 ),
      limit_float = Math.pow( 10, float_precision );

      limit_lower = roundAfterPoint( limit_lower, float_precision );
      limit_upper = roundAfterPoint( limit_upper, float_precision );


      var
      random_number  = Math.random();
      random_number *= limit_upper - limit_lower + 1 * Math.pow( 0.1, float_precision );
      random_number  = Math.floor( random_number * limit_float) / limit_float;
      random_number += limit_lower;
      random_number  = roundAfterPoint( random_number, float_precision );

      return random_number;
    }


    /**
     * Always return an Array with a structure as maximum as close to the incoming obj structure
     */
    function toArray(obj) {
        switch(typeof obj) {
            case 'boolean':
            case 'string':
            case 'number':
                return [obj];
            break;

            case 'object':
                return obj instanceof Array ? obj : [obj];
            break;

            default:
                return [];
            break;
        }
    }


    /*Gives the total number of private object keys*/
    function objectLength(obj) {
        return (typeof obj == 'object' && obj != null) ? Object.keys( obj ).length : 0;
    }


    /*
        Instead of throwing an error for every invalid JSON string
        this function will safely return a JSON object, or 'undefined'
    */
    function JSON_parse() {
        try {
            return JSON.parse.apply(JSON, arguments);
        } catch(error) {
            return undefined;
        }
    }


    /*
        Instead of throwing an error for every invalid JSON object
        this function will safely return a JSON string, or 'undefined'
    */
    function JSON_stringify() {
        try {
            return JSON.stringify.apply(JSON, arguments);
        } catch (error) {
            return undefined;
        }
    }


    /**
     * Recursively loop over all Objects in 'obj' and lock all of them using the 'Object.freeze'.
     * Circular object relations are checked using the 'JSON_stringify' function.
     * 
     * @dependences
     *     each()
     *     JSON_stringify()
     */
    function recursiveFreezeObject(obj) {

      /*Secure a valid non-circular JSON object*/
      if (
        typeof obj != 'object' ||
        !JSON_stringify( obj )
      ) return;


      each( obj, function (value, key) {
        recursiveFreezeObject( obj[ key ] );
      });

      return Object.freeze( obj );
    }



    /*
      'Object.prototype.toString' will do all safe checks for us and give the 'variable' constructor.
      Example:
        exactTypeof()                =>  "Undefined"
        exactTypeof(  undefined   )  =>  "Undefined"
        exactTypeof(     null     )  =>  "Null"
        exactTypeof(     true     )  =>  "Boolean"
        exactTypeof(      ''      )  =>  "String"
        exactTypeof(       1      )  =>  "Number"
        exactTypeof(      {}      )  =>  "Object"
        exactTypeof(      []      )  =>  "Array"
        exactTypeof(    Error     )  =>  "Function"
        exactTypeof( new Error()  )  =>  "Error"
        exactTypeof( new RegExp() )  =>  "RegExp"
    */
    function exactTypeof(variable) {
      return Object.prototype.toString.call( variable ).replace('[object ', '').replace(']', '')
    }



    /**
     * Reduce the income string to a limit of chars
     * Examples:
     *    clampString('abcdefg',  1)  => "."
     *    clampString('abcdefg',  4)  => "a..."
     *    clampString('abcdefg',  7)  => "abcdefg"
     *    clampString('abcdefg', 20)  => "abcdefg"
     *    clampString('abcdefg', -1)  => "abcdefg"
     *    clampString('abcdefg', 'a') => "abcdefg"
     */
    function clampString(str, limit) {
        var clamped = '';

        /*Validate input*/
        if (typeof str != 'string') return str;
        if (!isInteger(limit)     ) return str;


        /*Check for valid char limits*/
        if (limit > 0 && str.length > limit) {

            /*Char symbols that will represent that the string is been clamped*/
            var
            end_chars        = '...',
            end_chars_length = end_chars.length;

            /*Check if our char presenters are in the maximum chars limit*/
            if (end_chars_length < limit) {

                /*Returned a part from the main income string and ending representative chars*/
                clamped = str.substr(0, limit - end_chars_length) + end_chars;
            } else {
              
                /*Return a portion of our representative chars*/
                clamped = end_chars.substr(0, limit);
            }

        } else {

            /*Return the same string if invalid limit chars is specified*/
            clamped = str;
        }

        /*Return the clamped formated string*/
        return clamped;
    }


    /**
     * Will take common case "Camel" style and return "Underscored" style string
     * @example
     *   camelCaseToUnderscore('myClassHTTP_Var1'   )  =>  "my_class_http_var1"
     *   camelCaseToUnderscore('__ClassHTTP_Var1'   )  =>  "class_http_var1"
     *   camelCaseToUnderscore('MyClass+-/*HTTPVar1')  =>  "my_class_+-/*_httpvar1"
     *   camelCaseToUnderscore({})  =>  ""
     *   camelCaseToUnderscore()    =>  ""
     */
    function camelCaseToUnderscore(camel_case_string) {
      if (typeof camel_case_string != 'string') return '';

      var underscore = camel_case_string.replace(/[ ]+/g, '_');

      underscore = underscore.replace(/([A-Z]+)([a-z0-9]*)/g, function (match) {
        return '_'+ match.toLowerCase() +'_';
      });

      underscore = underscore.replace(/[_]{2,}/g, '_');

      underscore = underscore.replace(/^[_]+/, '');
      underscore = underscore.replace(/[_]+$/, '');

      return underscore;
    }


    /**
     * Set as caps only the first letter of each word.
     * 'ignore_single_letters' will tell if single letter elements are word or not.
     * @examples:
     *     capitalize()                                         =>  ""
     *     capitalize("")                                       =>  ""
     *     capitalize("h")                                      =>  "H"
     *     capitalize("h", true)                                =>  "h"
     *     capitalize("11", true)                               =>  "11"
     *     capitalize("  $%^&| @ Once      upon a   time   |")  =>  "  $%^&| @ Once      Upon A   Time   |"
     */
    function capitalize(str, ignore_single_letters) {

        /*Input String validation*/
        if (typeof str !== 'string' || str.length == 0) return '';

        /*Normally we'll capitalize all non-space string elements*/
        if (typeof ignore_single_letters !== 'boolean') ignore_single_letters = false;


        var
        words  = str.match(/\S+/g) || [],
        spaces = str.match(/\s+/g) || [];

        /*Capitalize all 'words' elements*/
        for (var i=0; i < words.length; ++i) {
            var word = words[i];

            if (word.length === 1 && ignore_single_letters) continue;

            words[i] = word.substr(0, 1).toUpperCase() + word.substr(1).toLowerCase();
        }


        var
        start_element_preorder = (str[0] === ' ')*1,
        capitalized_string     = '',
        word_i                 = 0,
        space_i                = 0,
        total_elements         = words.length + spaces.length;

        /*Combine the final string from both space and non-space elements by alternative pushing*/
        for (var total_i=0; total_i < total_elements; ++total_i) {
            if ((total_i + start_element_preorder) % 2) {
                capitalized_string += spaces[ space_i++ ];
            } else {
                capitalized_string += words[ word_i++ ];
            }
        }

        return capitalized_string;
    }



    /*
      For any given function,
      it will return an array of strings,
      presenting the incoming function arguments as names.
      Example:
        getFunctionArgumentsNames(function (name, _uid, callback) { ... })  =>  ['name', '_uid', 'callback']
    */
    var getFunctionArgumentsNames = (function () {
      var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
      var FN_ARGS        = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
      var FN_ARG_SPLIT   = /,/;
      var FN_ARG         = /^\s*(_?)(\S+?)\1\s*$/;

      return function (fn) {
        if (typeof fn !== 'function') {
          throw new TypeError('1st argument must be a function');
        }

        var fn_text                = fn.toString().replace(STRIP_COMMENTS, '');
        var args_declaration_match = fn_text.match(FN_ARGS);

        if (!args_declaration_match) {
          return [];
        }


        /*Go through all matched arguments and filter them*/
        return args_declaration_match[1]
          .split(FN_ARG_SPLIT)
          .map(function (arg) {
            return arg.split(FN_ARG)[2]
          });
      };
    })();



    /**
     * Common function to iterate through an Array or an Object of elements.
     * If the callback function return false - iteration will be stopped.
     * 
     * @param  {Object}    obj       JSON object or an Array which we can use for iteration
     * @param  {Function}  callback  The notification function which will be sent pairs of data from the incoming 'obj'
     * @return {Boolean}             Tells if there were an iteration looping or not
     */
    /*NOTE: It is important to remember that looping using this function will not brake "the sync model of events"
            since we have not used any async function while iterating.
    */
    function each(obj, callback) {

        /*Immediately exit from the function if any of the mandatory arguments is missing*/
        if (typeof obj      != 'object'  ) return false;
        if (       obj      == null      ) return false;
        if (typeof callback != 'function') return false;


        /*Determine an Array or an Object*/
        if (obj instanceof Array) {

            /*Cache common loop elements*/
            /*NOTE: Caching 'obj.length' will prevent iterating over newly added elements,
                    which will help keeping this function as close as possible to 'Array.prototype.forEach'
            */
            var length = obj.length;
         
            /*Go through all Array elements and send them back to the callback function as an element-index pair*/
            for (var i=0; i < length; ++i) {

                /*Be sure that the element we're attempting to iterate over still exists*/
                if (i in obj) {

                    /*Exit from the loop if the callback explicitly ask for it*/
                    if (callback( obj[i], i, obj ) === false) break;
                }
            }

        } else {

            /*Go through all own Object key - value pairs and send them 1 by 1 to the callback function*/
            var own_keys = Object.keys( obj );
            for (var i=0; i < own_keys.length; ++i) {
                var key = own_keys[i];

                /*
                    Send only 'own properties' and
                    exit from the loop if the callback explicitly ask for it
                */
                if (callback( obj[key], key, obj ) === false) break;
            }
        }

        /*Gives a positive reaction when looping is completed*/
        return true;
    }



    /**
     * Recursive function that will create a variable clone of any type: Object, Function or Primitive types
     * NOTE: _.clone() does not create a function clone
     * 
     * @dependences
     *     each()
     */
    var clone = (function () {

      /*Return a clone of a function*/
      function cloneFunction(func) {
        return function () {
          return func.apply(this, arguments);
        };
      }


      return function (variable) {

        /*Quick check for common "empty" vars*/
        if (variable === ''  ) return '';
        if (variable === []  ) return [];
        if (variable === {}  ) return {};
        if (variable === null) return null;
        if (variable === NaN ) return NaN;


        /*Since this function is recursive, it's important to recreate the cloned variable on every call*/
        var cloned_var = {};
      
        /*Determine income variable type*/
        if (typeof variable === 'object') {

          if (variable instanceof Date) {
            cloned_var = new Date( variable.getTime() );

          } else if (variable instanceof RegExp) {
            cloned_var = new RegExp( variable.toString() );

          } else {

            /*Check if we need to recreate an Array or an Object*/
            cloned_var = variable instanceof Array ? [] : {};

            /*NOTE: Array.slice() will copy-by-address all array elements*/

            /*Go through each variable key - value pairs and recursively clone them*/
            each(variable, function (value, key) {
              cloned_var[key] = clone(value);
            });
          }

        } else if (typeof variable === 'function') {

          /*Use the internal function to clone a function variable*/
          cloned_var = cloneFunction(variable);
        } else {

          /*Just copy the variable since it's from a primitive type*/
          cloned_var = variable;
        }

        return cloned_var;
      };
    })();


    /**
     * Use a common formated string and an optional Date object to produce more user-friendly date string
     * Everything not to be format should be in brackets []
     *
     * @dependences
     *     isInteger()
     *     setDigits()
     * 
     * @param  {string}    format    Used to replace each date token with a predefined date string
     * @param  {timestamp} timestamp Optional timestamp to be used as a template. If not specified, will use the current date timestamp
     * @return {string}              'humanized' date string with all available tokens included
     *
     * @examples
     *     formatDate()                            => '11:21:05 27.03.2013'
     *     formatDate('ddd MM.YYYY')               => 'Wed 03.2013'
     *     formatDate('hh:mm:ss a', 1000000000000) => '04:46:40 am'
     *     formatDate('[Today is] DD [HH mm ss]')  => 'Today is 18 HH mm ss'
     *
     *     formatDate('YYYY [years], MM [months], DD [days], HH [hours], m [minutes], s [seconds], xxx [milliseconds]', 1020) => '1970 years, 01 months, 01 days, 02 hours, 0 minutes, 1 seconds, 020 milliseconds '
     */
    var formatDate = (function () {
        var
        month_day    = -1,
        week_day     = -1,
        SHORT_MONTHS = ['Jan'    , 'Feb'     , 'Mar'  , 'Apr'  , 'May', 'Jun' , 'Jul' , 'Aug'   , 'Sep'      , 'Oct'    , 'Nov'     , 'Dec'],
        LONG_MONTHS  = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],

        month      = -1,
        SHORT_DAYS = ['Sun'   , 'Mon'   , 'Tue'    , 'Wed'      , 'Thu'     , 'Fri'   , 'Sat'],
        LONG_DAYS  = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

        hours        = -1,
        minutes      = -1,
        seconds      = -1,
        milliseconds = -1,
        am_pm        = '';


        /*Everything in 'format' will be replaced by a component from 'date'*/
        function formatDatePart(format, date) {

            /*Replace Year tokens*/
            format = format.replace(/YYYY/g, date.getFullYear());
            format = format.replace(/YY/g  , date.getFullYear() % 100);

            /*Replace Day of the Month tokens*/
            month_day = date.getDate();
            format    = format.replace(/DD/g, setDigits(month_day, 2));
            format    = format.replace(/D/g , month_day);

            /*Replace Hour tokens*/
            hours  = date.getHours();
            format = format.replace(/HH/g, setDigits(hours, 2));
            format = format.replace(/H/g , hours);
            format = format.replace(/hh/g, setDigits(hours % 12, 2));
            format = format.replace(/h/g , hours % 12);

            /*Replace Minutes tokens*/
            minutes = date.getMinutes();
            format  = format.replace(/mm/g, setDigits(minutes, 2));
            format  = format.replace(/m/g , minutes);

            /*Replace AM/PM tokens*/
            am_pm  = hours < 12 ? 'am' : 'pm';
            format = format.replace(/a/g, am_pm);
            format = format.replace(/A/g, am_pm.toUpperCase());

            /*Replace Seconds tokens*/
            seconds = date.getSeconds();
            format  = format.replace(/ss/g, setDigits(seconds, 2));
            format  = format.replace(/s/g , seconds);

            /*Replace Milliseconds tokens*/
            milliseconds = date.getMilliseconds();
            format       = format.replace(/xxx/g, setDigits(milliseconds, 3));

            /*Replace Month tokens*/
            month  = date.getMonth();
            format = format.replace(/MMMM/g   , LONG_MONTHS[month]);
            format = format.replace(/MMM/g    , SHORT_MONTHS[month]);
            format = format.replace(/MM/g     , setDigits(month+1, 2));
            format = format.replace(/M([^a])/g, month+1 +'$1');   /*Prevent replacing 'M' in 'May'*/

            /*Replace Day of the Week tokens*/
            week_day = date.getDay();
            format   = format.replace(/dddd/g, LONG_DAYS[week_day]);
            format   = format.replace(/ddd/g , SHORT_DAYS[week_day]);


            /*Returns the pre formated date/time incoming string*/
            return format;
        };


        return function (format, timestamp) {

            /*Set default values*/
            format    = format    ? format    : 'HH:mm:ss DD.MM.YYYY';
            timestamp = timestamp ? timestamp : new Date().getTime();

            /*Validate input*/
            if (typeof format != 'string') throw new Error('If specified, 1st argument must be a {sting} but you sent {'           + typeof format    +'} '+ format);
            if (!isInteger(timestamp))     throw new Error('If specified, 2nd argument must be a {timestamp} object but you sent {'+ typeof timestamp +'} '+ timestamp);

            /*Convert validated timestamp into a JS Date object*/
            var date = new Date( timestamp );

            /*Holds the final formated and non-formated string result*/
            var formated_result = '';


            /*Split the incoming 'format' in parts that need to have a Date format and parts that does not*/
            each( format.split(/(\[[^\]]*\])/), function (format) {
                if (
                    format.substr( 0, 1) === '[' &&
                    format.substr(-1, 1) === ']'
                ) {
                    formated_result += format.substr(1, format.length-2);
                } else {
                    formated_result += formatDatePart( format, date );
                }
            });

            return formated_result;
        };
    })();


    /**
     * Convert a timestamp to game time with a maximum scope of minutes, e.g. '0:01', '6:00', '+6:10', '-16:20'
     * 
     * @dependences
     *     isNumber()
     *     setDigits()
     * 
     * @param  {Timestamp} timestamp      Unix timestamp [milliseconds] that need to be converted
     * @param  {Boolean}   show_plus_sign Indicates whenever we need to show a '+' sign in front of the final time if the timestamp is positive
     * 
     * @return {String}    Final string form of the timestamp
     *
     * @examples
     *   minutesLimitedTime()                                     => '0:00'
     *   minutesLimitedTime( - (4 * 60 * 1000 + 7 * 1000) )       => '-4:07'
     *   minutesLimitedTime(   (4 * 60 * 1000 + 7 * 1000) )       => '4:07'
     *   minutesLimitedTime(   (4 * 60 * 1000 + 7 * 1000), true ) => '+4:07'
     */
    var minutesLimitedTime = (function () {
        var
        total_seconds = 0,
        sign          = '',
        math_function = '',
        minutes       = 0,
        seconds       = 0;

        return function (timestamp, show_plus_sign) {

            /*Secure function parameters*/
            total_seconds  = isNumber(timestamp) ? Math.round(timestamp / 1000) : 0;
            show_plus_sign = show_plus_sign == true;

            /*Check if we need to add the '+' sign in front of the final string result*/
            sign          = total_seconds < 0 ? '-' : (show_plus_sign ? '+' : '');
            total_seconds = Math.abs(total_seconds);

            /*Check which Math function we'll need for rounding calculation*/
            math_function = total_seconds < 0 ? 'ceil' : 'floor';

            /*Calculate the total amount of hours, minutes and seconds*/
            minutes = Math[ math_function ]( total_seconds / 60);
            seconds = Math[ math_function ]( total_seconds - minutes * 60);

            /*Return a final formated time string*/
            return sign + minutes +':'+ setDigits(seconds, 2);
        }
    })();


    /*
        Converts the incoming Unix timestamp [milliseconds] in more "human" formated string.
        When show_plus_sign is set to true we'll show a '+' in front if the timestamp is a > 0.
    */
    var hoursLimitedTime = (function () {
        var
        total_seconds = 0,
        sign          = '',
        math_function = '',
        hours         = 0,
        minutes       = 0,
        seconds       = 0;

        return function (timestamp, show_plus_sign, extend_over_24_hours) {

            /*Secure function parameters*/
            total_seconds  = isNumber(timestamp) ? Math.round(timestamp / 1000) : 0;
            show_plus_sign = show_plus_sign == true;

            /*Check if we need to add the '+' sign in front of the final string result*/
            sign          = total_seconds < 0 ? '-' : (show_plus_sign ? '+' : '');
            total_seconds = Math.abs(total_seconds);

            /*Tells if we need to clamp the hours to the last 24*/
            if (!extend_over_24_hours) total_seconds %= 24 * 60 * 60;

            /*Check which Math function we'll need for rounding calculation*/
            math_function = total_seconds < 0 ? 'ceil' : 'floor';

            /*Calculate the total amount of hours, minutes and seconds*/
            hours   = Math[ math_function ]( total_seconds / 60 / 60);
            minutes = Math[ math_function ]( total_seconds / 60 - hours * 60);
            seconds = Math[ math_function ]( total_seconds - minutes * 60 - hours * 60 * 60);

            /*Return a final formated time string*/
            return sign + setDigits(hours, 2) +':'+ setDigits(minutes, 2) +':'+ setDigits(seconds, 2);
        }
    })();


    /**
     * Will take the parse the incoming '_milliseconds' into Years, Months, Days, hours, minutes, seconds, and milliseconds and
     * replace them in the incoming {string} 'format'
     * 
     * @dependencies
     *     each
     *     setDigits
     * 
     * @example
     *     humanLimitedTime( 4*12*30*24*60*60*1000 + 3*30*24*60*60*1000 + 3*24*60*60*1000 + 4*60*60*1000 + 5*60*1000 + 6*1000 + 789)                =>  '4 years, 3 months, 3 days, 4 hours, 5 minutes, 6 seconds, 789 milliseconds'
     *     humanLimitedTime( 4*12*30*24*60*60*1000 + 3*30*24*60*60*1000 + 3*24*60*60*1000 + 4*60*60*1000 + 5*60*1000 + 6*1000 + 789, 'h:mm:ss.ii')  =>  '36796:05:06.789'
     */
    var humanLimitedTime = (function () {
        var
        years        = 0,
        months       = 0,
        days         = 0,
        hours        = 0,
        minutes      = 0,
        seconds      = 0,
        milliseconds = 0;


        /*
          Will determine the exact count of each time components (year, mounts, days, etc) and
          will set limit values for each by summing the rest to the maximum met time component:
          this means that if 'hh' or 'h' is the maximum component if 'format', then hours count could go above 24.
        */
        function setTimeComponents(format) {

          /*General time distribution between common time components*/
          years        = Math.floor( milliseconds /1000 /60 /60 /24 /30 /12                                                                                      );
          months       = Math.floor( milliseconds /1000 /60 /60 /24 /30    - years*12                                                                            );
          days         = Math.floor( milliseconds /1000 /60 /60 /24        - years*12*30          - months*30                                                    );
          hours        = Math.floor( milliseconds /1000 /60 /60            - years*12*30*24       - months*30*24       - days*24                                 );
          minutes      = Math.floor( milliseconds /1000 /60                - years*12*30*24*60    - months*30*24*60    - days*24*60    - hours*60                );
          seconds      = Math.floor( milliseconds /1000                    - years*12*30*24*60*60 - months*30*24*60*60 - days*24*60*60 - hours*60*60 - minutes*60);
          milliseconds = milliseconds % 1000;


          /*
            The block below will determine till what time component we need to limit our calculation.
            For example, if the maximum met component is 'DD' or 'D', then days count could go above 30.
          */
          var components_format = format.replace(/\[(.*?)\]/g, '');
          (function () {
            if (/YY/g.test(components_format) ||
                /Y/g.test( components_format)
            ) {
              return;
            }


            months += years*12;
            years   = 0;
            if (/MM/g.test(components_format) ||
                /M/g.test( components_format)
            ) {
              return;
            }


            days  += months*30;
            months = 0;
            if (/DD/g.test(components_format) ||
                /D/g.test( components_format)
            ) {
              return;
            }


            hours += days*24;
            days   = 0;
            if (/hh/g.test(components_format) ||
                /h/g.test( components_format)
            ) {
              return;
            }


            minutes += hours*60;
            hours    = 0;
            if (/mm/g.test(components_format) ||
                /m/g.test( components_format)
            ) {
              return;
            }


            seconds += minutes*60;
            minutes  = 0;
            if (/ss/g.test(components_format) ||
                /s/g.test( components_format)
            ) {
              return;
            }

            /*
              None of the above time components were found in the incoming 'format'
              so we'll return the total amount of milliseconds which is exactly the same as the incoming '_milliseconds'
            */
            milliseconds += seconds*1000;
          })();
        }



        /*Returns pre-formated date/time incoming string*/
        function formatPart(format) {
          format = format.replace(/YY/g, setDigits( years, 2 ));
          format = format.replace(/Y/g , years);

          format = format.replace(/MM/g, setDigits( months, 2 ));
          format = format.replace(/M/g , months);

          format = format.replace(/DD/g, setDigits( days, 2 ));
          format = format.replace(/D/g , days);

          format = format.replace(/hh/g, setDigits( hours, 2 ));
          format = format.replace(/h/g , hours);

          format = format.replace(/mm/g, setDigits( minutes, 2 ));
          format = format.replace(/m/g , minutes);

          format = format.replace(/ss/g, setDigits( seconds, 2 ));
          format = format.replace(/s/g , seconds);

          format = format.replace(/ii/g, setDigits( milliseconds, 2 ));
          format = format.replace(/i/g , milliseconds);

          return format;
        }



        return function (_milliseconds, format) {
          milliseconds = _milliseconds;

          /*Secure function parameters*/
          if (!isInteger( milliseconds ) || milliseconds < 0) milliseconds = 0;
          if (typeof format != 'string'                     ) format       = 'Y [years], M [months], D [days], h [hours], m [minutes], s [seconds], i [milliseconds]';


          /*Will determine the exact value of each days, mounts, years, and all the rest time components*/
          setTimeComponents( format );


          /*Holds the final formated and non-formated string result*/
          var formated_result = '';

          /*Split the incoming 'format' in parts that need to have a Date format and parts that does not*/
          each( format.split(/(\[[^\]]*\])/), function (format) {
            if (format.substr( 0, 1) === '[' &&
                format.substr(-1, 1) === ']'
            ) {
              formated_result += format.substr(1, format.length-2);
            } else {
              formated_result += formatPart( format );
            }
          });

          return formated_result;
        }
    })();


    /**
     * Set of utilities to present Client/Browser timezone difference from UTC/GMT
     * 
     * @dependences
     *     setDigits()
     * 
     * @return  {Object}  List of all client Timezone properties generated
     */
    var timezone = (function () {
        var
        client_date        = new Date(),
        offset             = client_date.getTimezoneOffset(),
        hours              = Math.floor(offset / 60),
        minutes            = Math.abs(  offset % 60),
        abbreviation_match = client_date.toString().match(/\(([^)]+)\)$/);

        /*NOTE: We invert the hours here because getTimezoneOffset() returns time difference between UTC and local time in [minutes], not vise versa
                https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset
                http://msdn.microsoft.com/en-us/library/ie/014ykh71(v=vs.94).aspx
        */
        hours = -hours;

        return {
            minutes     : offset,                                                                /*[minutes]*/
            timestamp   : offset * 60 * 1000,                                                    /*[milliseconds]*/
            label       : 'GMT '+ (-offset > 0 ? '+' : '') + hours +':'+ setDigits(minutes, 2),  /*UI presentation*/
            abbreviation: abbreviation_match ? abbreviation_match[1] : ''                        /*Common description timezone text, e.g. "UTC", "CET", "CEST"*/
        };
    })();


    /**
     * Returns a helpful set of properties regarding a given 'date' (Date instance).
     * If 'date' is not given the current User Date is been used.
     * 
     * @param  {Date} date  Optional Date instance used to determine the DST properties of
     * @return {JSON}       List of helpers telling more about the User timezone. More explanation is given in the 'return' method.
     */
    function daylightSavingTime(date) {

        if (!(date instanceof Date)) date = new Date();

        var
        /*Stores the current or predefined Client Date moment*/
        current_year = date.getFullYear(),

        /*Secure a Winder date with no DST set and Summer date where DTS can be set if available for the current User timezone*/
        january_1st = new Date(current_year, 0, 1),
        june_1st    = new Date(current_year, 5, 1),

        can_be_set = january_1st.getTimezoneOffset() != june_1st.getTimezoneOffset(),

        abbreviation_match = date.toString().match(/\(([^)]+)\)$/);


        return {

            /*Tells if DTS is in use for the current User timezone*/
            can_be_set: can_be_set,

            /*Tells if DST is currently been added*/
            is_set: can_be_set && date.getTimezoneOffset() == june_1st.getTimezoneOffset(),

            /*Gives the DTS timezone abbreviation when DTS is set e.g. 'CEST', 'EEST', 'AEST'*/
            type: can_be_set ? (abbreviation_match ? abbreviation_match[1] : '') : ''
        };
    }



    /**
     * Used in the way of Underscore _.bind() function
     * 
     * @param  {Function}  fn     Function to be called in the sent scope
     * @param  {Object}    scope  Object scope that will execute the incoming function
     */
    function bind(func, context) {
        return function () {
            return func.apply(context, arguments);
        };
    }



    /**
     * Duplicates the behavior of the _.extend() function.
     * If the 1st argument is an source object
     * the function will use all the rest given objects to clone all their properties into the 1st object source.
     * Overriding is allowed by the rule of "later object overrides the former".
     * 
     * @dependences
     *     each()
     */
    var extend = (function () {
        var
        args   = [],
        source = null;


        return function () {

            /*Convert to Array for better handling */
            args = Array.prototype.slice.call( arguments );

            /*Validate source object*/
            source = args.shift();
            if (typeof source != 'object' && source != null) throw new Error('1st argument must be a source {Object} but you sent {'+ typeof source +'} '+ source);


            /*Go over each incoming arguments, if any left*/
            each(args, function (obj, id) {

                /*Validate object argument*/
                if (typeof obj != 'object') throw new Error('Argument '+ (id+2) +' must be an {Object} but you sent {'+ typeof obj +'} '+ obj);

                /*Copy by reference each argument object properties over the source*/
                each(obj, function (value, key) {
                    source[key] = value;
                });
            });


            /*Give the combined source object*/
            return source;
        };
    })();


    /**
     * Checks if the incoming 'obj' has any properties or length
     * 
     * @dependences
     *     isNumber()
     *     each()
     * 
     * @param  {Mixed}   obj  Variable to be checked if it has any looping data
     * @return {Boolean}      Flag if the incoming 'obj' is considered empty or not
     */
    function isEmpty(obj) {
        var has_properties = false;

        switch (obj) {

            /*Common case scenario*/
            case null:
            case {}:
            case []:
            case '':
            case undefined:
                return true;

            default:

                /*Any number is an empty object*/
                if (isNumber(obj)) return true;

                /*Any {String} with length will be considered not empty*/
                if (typeof obj === 'string' && obj.length) return false;

                /*Check if the incoming object contain any properties*/
                each(obj, function () {
                    has_properties = true;
                    return false;
                });

                return !has_properties;
        }
    }


    /**
     * Checks if the first two incoming variables are equal by type and value.
     * Objects are not been compared by property position but by property value, type, and length.
     * 
     * @dependences
     *     each()
     *     isEmpty()
     * 
     * @param  {Mixed}  var_1  1st var to be compared
     * @param  {Mixed}  var_2  2nd var to be compared
     * @return {Boolean}       Tells if both vars are "equal" or not
     */
    function isEqual(var_1, var_2) {
        var is_equal;

        /*Check if we need to compare 2 Objects*/
        if (
            typeof var_1 == 'object' &&
            typeof var_2 == 'object'
        ) {

            /*Try "lazy comparison" by converting the {Object} into {String} comparison*/
            if (JSON.stringify( var_1 ) == JSON.stringify( var_2 )) return true;


            /*Prevent data integrity*/
            var_2 = clone( var_2 );

            /*Check if all properties from var_1 are met in var_2*/
            is_equal = true;
            each(var_1, function (value, key) {

                /*Check if there's the same property in var_2*/
                if (var_2[key] === value) {

                    /*Try to leave var_2 as empty object*/
                    delete var_2[key];

                } else {

                    /*Mark the mismatch and prevent further looping*/
                    is_equal = false;
                    return false;
                }
            });


            /*Final check if var_2 has any properties left*/
            return is_equal ? isEmpty(var_2) : false;

        } else {

            /*Use the general compare operator if both are not objects*/
            return var_1 === var_2;
        }
    }


    /**
     * The function 'func' will be executed only when there's a timeout
     * of 'timeout' [milliseconds] between now and last 'func' call.
     * http://benalman.com/projects/jquery-throttle-debounce-plugin/
     * 
     * @param  {function}  func     The function that need to be executed only once after a specified 'timeout' time
     * @param  {integer}   timeout  Time in [milliseconds] that need to expire before calling the 'func' function
     */
    function debounce(func, timeout) {
        var timer, THIS, args, result;

        /*Validate input*/
        if (typeof func != 'function') throw new Error('1st argument must be a {function} but you sent {'+ typeof func +'} '+ func);
        if (!isInteger(timeout))       throw new Error('2nd argument must be a milliseconds {integer} number but you sent {'+ typeof timeout +'} '+ timeout);


        return function () {
            THIS = this;
            args = arguments;

            /*Functional scope that will execute the incoming 'func' in a later time*/
            function executeFunc() {
                clearTimeout(timer);
                timer  = null;
                result = func.apply(THIS, args);
            }

            /*Secure a single calling of the 'func'*/
            clearTimeout(timer);
            timer = setTimeout(executeFunc, timeout);

            /*If there's no timer set we'll execute and collect the 'func' result right away*/
            if (!timer) result = func.apply(THIS, args);

            return result;
        };
    }


    /**
     * Used to execute any function only once in a specified time frame
     * http://benalman.com/projects/jquery-throttle-debounce-plugin/
     * 
     * @param  {function}  func     The function that need to be executed only once after a specified 'timeout' time
     * @param  {integer}   timeout  Time in [milliseconds] between each 'func' executions
     */
    function throttle(func, timeout) {
      var timer;
      var result;
      var THIS;
      var args;
      var call_after_timeout = false;

      /*Validate input*/
      if (typeof func !== 'function') throw new Error('1st argument must be a {function} but you sent {'+ typeof func +'} '+ func);
      if (!isInteger(timeout))        throw new Error('2nd argument must be a milliseconds {integer} number but you sent {'+ typeof timeout +'} '+ timeout);


      return function () {
        THIS = this;
        args = arguments;


        function executeFunc() {

          /*Check if there already a delayed watcher for 'func'*/
          if (!timer) {
            timer = setTimeout(function () {

              /*
                Check if there's a 2nd, 3rd, ... call for 'func' and
                if so, reschedule another delayed watcher
              */
              if (call_after_timeout) {
                clearTimeout(timer);
                timer              = null;
                call_after_timeout = false;

                executeFunc();
              }
            }, timeout);
          }

          result = func.apply(THIS, args);
        }


        /*Check if this is the 1st call or the 2nd, 3rd, ..., in the respected 'timeout'*/
        if (!timer) {
          executeFunc();
        } else {
          call_after_timeout = true;
        }

        return result;
      };
    }



    /**
     * Cross-browser detection of jQuery event key code.
     * 
     * @dependences
     *     setDigits()
     * 
     * @param  {jQuery event}  event  A common event object come from 'keydown', 'keyup', or 'keypress' jQuery event callbacks
     * @return {Integer}              Final detected code of the pressed key
     */
    function eventToKey(event) {
        return event.keyCode ? event.keyCode : event.which;
    }


    /**
     * Return a section from the URL path (/section1/section2/...) by a given 0-based section position.
     * 
     * @dependences
     *     window - top DOM object
     * 
     * @param   Integer part_pos
     * @returns Mixed
     * 
     * @example
     *   getHrefPart(0)   => 'viewer'
     *   getHrefPart(999) => undefined
     *   getHrefPart('a') => undefined
     */
    function getHrefPart(part_pos) {
        part_pos = parseInt(part_pos, 10);

        return (
            (
                !isNaN( part_pos )                          &&
                typeof window                   == 'object' &&
                typeof window.location          == 'object' &&
                typeof window.location.pathname == 'string'
            )
            ? window.location.pathname.split('/')[ ++part_pos ]
            : undefined
        );
    }


    /**
     * Updates the HTML DOM element style attribute with a given CSS key-value pair.
     * Similar to $element(css_key, css_value);
     * 
     * @param {HTML Object}       element    Specific HTML element from the DOM tree that will update it's style attribute
     * @param {String CSS Key}    css_key    CSS property key that will have it's value set or updated if already set
     * @param {String CSS value}  css_value  CSS value that will be set to the specified CSS key
     */
    var updateElementStyle = (function () {
        var
        element_RegExp = null,
        element_style  = '';


        return function (element, css_key, css_value) {

            /*Secure specific function input*/
            if (
                typeof element   != 'object'              ||
                typeof element.getAttribute != 'function' ||
                typeof element.setAttribute != 'function' ||

                typeof css_key   != 'string' ||
                typeof css_value != 'string'
            ) throw new Error('updateElementStyle({HTML Object}, {String CSS key}, {String CSS value}) but it was sent: \
                {'+ typeof arguments[0] +'} '+ arguments[0] +', \
                {'+ typeof arguments[1] +'} '+ arguments[1] +', \
                {'+ typeof arguments[2] +'} '+ arguments[2]
            );


            /*Cache the current <element> style if any is been set*/
            element_style = ';'+ (element.getAttribute('style') || '');

            /*Prepare matching CSS expression and style rule that need to be updated*/
            element_RegExp = new RegExp(';'+ css_key + '(\s)*:([^;]+)', 'g');
            updated_style  = ';'+ css_key +': '+ css_value;


            /*Check if we need to set a new CSS rule or we need to update one*/
            if (element_RegExp.test( element_style )) {
                element_style = element_style.replace(element_RegExp, updated_style);
            } else {
                element_style = updated_style + element_style;
            }


            /*Record the update CSS key-value pair*/
            element.setAttribute('style', element_style.substr(1));
        };
    })();


    /*List of all externally accessed functionalities*/
    var utils = {
        log                      : log,
        documentLog              : documentLog,

        trim                     : trim,
        normalize                : normalize,
        toString                 : toString,
        clampString              : clampString,
        camelCaseToUnderscore    : camelCaseToUnderscore,
        capitalize               : capitalize,
        getFunctionArgumentsNames: getFunctionArgumentsNames,

        clampNumber              : clampNumber,
        roundAfterPoint          : roundAfterPoint,
        isNumber                 : isNumber,
        isFloat                  : isFloat,
        isInteger                : isInteger,
        setDigits                : setDigits,
        greatestCommonDivisor    : greatestCommonDivisor,
        floatToFraction          : floatToFraction,
        getPowerLog              : getPowerLog,
        convertNumberBase        : convertNumberBase,
        getRandomNumber          : getRandomNumber,

        each                     : each,
        clone                    : clone,

        toArray                  : toArray,
        objectLength             : objectLength,
        JSON_parse               : JSON_parse,
        JSON_stringify           : JSON_stringify,
        recursiveFreezeObject    : recursiveFreezeObject,
        exactTypeof              : exactTypeof,

        formatDate               : formatDate,
        minutesLimitedTime       : minutesLimitedTime,
        hoursLimitedTime         : hoursLimitedTime,
        humanLimitedTime         : humanLimitedTime,
        timezone                 : timezone,
        daylightSavingTime       : daylightSavingTime,

        bind                     : bind,
        extend                   : extend,
        isEmpty                  : isEmpty,
        isEqual                  : isEqual,
        debounce                 : debounce,
        throttle                 : throttle,
        eventToKey               : eventToKey,

        getHrefPart              : getHrefPart,
        updateElementStyle       : updateElementStyle
    };


    /*Determine if we need to make an export for Node.js or common browser 'window' client*/
    var export_object = typeof module == 'object' && typeof module.exports == 'object' ? module.exports : (typeof window == 'object' ? (window.utils = {}) : {});

    /*Extend and override with all utility functions the object meant to be used for external access*/
    each( utils, function (util_function, util_name) {
        export_object[ util_name ] = util_function;
    });
})();