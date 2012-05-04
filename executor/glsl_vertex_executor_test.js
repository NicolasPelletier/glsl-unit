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
 * @fileoverview Test cases for the VertexExecutor.
 * @author rowillia@google.com (Roy Williams)
 */

goog.require('glslunit.ASTVisitor');
goog.require('glslunit.Generator');
goog.require('glslunit.VertexExecutor');
goog.require('glslunit.glsl.parser');

/**
 * Constructor for GlslVertexExecutorTest
 * @constructor
 */
function GlslVertexExecutorTest() {
}
registerTestSuite(GlslVertexExecutorTest);



assignmentFinder = function(targetVar) {
  this.assignment = null;
  this.targetVar_ = targetVar;
};
goog.inherits(assignmentFinder, glslunit.ASTVisitor);


/**
 * Visits a binary node and if it's the '=' operator stores the value being
 * assigned to.
 * @param {Object} node A binary node to check for an assignment.
 * @export
 */
assignmentFinder.prototype.visitBinary = function(node) {
  if (node.operator.operator == '=' && node.left.name == this.targetVar_) {
    this.assignment = node.right;
  }
  this.genericVisitor(node);
};


/**
 * Tests that the fragment AST can be fetched and is correct.
 */
GlslVertexExecutorTest.prototype.testGetFragmentAst = function() {
  var testExecutor = new glslunit.VertexExecutor(null, null, null, null, null);
  var fragmentAst = testExecutor.getFragmentAst();
  var finder = new assignmentFinder('gl_FragColor');
  finder.visitNode(fragmentAst);
  expectThat(finder.assignment,
      not(isNull), "Couldn't find gl_FragColor assignment");
};


/**
 * Tests that the vertex AST is properly instrumented with test code.
 */
GlslVertexExecutorTest.prototype.testGetVertexAst = function() {
  var testSource =
    'void main() {' +
    '  someValue = vec(1.0,2.0,3.0,4.0);' +
    '}';
  var extractionTargetSource = 'someValue[1]';
  var extractionAst = glslunit.glsl.parser.parse(extractionTargetSource,
                                                 'assignment_expression');
  var testAst = glslunit.glsl.parser.parse(testSource);
  var testExecutor = new glslunit.VertexExecutor(null, testAst, null,
                                                 null, null);

  var transformedAst = testExecutor.getVertexAst(extractionAst);
  expectEq(1,
      testAst.statements.length, "Orignal shouldn't have been transformed");

  expectEq('upper_mask',
      transformedAst.statements[2].name, 'Encoding code not added');

  var finder = new assignmentFinder('gl_Position');
  finder.visitNode(transformedAst);
  expectThat(finder.assignment,
      not(isNull), "Couldn't find gl_Position assignment");

  finder = new assignmentFinder('vResultColor');
  finder.visitNode(transformedAst);
  expectEq('encodeFloat',
      finder.assignment.function_name, 'Result set to wrong value');
  expectEq(1,
      finder.assignment.parameters.length, 'Result set to wrong value');
  expectEq('function_call',
      finder.assignment.parameters[0].type, 'Result set to wrong value');
  expectEq('postfix',
      finder.assignment.parameters[0].parameters[0].type,
          'Result set to wrong value');
  var resultSource = glslunit.Generator.getSourceCode(transformedAst);
  expectNe(-1, resultSource.search('_testMain_'));
};

/**
 * Tests that the vertex AST is properly instrumented with test code.
 */
GlslVertexExecutorTest.prototype.testNoMainFunction = function() {
  var testSource = 'attribute vec4 someAttr;';
  var testAst = glslunit.glsl.parser.parse(testSource);
  var testExecutor = new glslunit.VertexExecutor(null, testAst, null,
    null, null);
  var extractionTargetSource = 'someAttr[1]';
  var extractionAst = glslunit.glsl.parser.parse(extractionTargetSource,
                                                 'assignment_expression');
  var transformedAst = testExecutor.getVertexAst(extractionAst);
  var resultSource = glslunit.Generator.getSourceCode(transformedAst);
  expectEq(-1, resultSource.search('_testMain_'));
};
