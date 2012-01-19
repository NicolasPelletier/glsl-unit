// Copyright 2011 Google Inc. All Rights Reserved.

/**
 * @fileoverview Test cases for the ConstructorMinifier.
 * @author rowillia@google.com (Roy Williams)
 */

goog.require('glslunit.Generator');
goog.require('glslunit.compiler.ConstructorMinifier');
goog.require('glslunit.glsl.parser');
goog.require('goog.testing.jsunit');



function setUp() {
  inputSource =
      'vec4 foo = vec4(1.2, 2.1, 3.+2., 3.001);' +
      'vec4 bar = vec4(1.2, 0., 3.2, 3.001);' +
      'vec4 meh = vec4(1.2, 1., 1.2, 1.);' +
      'bvec2 raz = bvec2(false, true);' +
      'ivec3 baz = ivec3(1., 1, 1);';
}


function testConstructorMinifier() {
  var expectedSource =
      'vec4 foo=vec4(1.2,2.1,3.+2.,3.001);' +
      'vec4 bar=vec4(1.2,0,3.2,3.001);' +
      'vec4 meh=vec4(1.2,1,1.2,1);' +
      'bvec2 raz=bvec2(0,1);' +
      'ivec3 baz=ivec3(1);';
  var minifier = new glslunit.compiler.ConstructorMinifier();
  var inputNode = glslunit.glsl.parser.parse(inputSource);
  var newNode = minifier.transformNode(inputNode);
  assertNotEquals(inputNode, newNode);
  assertEquals(expectedSource, glslunit.Generator.getSourceCode(newNode));
}
