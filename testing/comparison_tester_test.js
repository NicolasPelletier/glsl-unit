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
 * @fileoverview Test cases for ComparisonTester.
 * @author rowillia@google.com (Roy Williams)
 */

goog.require('glslunit.Generator');
goog.require('glslunit.glsl.parser');
goog.require('glslunit.testing.ComparisonTester');



/**
 * Constructor for ComparisonTesterTest
 * @constructor
 */
function ComparisonTesterTest() {
}
registerTestSuite(ComparisonTesterTest);



/**
 * Test case testScalarNotEqual
 */
ComparisonTesterTest.prototype.testScalarNotEqual = function() {
  var testAst = glslunit.glsl.parser.parse('42.', 'assignment_expression');
  var testOperation = new glslunit.testing.ComparisonTester();

  testOperation.notEqual(33).withEpsilonOf(3);
  expectEq(33, testOperation.getValues());
  expectEq('!(abs(42.-33.)<=3.)',
      glslunit.Generator.getSourceCode(testOperation.getTestAstNode(testAst)));
};

/**
 * Test case testScalarEqual
 */
ComparisonTesterTest.prototype.testScalarEqual = function() {
  var testAst = glslunit.glsl.parser.parse('42.', 'assignment_expression');
  var testOperation = new glslunit.testing.ComparisonTester();

  testOperation.equal(33).withEpsilonOf(3);
  expectEq('abs(42.-33.)<=3.',
      glslunit.Generator.getSourceCode(testOperation.getTestAstNode(testAst)));
};


/**
 * Test case testScalarLessThan
 */
ComparisonTesterTest.prototype.testScalarLessThan = function() {
  var testAst = glslunit.glsl.parser.parse('42.', 'assignment_expression');
  var testOperation = new glslunit.testing.ComparisonTester();

  testOperation.lessThan(33).withEpsilonOf(12);
  expectEq('42.-12.<33.',
      glslunit.Generator.getSourceCode(testOperation.getTestAstNode(testAst)));
};

/**
 * Test case testScalarGreaterThanEqual
 */
ComparisonTesterTest.prototype.testScalarGreaterThanEqual = function() {
  var testAst = glslunit.glsl.parser.parse('42.', 'assignment_expression');
  var testOperation = new glslunit.testing.ComparisonTester();

  testOperation.greaterThanEqual(33).withEpsilonOf(12);
  expectEq('42.+12.>=33.',
      glslunit.Generator.getSourceCode(testOperation.getTestAstNode(testAst)));
};


/**
 * Test case testVectorNotEqual
 */
ComparisonTesterTest.prototype.testVectorNotEqual = function() {
  var testAst = glslunit.glsl.parser.parse('vec2(42., 33.)',
                                           'assignment_expression');
  var testOperation = new glslunit.testing.ComparisonTester();

  testOperation.notEqual([55, 21]).withEpsilonOf(1);

  expectEq('!=', testOperation.getOperator());
  expectEq(1, testOperation.getEpsilon());
  expectTrue(goog.array.equals([55, 21], testOperation.getValues()));
  expectEq('!all(lessThanEqual(abs(vec2(42.,33.)-vec2(55.,21.)),' +
                               'vec2(1.,1.)))',
      glslunit.Generator.getSourceCode(testOperation.getTestAstNode(testAst)));
};


/**
 * Test case testVectorEqual
 */
ComparisonTesterTest.prototype.testVectorEqual = function() {
  var testAst = glslunit.glsl.parser.parse('vec2(42., 33.)',
                                           'assignment_expression');
  var testOperation = new glslunit.testing.ComparisonTester();

  testOperation.any().equal([55, 21]).withEpsilonOf(1);
  expectEq('any(lessThanEqual(abs(vec2(42.,33.)-vec2(55.,21.)),' +
                              'vec2(1.,1.)))',
      glslunit.Generator.getSourceCode(testOperation.getTestAstNode(testAst)));
};


/**
 * Test case testVectorLessThanEqual
 */
ComparisonTesterTest.prototype.testVectorLessThanEqual = function() {
  var testAst = glslunit.glsl.parser.parse('vec2(42., 33.)',
                                           'assignment_expression');
  var testOperation = new glslunit.testing.ComparisonTester();

  testOperation.all().lessThanEqual([55, 21]).withEpsilonOf(1);
  expectEq('all(lessThanEqual(vec2(42.,33.)-1.,vec2(55.,21.)))',
      glslunit.Generator.getSourceCode(testOperation.getTestAstNode(testAst)));
};
