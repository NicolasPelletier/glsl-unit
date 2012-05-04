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
 * @fileoverview Test Cases for glsl test cases.
 * @author rowillia@google.com (Roy Williams)
 */

goog.require('glslunit.Generator');
goog.require('glslunit.glsl.parser');
goog.require('glslunit.testing.ComparisonExpectation');
goog.require('glslunit.testing.TestCase');


/**
 * Constructor for TestCaseTest
 * @constructor
 */
function TestCaseTest() {
  setUp();
}
registerTestSuite(TestCaseTest);



function setUp() {
  context = {};
  testSource =
      'uniform vec4 uTestLocation;' +
      'invariant varying float foo;' +
      'const int notMe;' +
      'void main(void) {' +
      '  gl_Position = gl_FragCoord;' +
      '}';
  testAst = glslunit.glsl.parser.parse(testSource);

  // Mock out the executors and ComparisonExpectation.
  currentTestType = null;
  glslunit.VertexExecutor = function(c, s, v, h, w) {
    expectEq(glslunit.testing.TestCase.TestType.VERTEX, currentTestType);
    expectEq(c, context);
    expectEq(glslunit.Generator.getSourceCode(s),
        glslunit.Generator.getSourceCode(testAst));
    expectEq(v.length, 1);
    expectEq(v[0].name_, 'uTestLocation');
    expectEq(20, h);
    expectEq(30, w);
  };
  glslunit.FragmentExecutor = function(c, s, v, h, w) {
    expectEq(glslunit.testing.TestCase.TestType.FRAGMENT, currentTestType);
    expectEq(c, context);
    expectEq(s, testAst);
    expectEq(v.length, 1);
    expectEq(v[0].name_, 'uTestLocation');
    expectEq(20, h);
    expectEq(30, w);
  };
  runCount = 0;
  glslunit.testing.ComparisonExpectation.prototype.run = function() {
    runCount++;
  }
  glslunit.testing.ComparisonExpectation.prototype.getTestPassed = function() {
    return true;
  }
}


/**
 * Test case testVertexTestCase
 */
TestCaseTest.prototype.testVertexTestCase = function() {
  // Test Vertex test cases.
  currentTestType = glslunit.testing.TestCase.TestType.VERTEX;
  var testCase = new glslunit.testing.TestCase(
      context, 20, 30,
      glslunit.testing.TestCase.TestType.VERTEX,
      testAst, 'Test TestCase!', function(gl) {
    expectEq(gl, context);
    expectThat(set, not(isUndefined));
    expectThat(expect, not(isUndefined));
    expectThat(goog.global.expectDiscard, isUndefined);

    define('FOO 0');
    define('BAR');
    var s = set('uTestLocation');
    s.asArray([1, 2, 3, 4]);
    expectEq('uTestLocation', s.variableName_);
    expect('gl_Position').equal([1, 2, 3, 4]);
    expect('gl_Position').lessThan([2, 4, 6, 8]);
  });
  expectedSource =
    '#define FOO 0\n' +
    '#define BAR\n' +
    testSource;
  testAst = glslunit.glsl.parser.parse(expectedSource);
  testCase.run();

  expectTrue(testCase.getTestPassed());
  expectEq('Test TestCase!', testCase.getDescription());
  expectEq(2, runCount);
  expectEq(2, testCase.getExpectations().length);
};

/**
 * Test case testFragmentTestCase
 */
TestCaseTest.prototype.testFragmentTestCase = function() {
  // Test Fragment test cases.
  currentTestType = glslunit.testing.TestCase.TestType.FRAGMENT;
  var testCase = new glslunit.testing.TestCase(
        context, 20, 30,
        glslunit.testing.TestCase.TestType.FRAGMENT,
        testAst, 'Test TestCase!', function() {
    var s = set('uTestLocation');
    s.asArray([1, 2, 3, 4]);
    expectEq('uTestLocation', s.variableName_);
    expectThat(set, not(isUndefined));
    expectThat(expect, not(isUndefined));
    expectThat(expectDiscard, not(isUndefined));

    expect('gl_FragColor').equal([1, 2, 3, 4]);
  });
  testCase.run();
  expectEq(2, testCase.getTestWarnings().length);
  expectEq('Warning: variable "foo" was not set.  Expected input of type ' +
           '"invariant varying float"',
      testCase.getTestWarnings()[0]);
  expectEq('Warning: variable "gl_FragCoord" was not set.  Expected ' +
           'input of type "varying mediump vec4"',
      testCase.getTestWarnings()[1]);
};
