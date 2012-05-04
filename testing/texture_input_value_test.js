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
 * @fileoverview Test cases for TextureInputValue.
 * @author rowillia@google.com (Roy Williams)
 */

goog.require('glslunit.testing.TextureInputValue');
goog.require('glslunit.testing.UntypedValue');
goog.require('goog.array');


/**
 * Constructor for TextureInputValueTest
 * @constructor
 */
function TextureInputValueTest() {
}
registerTestSuite(TextureInputValueTest);



/**
 * Test case testWithMipmap
 */
TextureInputValueTest.prototype.testWithMipmap = function() {
  var testValue = new glslunit.testing.UntypedValue(null, 'someVariable');
  var typedValue = testValue.asSingleColor([1, 2, 3, 4]);
  typedValue.withMipmap();
  expectEq(true, typedValue.getShaderVariable().useMipmap_);
};

/**
 * Test case testTexParameteri
 */
TextureInputValueTest.prototype.testTexParameteri = function() {
  var testValue = new glslunit.testing.UntypedValue(null, 'someVariable');
  var typedValue = testValue.asSingleColor([1, 2, 3, 4]);
  typedValue.texParameteri(42, 33);
  expectEq(1, typedValue.getShaderVariable().parameters_.length);
  expectEq(42, typedValue.getShaderVariable().parameters_[0].name);
  expectEq(33, typedValue.getShaderVariable().parameters_[0].value);
  expectEq(false, typedValue.getShaderVariable().parameters_[0].isFloat);
};

/**
 * Test case testTexParameterf
 */
TextureInputValueTest.prototype.testTexParameterf = function() {
  var testValue = new glslunit.testing.UntypedValue(null, 'someVariable');
  var typedValue = testValue.asSingleColor([1, 2, 3, 4]);
  typedValue.texParameterf(42, 33);
  expectEq(1, typedValue.getShaderVariable().parameters_.length);
  expectEq(42, typedValue.getShaderVariable().parameters_[0].name);
  expectEq(33, typedValue.getShaderVariable().parameters_[0].value);
  expectEq(true, typedValue.getShaderVariable().parameters_[0].isFloat);
};
