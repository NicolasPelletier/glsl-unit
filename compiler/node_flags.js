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
 * @fileoverview Minimal flags implementation needed for the shader compiler.
 *     This should only be used with Node.js code.
 * @author rowillia@google.com (Roy Williams)
 */

goog.provide('goog.node.FLAGS');
goog.provide('goog.node.commandLineFlag');


/**
 * The type of command line flag.
 * @enum {string}
 */
goog.node.flagType = {
  STRING: 'string',
  STRING_ARRAY: 'string_array',
  BOOLEAN: 'boolean'
};


/**
 * Object for storing an instance of a command line flag.
 * @param {string} name The name of this flag.
 * @param {goog.node.flagType} type The type of this flag.
 * @param {*} defaultValue The default value to return if the flag has not
 *     yet been set.
 * @param {string} description The description of this flag.
 * @constructor
 */
goog.node.commandLineFlag = function(name, type, defaultValue, description) {
  /**
   * The name of this flag.
   * @type {string}
   */
  this.name = name;

  /**
   * The type of this flag.
   * @type {goog.node.flagType}
   */
  this.type = type;

  /**
   * The default value of this flag.
   * @type {*}
   */
  this.defaultValue = defaultValue;

  /**
   * The description of this flag.
   * @type {string}
   */
  this.description = description;

  /**
   * The value set from the command line of this flag.
   * @type {Object|undefined}
   */
  this.value = undefined;
};


/**
 * Returns the current value for a command line flag.
 * @return {*} The value of the flag.
 */
goog.node.commandLineFlag.prototype.isRequired = function() {
  return !goog.isDef(this.defaultValue);
};


/**
 * Returns the current value for a command line flag.
 * @return {*} The value of the flag.
 */
goog.node.commandLineFlag.prototype.getValue = function() {
  if (goog.isDef(this.value)) {
    return this.value;
  }
  return this.defaultValue;
};

/**
 * Sets the current value for this flag.
 * @return {*} The value of the flag.
 */
goog.node.commandLineFlag.prototype.parseValue = function(value) {
  this.value = value;
};


/**
 * Object for storing an instance of a command line flag that stores array
 * values.
 * @param {string} name The name of this flag.
 * @param {goog.node.flagType} type The type of this flag.
 * @param {Array<*>} defaultValue The default value to return if the flag has
 *     not yet been set.
 * @param {string} description The description of this flag.
 * @constructor
 */
goog.node.arrayCommandLineFlag = function(name, type, 
                                          defaultValue, description) {
  goog.base(this, name, type, defaultValue, description);

  /**
   * The value set from the command line of this flag.
   * @type {Array.<Object>|undefined}
   * @override
   */
  this.value = [];                              
}
goog.inherits(goog.node.arrayCommandLineFlag,
              goog.node.commandLineFlag);

/**
 * Sets the current value for this flag.
 * @return {*} The value of the flag.
 */
goog.node.arrayCommandLineFlag.prototype.parseValue = function(value) {
  if (value.search(',') != -1) {
    Array.prototype.push.apply(this.value, value.split(','));
  } else {
    this.value.push(value);
  }
};

/**
 * Object for declaring and retrieving flag values.
 * @constructor
 */
goog.node.FLAGS = function() {
};


/**
 * Map of flag names to their flag values.
 * @type {!Object.<string, goog.node.commandLineFlag>}
 * @private
 */
goog.node.FLAGS.definedFlags_ = {};


/**
 * Defines a new string flag
 * @param {string} name The name of this flag.
 * @param {string|undefined} defaultValue The default value to return if the
 *     flag has not yet been set.
 * @param {string} description The description of this flag.
 */
goog.node.FLAGS.define_string = function(name, defaultValue, description) {
  var newFlag = new goog.node.commandLineFlag(name, goog.node.flagType.STRING,
                                              defaultValue, description);
  goog.node.FLAGS.definedFlags_[name] = newFlag;
  goog.node.FLAGS.__defineGetter__(name, function() {
    return String(newFlag.getValue());
  });
};


/**
 * Defines a new string flag
 * @param {string} name The name of this flag.
 * @param {string|undefined} defaultValue The default value to return if the
 *     flag has not yet been set.
 * @param {string} description The description of this flag.
 */
goog.node.FLAGS.define_string_array = function(name, defaultValue, 
                                               description) {
  var newFlag = new goog.node.arrayCommandLineFlag(name, 
      goog.node.flagType.STRING_ARRAY, defaultValue, description);
  goog.node.FLAGS.definedFlags_[name] = newFlag;
  goog.node.FLAGS.__defineGetter__(name, function() {
    return newFlag.getValue().map(String);
  });
};


/**
 * Defines a new bool flag
 * @param {string} name The name of this flag.
 * @param {boolean|undefined} defaultValue The default value to return if the
 *     flag has not yet been set.
 * @param {string} description The description of this flag.
 */
goog.node.FLAGS.define_bool = function(name, defaultValue, description) {
  var newFlag = new goog.node.commandLineFlag(name, goog.node.flagType.BOOLEAN,
                                              defaultValue, description);
  goog.node.FLAGS.definedFlags_[name] = newFlag;
  goog.node.FLAGS.__defineGetter__(name, function() {
    var flagValue = newFlag.getValue();
    return Boolean(/^[tT]rue$/.test(flagValue));
  });
};


/**
 * Using the node runtime, parses out any command line arguments into their flag
 *     values.  Should be called after all flags are declared and before they
 *     are used.
 */
goog.node.FLAGS.parseArgs = function() {
  var lastParam = null;
  process.argv.forEach(function(value, index, array) {
    // First two arguments are 'node' and the module name.
    if (index <= 1) {
      return;
    }
    if (value == '--help') {
        goog.node.FLAGS.printHelp();
        process.exit(0);
    }
    var splitParam = value.split('=');
    var flag, flagValue;
    var valueIsFlag = value.slice(0, 2) == '--';
    if (valueIsFlag && splitParam.length > 1) {
      flag = splitParam[0];
      flagValue = splitParam.slice(1).join('=');
    } else {
      if (lastParam) {
        if (lastParam.slice(0, 2) == '--' && valueIsFlag) {
          var boolFlag = goog.node.FLAGS.parseBoolean_(lastParam);
          flag = boolFlag.flag;
          flagValue = boolFlag.flagValue;
          lastParam = value;
        } else {
          flag = lastParam;
          flagValue = value;
        }
      } else {
        lastParam = value;
      }
    }
    // If this is the last parameter being parsed, and we haven't set a flag,
    // attempt to parse the last parameter as a boolean flag.
    if (index == array.length - 1 && lastParam && !flag) {
      var boolFlag = goog.node.FLAGS.parseBoolean_(lastParam);
      flag = boolFlag.flag;
      flagValue = boolFlag.flagValue;   
    }
    if (flag && flagValue) {
      flag = flag.slice(2);
      if (flag in goog.node.FLAGS.definedFlags_) {
        goog.node.FLAGS.definedFlags_[flag].parseValue(flagValue);
        lastParam = null;
      } else {
        console.error('Unknown flag ' + flag);
        goog.node.FLAGS.printHelp();
        process.exit(1);
      }  
    }
  });
  for (var flagName in goog.node.FLAGS.definedFlags_) {
    var flag = goog.node.FLAGS.definedFlags_[flagName];
    if (flag.isRequired() && !goog.isDef(flag.value)) {
      console.error('Flag ' + flagName + ' is required but not provided.\n');
        goog.node.FLAGS.printHelp();
        process.exit(1);
    }
  }
};


/**
 * Parses a boolean flag.
 * @param {string} value The content of the flag.
 * @return {{flag:string,flagValue:string}} The flag name and the flag value.
 * @private
 */
goog.node.FLAGS.parseBoolean_ = function(value) {
  var flag = value.slice(2);
  var flagValue = 'true';
  if (flag.slice(0, 2) == 'no') {
    flag = flag.slice(2);
    flagValue = 'false';
  }
  return {
    flag: '--' + flag,
    flagValue: flagValue
  };
}


/**
 * Outputs the help string to stdout.
 */
goog.node.FLAGS.printHelp = function() {
  var helpString = 'Flags:\n';
  for (var flagName in goog.node.FLAGS.definedFlags_) {
    var flag = goog.node.FLAGS.definedFlags_[flagName];
    helpString += '  --' + flag.name + ': ' + flag.description;
    if (!flag.isRequired()) {
      helpString += '\n    (default: \'' + flag.defaultValue + '\')\n';
    } else {
      helpString += '\n    (required)\n';
    }
  }
  process.stdout.write(helpString + '\n');
  process.stdout.flush();
};
