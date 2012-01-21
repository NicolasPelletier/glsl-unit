// Copyright 2011 Google Inc. All Rights Reserved.

/**
 * @fileoverview Optimizer that minifies conversion
 * @author rowillia@google.com (Roy Williams)
 */
goog.provide('glslunit.compiler.ConversionMinifier');

goog.require('glslunit.ASTTransformer');
goog.require('glslunit.Generator');
goog.require('glslunit.CallGraphVisitor');
goog.require('glslunit.compiler.CompilerStep');
goog.require('glslunit.compiler.ShaderProgram');
goog.require('goog.array');



/**
 * Optimizer that minifies conversion by converting from the shortest type and
 * replaces redundant arguments.  For example. vec4(1., 1., 1., 1.) will become
 * vec4(1)
 * @constructor
 * @extends {glslunit.ASTTransformer}
 * @implements {glslunit.compiler.CompilerStep}
 */
glslunit.compiler.ConversionMinifier = function() {
  goog.base(this);

  /**
   * Stack of all nodes being transformed.
   * @type {Array.<string>}
   * @private
   */
  this.nodeStack_ = [];
};
goog.inherits(glslunit.compiler.ConversionMinifier,
              glslunit.ASTTransformer);


/**
 * Map of built in conversion functions in GLSL.
 * @const
 * @type {!Object.<string, boolean>}
 * @private
 */
glslunit.compiler.ConversionMinifier.CONVERSION_FUNCTIONS_ = {
  'vec2': true, 'vec3': true, 'vec4': true,
  'bvec2': true, 'bvec3': true, 'bvec4': true,
  'ivec2': true, 'ivec3': true, 'ivec4': true,
  'mat2': true, 'mat3': true, 'mat4': true,
  'float': true, 'int': true, 'bool': true
}


/** @override */
glslunit.compiler.ConversionMinifier.prototype.getBeforeTransformFunction =
    function(node) {
  this.nodeStack_.push(node);
};


/** @override */
glslunit.compiler.ConversionMinifier.prototype.getAfterTransformFunction =
    function(node) {
  this.nodeStack_.pop();
};


/**
 * If able to, converts a node to an integer.
 * @param {!Object} node The node to transform.
 * @return {!Object} The transformed node.
 * @export
 */
glslunit.compiler.ConversionMinifier.prototype.convertToInt =
    function(node) {
  // We slice off at -2 because the node itself will also be on the stack, and
  // we want it's parent.
  var parentNode = this.nodeStack_.slice(-2)[0];
  if (parentNode.type == 'function_call' &&
      parentNode.function_name in
          glslunit.compiler.ConversionMinifier.CONVERSION_FUNCTIONS_) {
    if (node.value == Math.round(node.value)) {
      var result = glslunit.ASTTransformer.cloneNode(node);
      result.type = 'int';
      result.value = Number(node.value);
      return result;
    }
  }
  return node;
};


/**
 * Transforms all floats who are the children of conversion nodes to ints iff
 * the float represents an integer.  For example, vec2(0.,1.) will become
 * vec2(0,1);
 * @param {!Object} node The node to transform.
 * @return {!Object} The transformed node.
 * @export
 */
glslunit.compiler.ConversionMinifier.prototype.transformFloat =
    glslunit.compiler.ConversionMinifier.prototype.convertToInt;


/**
 * Transforms all bools who are the children of conversion nodes to ints iff
 * the float represents an integer.  For example. bvec2(false, true) will be
 * transformed into bvec2(0,1);
 * @param {!Object} node The node to transform.
 * @return {!Object} The transformed node.
 * @export
 */
glslunit.compiler.ConversionMinifier.prototype.transformBool =
    glslunit.compiler.ConversionMinifier.prototype.convertToInt;


/**
 * If a conversion function call has all of it's parameters with the same value,
 * we only need to specify the value once.  For example, vec4(1, 1, 1, 1) will
 * become vec4(1)
 * @param {!Object} node The node to transform.
 * @return {!Object} The transformed node.
 * @export
 */
glslunit.compiler.ConversionMinifier.prototype.transformFunctionCall =
    function(node) {
  if (node.function_name in
          glslunit.compiler.ConversionMinifier.CONVERSION_FUNCTIONS_ &&
      node.parameters && node.parameters.length > 1) {
    var firstParam = glslunit.Generator.getSourceCode(node.parameters[0]);
    var allEqual = goog.array.every(node.parameters, function(parameter) {
      return glslunit.Generator.getSourceCode(parameter) == firstParam;
    });
    if (allEqual) {
      var result = glslunit.ASTTransformer.cloneNode(node);
      result.parameters = [node.parameters[0]];
      return result;
    }
  }
  return node;
};


/**
 * The name of this compilation step.
 * @type {string}
 */
glslunit.compiler.ConversionMinifier.NAME = 'ConversionMinifier';


/** @override */
glslunit.compiler.ConversionMinifier.prototype.getName = function() {
  return glslunit.compiler.ConversionMinifier.NAME;
};


/** @override */
glslunit.compiler.ConversionMinifier.prototype.getDependencies =
    function() {
  return [];
};


/** @override */
glslunit.compiler.ConversionMinifier.prototype.performStep =
    function(stepOutputMap, shaderProgram) {
  var vertexTransformer = new glslunit.compiler.ConversionMinifier();
  var fragmentTransformer = new glslunit.compiler.ConversionMinifier();
  shaderProgram.vertexAst =
      vertexTransformer.transformNode(shaderProgram.vertexAst);
  shaderProgram.fragmentAst =
      fragmentTransformer.transformNode(shaderProgram.fragmentAst);
  return [];
};
