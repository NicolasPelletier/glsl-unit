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
 * @fileoverview Test cases for UntypedValues.
 * @author rowillia@google.com (Roy Williams)
 */

goog.require('glslunit.testing.UntypedValue');
goog.require('goog.array');


/**
 * Constructor for UntypedValueTest
 * @constructor
 */
function UntypedValueTest() {
}
registerTestSuite(UntypedValueTest);



/**
 * Test case testAsArray
 */
UntypedValueTest.prototype.testAsArray = function() {
  var testValue = new glslunit.testing.UntypedValue('someVariable');
  var typedValue = testValue.asArray([1, 2, 3, 4]);
  expectEq('someVariable', testValue.getShaderVariable().name_);
  expectTrue(goog.array.equals(testValue.getShaderVariable().values_,
                               [1, 2, 3, 4]));
};

/**
 * Test case testAsIdentityMatrix
 */
UntypedValueTest.prototype.testAsIdentityMatrix = function() {
  var testValue = new glslunit.testing.UntypedValue('someVariable');
  var typedValue = testValue.asIdentityMatrix();
  expectEq('someVariable', testValue.getShaderVariable().name_);
  expectTrue(goog.array.equals(testValue.getShaderVariable().values_,
                               [1, 0, 0, 0,
                                0, 1, 0, 0,
                                0, 0, 1, 0,
                                0, 0, 0, 1]));
};


/**
 * Test case testSingleColor
 */
UntypedValueTest.prototype.testSingleColor = function() {
  var testValue = new glslunit.testing.UntypedValue('someVariable');
  var typedValue = testValue.asSingleColor([1, 2, 3, 4]);
  expectEq('someVariable', testValue.getShaderVariable().name_);
  expectTrue(goog.array.equals(testValue.getShaderVariable().data_,
                               [1, 2, 3, 4]));

  var errorMessage = 'Error while creating a Single Color for someVariable: ' +
      'Expected 4 components but found 3 components.';
  expectThat(function() {testValue.asSingleColor([1, 2, 3])},
      throwsError(/.?/), errorMessage);
};


/**
 * Test case test2DTexture
 */
UntypedValueTest.prototype.test2DTexture = function() {
  var testValue = new glslunit.testing.UntypedValue('someVariable');
  var inputData = [1, 2, 3, 4,
                   5, 6, 7, 8,
                   9, 1, 2, 3];
  var typedValue = testValue.as2DTexture(inputData, 3, 1);
  expectEq('someVariable', testValue.getShaderVariable().name_);
  expectTrue(goog.array.equals(testValue.getShaderVariable().data_, inputData));
  expectEq(testValue.getShaderVariable().height_, 3);
  expectEq(testValue.getShaderVariable().width_, 1);

  var errorMessage = 'Error while creating a Single Color for someVariable: ' +
      'Expected 12 components but found 4 components.';
  expectThat(function() {testValue.as2DTexture([1, 2, 3, 4], 3, 1)},
      throwsError(/.?/), errorMessage);
};


/**
 * Test case testAsNumber
 */
UntypedValueTest.prototype.testAsNumber = function() {
  var testValue = new glslunit.testing.UntypedValue('anotherVariable');
  var typedValue = testValue.asNumber(42);
  expectEq('anotherVariable', testValue.getShaderVariable().name_);
  expectTrue(goog.array.equals(testValue.getShaderVariable().values_, [42]));
};

/**
 * Test case testAsBoolean
 */
UntypedValueTest.prototype.testAsBoolean = function() {
  var testValue = new glslunit.testing.UntypedValue('someOtherVariable');
  var typedValue = testValue.asBoolean(false);
  expectEq('someOtherVariable', testValue.getShaderVariable().name_);
  expectTrue(goog.array.equals(testValue.getShaderVariable().values_, [0]));
};
