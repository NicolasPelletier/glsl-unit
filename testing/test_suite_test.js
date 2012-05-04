// Copyright 2011 Google Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Test cases for TestSuite.
 * @author rowillia@google.com (Roy Williams)
 */

goog.require('glslunit.Generator');
goog.require('glslunit.testing.TestCase');
goog.require('glslunit.testing.TestSuite');



/**
 * Constructor for TestSuiteTest
 * @constructor
 */
function TestSuiteTest() {
}
registerTestSuite(TestSuiteTest);



/**
 * Test case testTestSuite
 */
TestSuiteTest.prototype.testTestSuite = function() {
  var testContext = {};
  var testSource = 'void main(){discard;}';
  var testTestFn = function() {};
  var testResult = true;

  glslunit.testing.TestCase = function(context, height, width, type,
                               sourceAst, description, testFn) {
    expectEq(testContext, context);
    expectEq(type, glslunit.testing.TestCase.TestType.FRAGMENT);
    expectEq(23, height);
    expectEq(42, width);
    expectEq(testSource, glslunit.Generator.getSourceCode(sourceAst));
    expectEq('Some Test Case', description);
    expectEq(testTestFn, testFn);
  };
  glslunit.testing.TestCase.TestType = {
    FRAGMENT: 100
  };
  glslunit.testing.TestCase.prototype.run = function() {
    return testResult;
  };
  glslunit.testing.TestCase.prototype.getTestPassed = function() {
    return testResult;
  };

  var suite = new glslunit.testing.TestSuite(
      testContext, 23, 42, glslunit.testing.TestCase.TestType.FRAGMENT,
      'Some Sweet Test Suite', testSource,
       function() {
    expectThat(testMain, not(isUndefined));
    testMain('Some Test Case', testTestFn);
    testMain('Some Test Case', testTestFn);
  });

  expectEq('Some Sweet Test Suite', suite.getDescription());
  expectFalse(suite.getSuitePassed());
  expectTrue(suite.run());
  expectTrue(suite.getSuitePassed());
  expectEq(2, suite.getTestCases().length);

  testResult = false;
  expectFalse(suite.run());
  expectFalse(suite.getSuitePassed());
};
