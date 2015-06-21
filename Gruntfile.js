'use strict';

module.exports = function (grunt) {

  /*Get the plugin module which will provide Node.js unit testing*/
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  /*Set only the Node.js unit testing module*/
  grunt.initConfig({
    nodeunit: {
      all: ['build_tests/*_test.js']
    }
  });
};