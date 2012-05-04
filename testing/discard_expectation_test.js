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
 * @fileoverview Test cases for DiscardExpectation.
 * @author rowillia@google.com (Roy Williams)
 */

goog.require('glslunit.Executor');
goog.require('glslunit.Generator');
goog.require('glslunit.glsl.parser');
goog.require('glslunit.testing.DiscardExpectation');
goog.require('goog.testing.LooseMock');



/**
 * Constructor for DiscardExpectationTest
 * @constructor
 */
function DiscardExpectationTest() {
}
registerTestSuite(DiscardExpectationTest);



/**
 * Test case testPass
 */
DiscardExpectationTest.prototype.testPass = function() {
  var testExecutor = new goog.testing.LooseMock(glslunit.Executor);
  testExecutor.extractValue(goog.testing.mockmatchers.isObject)
      .$does(function(extractAst) {
        expectEq('vec4(0.,1.,0.,1.)',
            glslunit.Generator.getSourceCode(extractAst));
        return 'discard';
      });
  testExecutor.$replay();

  var testComp = new glslunit.testing.DiscardExpectation();
  testComp.run(testExecutor);
  expectTrue(testComp.getTestPassed());
};

/**
 * Test case testFail
 */
DiscardExpectationTest.prototype.testFail = function() {
  var testExecutor = new goog.testing.LooseMock(glslunit.Executor);
  testExecutor.extractValue(goog.testing.mockmatchers.isObject)
      .$does(function(extractAst) {
        expectEq('vec4(0.,1.,0.,1.)',
            glslunit.Generator.getSourceCode(extractAst));
        return 42;
      });
  testExecutor.$replay();

  var testComp = new glslunit.testing.DiscardExpectation();
  testComp.run(testExecutor);
  expectFalse(testComp.getTestPassed());
  expectEq("Expected shader would discard but it didn't",
      testComp.getFailureString());
};
