// Copyright 2011 Google Inc. All Rights Reserved.

/**
 * @fileoverview Generates short names for variables.
 * @author rowillia@google.com (Roy Williams)
 */

goog.provide('glslunit.compiler.NameGenerator');

goog.require('goog.object');



/**
 * Constructs a new NameGenerator.
 * @constructor
 */
glslunit.compiler.NameGenerator = function() {
  /**
   * The map of original symbol names to their short name.
   * @type {Object.<string, string>}
   * @private
   */
  this.renameMap_ = {};

  /**
   * Set of keys that are currently being used.
   * @type {Object.<string, boolean>}
   * @private
   */
  this.usedKeys_ = {};

  /**
   * The index of the next free variable name.
   * @type {number}
   */
  this.nextNameIndex = 0;
};


/**
 * Valid leading characters for variable names in GLSL.  Even though _ is a
 *     valid character for GLSL names, we will reserve it for shortening
 *     defines.
 * @type {string}
 * @const
 * @private
 */
glslunit.compiler.NameGenerator.leadingCharacters_ =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';


/**
 * Valid trailing characters for variable names in GLSL.
 * @type {string}
 * @const
 * @private
 */
glslunit.compiler.NameGenerator.trailingCharacters_ =
  glslunit.compiler.NameGenerator.leadingCharacters_ + '1234567890';


/**
 * Gets the shortest GLSL variable name available at a given index.
 * @param {number} index The index of the variable to get a short name for.
 * @return {string} The short name at the index.
 */
glslunit.compiler.NameGenerator.getShortName = function(index) {
  var leadRadix = glslunit.compiler.NameGenerator.leadingCharacters_.length;
  var trailRadix = glslunit.compiler.NameGenerator.trailingCharacters_.length;
  var result =
    glslunit.compiler.NameGenerator.leadingCharacters_[index % leadRadix];
  index = Math.floor(index / leadRadix);
  while (index > 0) {
    index -= 1;
    result +=
      glslunit.compiler.NameGenerator.trailingCharacters_[(index % trailRadix)];
    index = Math.floor(index / trailRadix);
  }
  return result;
};


/**
 * Gets the name for a GLSL precompilation variable available at a given index.
 * @param {number} index The index of the variable to get a short name for.
 * @return {string} The short name at the index.
 */
glslunit.compiler.NameGenerator.getShortDef = function(index) {
  return '_' + glslunit.compiler.NameGenerator.getShortName(index) + '_';
};


/**
 * Gets the next available short name.
 * @param {string} name The name of the symbol to be shortened.
 * @return {string} The next available short name.
 */
glslunit.compiler.NameGenerator.prototype.shortenSymbol = function(name) {
  if (this.renameMap_[name]) {
    return this.renameMap_[name];
  }
  var nextName = null;
  while (!nextName || nextName in this.usedKeys_) {
    nextName =
        glslunit.compiler.NameGenerator.getShortName(this.nextNameIndex++);
  }
  this.usedKeys_[nextName] = true;
  this.renameMap_[name] = nextName;
  return nextName;
};


/**
 * Gets the shortened name if one exists for a symbol.
 * @param {string} name The name of the symbol to get the short name for.
 * @return {string} The shortened named for this symbol or.
 */
glslunit.compiler.NameGenerator.prototype.getShortSymbol = function(name) {
  return this.renameMap_[name] || name;
};


/**
 * Gets the index of the next name to be used.
 * @return {number} The index of the next variable name to use.
 */
glslunit.compiler.NameGenerator.prototype.getNextNameIndex = function() {
  return this.nextNameIndex;
};


/**
 * Gets the next available short name.
 * @return {string} The next available short name.
 */
glslunit.compiler.NameGenerator.prototype.clone = function() {
  var result = new glslunit.compiler.NameGenerator();
  result.renameMap_ = goog.object.clone(this.renameMap_);
  result.usedKeys_ = goog.object.clone(this.usedKeys_);
  result.nextNameIndex = this.nextNameIndex;
  return result;
};
