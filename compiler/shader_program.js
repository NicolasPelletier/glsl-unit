// Copyright 2011 Google Inc. All Rights Reserved.

/**
 * @fileoverview Structure for storing information on a shader program to
 *     compile.
 * @author rowillia@google.com (Roy Williams)
 */

goog.provide('glslunit.compiler.ShaderAttributeEntry');
goog.provide('glslunit.compiler.ShaderProgram');
goog.provide('glslunit.compiler.ShaderUniformEntry');



/**
 * Structure for a shader attribute.
 * @constructor
 */
glslunit.compiler.ShaderAttributeEntry = function() {
  /**
   * The shortened name of the attribute in the compiled glsl code.
   * @type {string}
   */
  this.shortName = '';

  /**
   * The name of the attribute in the original glsl code.
   * @type {string}
   */
  this.originalName = '';

  /**
   * The number of elements in this attribute.  Should be [1, 4]
   * @type {number}
   */
  this.variableSize = 0;
};


/**
 * Structure for a shader uniform.
 * @constructor
 */
glslunit.compiler.ShaderUniformEntry = function() {
  /**
   * The shortened name of the attribute in the compiled glsl code.
   * @type {string}
   */
  this.shortName = '';

  /**
   * The name of the attribute in the original glsl code.
   * @type {string}
   */
  this.originalName = '';

  /**
   * The type of this uniform.
   * @type {string}
   */
  this.type = '';
};


/**
 * Structure for a shader program.
 * @constructor
 */
glslunit.compiler.ShaderProgram = function() {
  /**
   * The source code for the fragment shader for this program.
   * @type {!Object}
   */
  this.fragmentAst = {};

  /**
   * The source code for the vertex shader for this program.
   * @type {!Object}
   */
  this.vertexAst = {};

  /**
   * Map of the original name of a definition to the ShaderAttributeEntry with
   *     the properties of the shader attribute.
   * @type {Object.<string, glslunit.compiler.ShaderAttributeEntry>}
   */
  this.attributeMap = {};

  /**
   * Map of the original name of a uniform to it's name in the compiled code.
   * @type {Object.<string, glslunit.compiler.ShaderUniformEntry>}
   */
  this.uniformMap = {};
};
