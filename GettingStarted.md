# Introduction #

GLSL Unit is a unit testing framework that allows you to write and run unit tests for your WebGL GLSL Code.  GLSL Unit will run your test code on your graphics card and extract results, so it'll be identical to the execution environment of your shader code in production!

To get started right away, please visit our app engine page at http://glslunit.appspot.com

# Setup #

> GLSL Unit exposes itself to other test frameworks through JsTD.  JsTD is another testing framework

  1. Download and configure JsTD.  You'll want to download the self-contained executable jar from [here](http://code.google.com/p/js-test-driver/downloads/list) and getting started instructions [here](http://code.google.com/p/js-test-driver/wiki/GettingStarted).  After installing and starting a JSTD server, capture a browser on port 9876 with WebGL enabled browser.
  1. Clone the GLSL Unit repository with Git
```
git clone https://code.google.com/p/glsl-unit/
```
  1. Inside of the "example" directory, execute the following
```
# Replace the path to the JsTestDriver jar with the path to your local copy
java -jar ../../JsTestDriver-1.3.3c.jar --tests all --config jsTestDriver.conf --reset
```
  1. Congratulations!  You've just run your first set of GLSL Test cases!

# Learning GLSL Unit #

In the examples directory, there is a file [glslunit\_tutorial.js](http://code.google.com/p/glsl-unit/source/browse/example/glslunit_tutorial.js).  This file provides a detailed overview of writing your own GLSL Unit tests.  This should provide a good starting point.

# Writing GLSL Unit Tests #

Copying  [glslunit\_template.js](http://code.google.com/p/glsl-unit/source/browse/example/glslunit_template.js). is a great place to get started with.  Copy and paste that for a easy place to get started.  Once you have your test cases written, [jsTestDriver.conf](http://code.google.com/p/glsl-unit/source/browse/example/jsTestDriver.conf) provides a template for writing JsTestDriver configuration files.  GLSL Unit is just a plugin for JsTestDriver, so the rest of the JsTestDriver stack will work.

See the JsTestDriver documentation [here](http://code.google.com/p/js-test-driver/wiki/ContinuousBuild) for examples on how to integrate this in with a continuous build.

# How it works #

Magic.

# How it really works #

GLSL Unit will parse your shader code into an AST, and then modify that AST to add in the testing logic.  GLSL Unit will encode all values want to test as colors, and then decode that color in javascript to get what the value was inside of the running GLSL.