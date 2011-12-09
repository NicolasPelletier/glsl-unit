// Copyright 2011 Google Inc. All Rights Reserved.

/**
 * @fileoverview Test cases for the DeclarationConsolidation.
 * @author rowillia@google.com (Roy Williams)
 */

goog.require('glslunit.Generator');
goog.require('glslunit.compiler.DeclarationConsolidation');
goog.require('glslunit.glsl.parser');
goog.require('goog.testing.jsunit');



function setUp() {
  inputSource =
    'float someMethod(const int foo, float bar);' +
    'attribute vec3 hello;' +
    'attribute vec3 world;\n' +
    '#ifdef FOO\n' +
    'attribute vec3 foo_def;\n' +
    '#elif BAR\n' +
    'attribute vec3 bar_def;\n' +
    '#endif\n' +
    'attribute vec3 how_are_you;' +
    'vec3 i_am_fine = vec3(42.,33.,55.);' +
    'void methodOrVariable(){}' +
    'void main() {' +
    '  int leaveMe;' +
    '  int methodOrVariable;' +
    '  vec2 vecDecl = vec2(1., 234.), notherDecl=vec2(2., 456.);' +
    '  anotherMethod();' +
    '  someMethod(1, 4.2);' +
    '  vec2 noopDecl = vec2(5.,789.);' +
    '}' +
    'vec3 thanks_for_asking;' +
    'float someMethod(const int foo, float bar) {' +
    '  vec2 anotherVecDecl;' +
    '  return bar + float(foo) + 12.4;' +
    '}';
}



function testDeclarationConsolidation() {
  var expectedSource =
    // These should be two separate declarations since one is an attribute and
    // the other is not.
    'float someMethod(const int foo,float bar);' +
    'attribute vec3 hello;' +
    'attribute vec3 world;\n' +
    '#ifdef FOO\n' +
    'attribute vec3 foo_def;\n' +
    '#elif BAR\n' +
    'attribute vec3 bar_def;\n' +
    '#endif\n' +
    'attribute vec3 how_are_you;' +
    'vec3 i_am_fine,thanks_for_asking;' +
    'i_am_fine=vec3(42.,33.,55.);' +
    'void methodOrVariable(){}' +
    'void main(){' +
    'int leaveMe,methodOrVariable;' +
    'vec2 vecDecl,notherDecl,noopDecl;' +
    'vecDecl=vec2(1.,234.);' +
    'notherDecl=vec2(2.,456.);' +
    'anotherMethod();' +
    'someMethod(1,4.2);' +
    'noopDecl=vec2(5.,789.);' +
    '}' +
    'float someMethod(const int foo,float bar){' +
    'vec2 anotherVecDecl;' +
    'return bar+float(foo)+12.4;' +
    '}';
  var minifier = new glslunit.compiler.DeclarationConsolidation();
  var inputNode = glslunit.glsl.parser.parse(inputSource);
  var newNode = minifier.transformNode(inputNode);
  assertNotEquals(inputNode, newNode);
  assertEquals(expectedSource, glslunit.Generator.getSourceCode(newNode));
}
