
/**
 * @fileoverview Externs for node calls used by glslunit's compiler.
 * @author rowillia@google.com (Roy Williams)
 */

/**
 * @param {string} arg
 * @return {nodeObject}
 */
function require(arg) {}

/**
 * @return {Object}
 */
function process() {}

/**
 * @type {Array.<string>}
 */
process.argv;

/**
 * @return {Object}
 */
function console() {}

/**
 * @param {string} arg
 */
console.log = function(arg) {};

/**
 * @constructor
 * @private
 */
function nodeObject() {}

/**
 * @param {...string} arg
 * @return {string}
 */
nodeObject.prototype.join = function(arg) {};

/**
 * @param {string} arg
 * @return {string}
 */
nodeObject.prototype.basename = function(arg) {};

/**
 * @param {string} arg
 * @return {string}
 */
nodeObject.prototype.dirname = function(arg) {};

/**
 * @param {string} arg
 * @return {Array.<string>}
 */
nodeObject.prototype.readdirSync = function(arg) {};

/**
 * @param {string} arg
 * @return {string}
 */
nodeObject.prototype.extname = function(arg) {};

/**
 * @param {string} arg
 * @return {string}
 */
nodeObject.prototype.readFileSync = function(arg) {};

/**
 * @param {string} arg
 * @param {string} arg1
 * @param {string=} arg2
 * @return {string}
 */
nodeObject.prototype.writeFileSync = function(arg, arg1, arg2) {};
