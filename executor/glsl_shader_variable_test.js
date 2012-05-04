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
 * @fileoverview Test cases for the ShaderVariable.
 * @author rowillia@google.com (Roy Williams)
 */

goog.require('glslunit.ShaderVariable');
goog.require('glslunit.VariableScopeVisitor');
goog.require('glslunit.glsl.parser');
goog.require('goog.testing.LooseMock');

/**
 * Constructor for GlslShaderVariableTest
 * @constructor
 */
function GlslShaderVariableTest() {
  setUp();
}
registerTestSuite(GlslShaderVariableTest);



function setUp() {
  var testSource =
      'attribute float foo;' +
      'uniform vec3 zzz;' +
      'mat3 global;' +
      'invariant varying float raz;';
  var testAST = glslunit.glsl.parser.parse(testSource, 'vertex_start');
  rootVariables =
    glslunit.VariableScopeVisitor.getVariablesInScope(testAST, testAST);
  var func = function()  {};
  webglContext = {
    enableVertexAttribArray: func,
    disableVertexAttribArray: func,
    getAttribLocation: func,
    getUniformLocation: func
  };
}


/**
 * Tests that attributes get their location correctly.
 */
GlslShaderVariableTest.prototype.testAttribute = function() {
  var fooShaderVariable = new glslunit.ShaderVariable('foo');
  fooShaderVariable.setGlobalVariables(rootVariables);
  expectEq(glslunit.ShaderVariable.QualifierType.ATTRIBUTE,
      fooShaderVariable.getQualifierType(), 'foo should be an attribute');

  var webglMock = new goog.testing.LooseMock(webglContext);
  var testProgram = {};
  var testLocation = 555;
  webglMock.getAttribLocation(testProgram, 'foo').$returns(testLocation);
  webglMock.enableVertexAttribArray(testLocation);
  webglMock.disableVertexAttribArray(testLocation);
  webglMock.$replay();

  var result = fooShaderVariable.getLocation(webglMock, testProgram);
  expectEq(result, testLocation);
  expectEq(false, fooShaderVariable.getIsTexture());
  expectEq('float', fooShaderVariable.getTypeName());
  fooShaderVariable.cleanUp(webglMock);
  webglMock.$verify();
};


/**
 * Tests that uniforms get their location correctly.
 */
GlslShaderVariableTest.prototype.testUniform = function() {
  var barShaderVariable = new glslunit.ShaderVariable('bar');
  barShaderVariable.setGlobalVariables(rootVariables,
                                       {'bar': 'zzz'});
  expectEq(glslunit.ShaderVariable.QualifierType.UNIFORM,
      barShaderVariable.getQualifierType(), 'bar should be a uniform');

  var webglMock = new goog.testing.LooseMock(webglContext);
  var testProgram = {};
  var testLocation = {};
  webglMock.getUniformLocation(testProgram, 'zzz').$returns(testLocation);
  webglMock.$replay();

  var result = barShaderVariable.getLocation(webglMock, testProgram);
  expectEq(result, testLocation);

  webglMock.$verify();
};


/**
 * Tests that varyings get their location correctly.
 */
GlslShaderVariableTest.prototype.testVarying = function() {
  var razShaderVariable = new glslunit.ShaderVariable('raz');
  razShaderVariable.setGlobalVariables(rootVariables,
                                       {'bar': 'zzz'});
  expectEq(glslunit.ShaderVariable.QualifierType.VARYING,
      razShaderVariable.getQualifierType(), 'raz should be a varying');

  var webglMock = new goog.testing.LooseMock(webglContext);
  var testProgram = {};
  var testLocation = {};
  webglMock.getUniformLocation(testProgram, 'raz').$returns(testLocation);
  webglMock.$replay();

  var result = razShaderVariable.getLocation(webglMock, testProgram);
  expectEq(result, testLocation);

  webglMock.$verify();
};


/**
 * Tests that the proper exception gets thrown when a shader variable is missing
 * from the global scope.
 */
GlslShaderVariableTest.prototype.testExceptionOnMising = function() {
  var mehShaderVariable = new glslunit.ShaderVariable('meh');
  mehShaderVariable.setGlobalVariables(rootVariables,
                                       {'bar': 'zzz'});
  var exceptionThrown = false;
  try {
    mehShaderVariable.getQualifierType();
  } catch (e) {
    exceptionThrown = true;
    expectEq(e, 'meh was not an input variable to the shader program.');
  }
  expectTrue(exceptionThrown);
};


/**
 * Tests that the proper exception gets thrown when a shader variable is a
 * non-input global.
 */
GlslShaderVariableTest.prototype.testExceptionOnNonInput = function() {
  var globalShaderVariable = new glslunit.ShaderVariable('global');
  globalShaderVariable.setGlobalVariables(rootVariables,
                                       {'bar': 'zzz'});
  var exceptionThrown = false;
  try {
    globalShaderVariable.getQualifierType();
  } catch (e) {
    exceptionThrown = true;
    expectEq(e, 'global was not an input variable to the shader program.');
  }
  expectTrue(exceptionThrown);
};
