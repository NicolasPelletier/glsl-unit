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
 * @fileoverview Test cases for GLSL parser grammer generated by glsl.pegjs.
 * @author rowillia@google.com (Roy Williams)
 */
goog.require('glslunit.Generator');
goog.require('glslunit.glsl.parser');
goog.require('goog.array');

/**
 * Constructor for GlslParserTest
 * @constructor
 */
function GlslParserTest() {
  setUp();
}
registerTestSuite(GlslParserTest);



function setUp() {
  parser = glslunit.glsl.parser;
}

function roundTripTest(testSource, startRule) {
  expectEq(testSource,
      glslunit.Generator.getSourceCode(parser.parse(testSource, startRule)));
}

function throwsExceptionTest(testSource, failMessage, shaderType) {
  var threwException = false;
  try {
    parser.parse(testSource, shaderType);
  } catch (e) {
    threwException = true;
  }
  expectEq(true, threwException, failMessage);
}

/**
 * Test case testEmptyFunction
 */
GlslParserTest.prototype.testEmptyFunction = function() {
  roundTripTest('void main(){}');
};

/**
 * Test case testPreprocessor
 */
GlslParserTest.prototype.testPreprocessor = function() {
  var directives = ['define', 'undef', 'pragma', 'version', 'error',
                    'extension', 'line'];
  goog.array.forEach(directives, function(directive) {
                       var testSource = '#' + directive + ' something';
                       expectEq(testSource + '\n',
                           glslunit.Generator.getSourceCode(
                               parser.parse(testSource)));
                     });
  directives = ['ifdef', 'ifndef', 'if'];
  goog.array.forEach(directives, function(directive) {
                       var testSource = '#' + directive + ' FOO\n' +
                                       'void main(){}\n' +
                                       '#elif BAR\n' +
                                       'void barMain(){}\n' +
                                       '#else\n' +
                                       'void elseMain(){}\n' +
                                       '#endif';
                       expectEq(testSource + '\n',
                           glslunit.Generator.getSourceCode(
                               parser.parse(testSource)));
                    });
  var testSource = '#define FOO\n' +
                   'void main(){}\n' +
                   '#endif';
  throwsExceptionTest(testSource,
                     'Parser should throw exception on #endif without an #if');
  testSource = '#ifdef FOO\n' +
               'void main(){}\n';
  throwsExceptionTest(testSource,
                      'Parser should throw exception on #ifdef without #endif');
};

/**
 * Test case testAttributeDeclaration
 */
GlslParserTest.prototype.testAttributeDeclaration = function() {
  roundTripTest('attribute vec2 something;', 'vertex_start');
  roundTripTest('attribute vec3 something,somethingElse;', 'vertex_start');
  throwsExceptionTest('attribute vec2 something;',
                      'Parser should throw exception when parsing attribute ' +
                        'in a fragment shader',
                      'fragment_start');
  throwsExceptionTest('attribute float something = 11.1;',
                      'Should not be able to initalize attributes',
                      'vertex_start');
  throwsExceptionTest('attribute float problems[99];',
                      'Should not be able to declare attribute arrays',
                      'vertex_start');
};

/**
 * Test case testFullySpecifiedType
 */
GlslParserTest.prototype.testFullySpecifiedType = function() {
  var typeQualifiers = ['', 'const ', 'varying ',
                        'invariant varying ', 'uniform '];
  goog.array.forEach(typeQualifiers, function(typeQualifier) {

    roundTripTest(typeQualifier + 'highp vec4 something;');
    roundTripTest(typeQualifier + 'mat2 something,somethingElse[12];');
  });
  throwsExceptionTest('void main(){varying float not_me;}',
                      'Local types should not be able to have qualifiers');
};

/**
 * Test case testFunctionPrototype
 */
GlslParserTest.prototype.testFunctionPrototype = function() {
  roundTripTest('void func();');
  roundTripTest('highp mat3 func();');
  roundTripTest('float func(mat4 a,bool b);');
  roundTripTest('void func(in sampler2D a,inout highp float b);');
  roundTripTest('float func(const in samplerCube a[12]);');
  throwsExceptionTest('void func(const out float a);',
                      'Only in arguments can be declared const');
  throwsExceptionTest('void func(varying out float a);',
                      'Function Parameters can\'t have qualifiers');
};

/**
 * Test case testLocallySpecifiedType
 */
GlslParserTest.prototype.testLocallySpecifiedType = function() {
  roundTripTest('void main(){int x;}');
  roundTripTest('void main(){int x[1];}');
  roundTripTest('void main(){const highp int x[],y;}');
  throwsExceptionTest('void main(){void x;}',
                      'Types can\'t be declared as void');
  throwsExceptionTest('void main(){int lowp;}',
                      'Variables can\'t have reserved names');
};

/**
 * Test case testStruct
 */
GlslParserTest.prototype.testStruct = function() {
  roundTripTest('struct{int x;};');
  roundTripTest('varying struct{int x[1],y;};');
  roundTripTest('struct s{int x;highp float y;};');
  roundTripTest('struct s{int x;}z;');
  roundTripTest('struct s{int x;}z;struct s2{s y;}q;');
  throwsExceptionTest('struct{int x[];};',
                      'Arrays in structs must have a size');
  throwsExceptionTest('struct{int x;struct {int y;}a;};',
                      'Structs can\'t be embedded in structs');
};

/**
 * Test case testIntConstant
 */
GlslParserTest.prototype.testIntConstant = function() {
  var testSource = 'int x=128;';
  roundTripTest(testSource);
  expectEq(testSource,
      glslunit.Generator.getSourceCode(parser.parse('int x=0x80;')));
  expectEq(testSource,
      glslunit.Generator.getSourceCode(parser.parse('int x=0200;')));
  roundTripTest('int x=0;');
};

/**
 * Test case testFloatConstant
 */
GlslParserTest.prototype.testFloatConstant = function() {
  roundTripTest('float x=12.8;');
  roundTripTest('float x=1.28e23;');
  roundTripTest('float x=1.28e-23;');
  roundTripTest('float x=1e23;');
};

/**
 * Test case testBoolConstant
 */
GlslParserTest.prototype.testBoolConstant = function() {
  roundTripTest('bool b=false;');
  roundTripTest('bool b=true;');
};

/**
 * Test case testPostfix
 */
GlslParserTest.prototype.testPostfix = function() {
  roundTripTest('x[1]', 'condition');
  roundTripTest('x.xyz', 'condition');
  roundTripTest('x[1].xyz[1]', 'condition');
  roundTripTest('x++', 'condition');
  expectEq('x++',
      glslunit.Generator.getSourceCode(parser.parse('x ++', 'condition')));
  roundTripTest('x--', 'condition');
  roundTripTest('x[1].xyz[1]++', 'condition');
  roundTripTest('x[1]++.rgba', 'condition');
  throwsExceptionTest('x++++', '++/-- can\'t repeat', 'condition');
  throwsExceptionTest('x++--', '++/-- can\'t repeat', 'condition');
};

/**
 * Test case testUnary
 */
GlslParserTest.prototype.testUnary = function() {
  var expressions = ['-', '+', '++', '--', '!', '~'];
  goog.array.forEach(expressions, function(expression) {
    var testCode = expression + 'x';
    roundTripTest(testCode, 'condition');
    var node = parser.parse(testCode, 'condition');
    expectEq('unary', node.type);
    // Check to make sure we parsed properly.  This checks that --/++ get parsed
    // properly instead of as two separate +'s or -'s
    expectEq(expression, node.operator.operator);
    expectEq('identifier', node.expression.type);
  });
};

/**
 * Test case testBinary
 */
GlslParserTest.prototype.testBinary = function() {
  var operators = ['*', '/', '%', '+', '-', '<<', '>>', '<', '>', '<=', '==',
                   '>=', '!=', '&', '^', '|', '&&', '||'];
  goog.array.forEach(operators, function(operator) {
    var testCode = 'x' + operator + 'y';
    roundTripTest(testCode, 'condition');
    var node = parser.parse(testCode, 'condition');
    expectEq('binary', node.type);
    expectEq(operator, node.operator.operator);
    expectEq('x', node.left.name);
    expectEq('y', node.right.name);
  });
  roundTripTest('(x+y)*9', 'condition');
};

/**
 * Test case testFunctionCall
 */
GlslParserTest.prototype.testFunctionCall = function() {
  roundTripTest('void main(){func(a,b,c);}');
};

/**
 * Test case testWhiteSpaceFunction
 */
GlslParserTest.prototype.testWhiteSpaceFunction = function() {
  var testSource = '\n' +
    'precision highp float;\n' +
    'attribute vec4 aOutput;\n' +
    'float someFunc(void);\n' +
    '\n' +
    'void main(void) {\n' +
    '  gl_Position = someFunc() * vec4(1.,2.,3.,4.);\n' +
    '}\n' +
    'float someFunc(void) {\n' +
    '  return 42.0;\n' +
    '}';
  var goldenSource =
    'precision highp float;' +
    'attribute vec4 aOutput;' +
    'float someFunc();' +
    'void main(){' +
    'gl_Position=someFunc()*vec4(1.,2.,3.,4.);' +
    '}' +
    'float someFunc(){' +
    'return 42.;' +
    '}';
  expectEq(goldenSource,
      glslunit.Generator.getSourceCode(parser.parse(testSource)));
};
