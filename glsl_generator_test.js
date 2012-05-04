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
 * @fileoverview Test cases for the GLSL Generator.
 * @author rowillia@google.com (Roy Williams)
 */

goog.require('glslunit.Generator');


/**
 * Constructor for GlslGeneratorTest
 * @constructor
 */
function GlslGeneratorTest() {
}
registerTestSuite(GlslGeneratorTest);



/**
 * Test case testVisitIdentifier
 */
GlslGeneratorTest.prototype.testVisitIdentifier = function() {
  var identifierNode = {
    type: 'identifier',
    name: 'oh_hai'
  };
  expectEq('oh_hai', glslunit.Generator.getSourceCode(identifierNode));
};

/**
 * Test case testVisitBinary
 */
GlslGeneratorTest.prototype.testVisitBinary = function() {
  var leftNode = {
    type: 'identifier',
    name: 'x'
  };
  var rightNode = {
    type: 'identifier',
    name: 'y'
  };
  var testNode = {
    type: 'binary',
    operator: {
      type: 'operator',
      operator: '*'
    },
    left: leftNode,
    right: rightNode
  };
  expectEq('x*y', glslunit.Generator.getSourceCode(testNode));
};

/**
 * Test case testVisitTernary
 */
GlslGeneratorTest.prototype.testVisitTernary = function() {
  var trueNode = {
    type: 'identifier',
    name: 'x'
  };
  var falseNode = {
    type: 'identifier',
    name: 'y'
  };
  var testNode = {
    type: 'ternary',
    condition: {
      type: 'bool',
      value: false
    },
    is_true: trueNode,
    is_false: falseNode
  };
  expectEq('false?x:y', glslunit.Generator.getSourceCode(testNode));
};

/**
 * Test case testTernaryChild
 */
GlslGeneratorTest.prototype.testTernaryChild = function() {
  var testNode = {
    type: 'binary',
    operator: {
      type: 'operator',
      operator: '*'
    },
    left: {
      type: 'float',
      value: 1
    },
    right: {
      type: 'ternary',
      condition: {
        type: 'bool',
        value: 'false'
      },
      is_true: {
        type: 'float',
        value: 1
      },
      is_false: {
        type: 'float',
        value: 0
      }
    }
  };
  expectEq('1.*(false?1.:0.)', glslunit.Generator.getSourceCode(testNode));
};

/**
 * Test case testVisitBinaryWithParen
 */
GlslGeneratorTest.prototype.testVisitBinaryWithParen = function() {
  var leftNode = {
    type: 'binary',
    operator: {
      type: 'operator',
      operator: '/'
    },
    left: {
      type: 'identifier',
      name: 'x'
    },
    right: {
      type: 'binary',
      operator: {
        type: 'operator',
        operator: '*'
      },
      left: {
        type: 'identifier',
        name: 'z'
      },
      right: {
        type: 'binary',
        operator: {
          type: 'operator',
          operator: '*'
        },
        left: {
          type: 'identifier',
          name: 'u'
        },
        right: {
          type: 'function_call',
          function_name: 'test',
          parameters: []
        }
      }
    }
  };
  var rightNode = {
    type: 'binary',
    operator: {
      type: 'operator',
      operator: '-'
    },
    left: {
      type: 'identifier',
      name: 'a'
    },
    right: {
      type: 'binary',
      operator: {
        type: 'operator',
        operator: '-'
      },
      left: {
        type: 'identifier',
        name: 'b'
      },
      right: {
        type: 'identifier',
        name: 'c'
      }
    }
  };
  var testNode = {
    type: 'binary',
    operator: {
      type: 'operator',
      operator: '*'
    },
    left: leftNode,
    right: rightNode
  };
  expectEq('x/(z*u*test())*(a-(b-c))',
      glslunit.Generator.getSourceCode(testNode));
};

/**
 * Test case testVisitValue
 */
GlslGeneratorTest.prototype.testVisitValue = function() {
  var testNode = {
    type: 'int',
    value: 256
  };
  expectEq('256', glslunit.Generator.getSourceCode(testNode));
  var testNode = {
    type: 'int',
    value: 1099511627775
  };
  expectEq('0xffffffffff', glslunit.Generator.getSourceCode(testNode));
  var testNode = {
    type: 'int',
    value: -1099511627775
  };
  expectEq('-0xffffffffff', glslunit.Generator.getSourceCode(testNode));
  testNode = {
    type: 'bool',
    value: true
  };
  expectEq('true', glslunit.Generator.getSourceCode(testNode));
  testNode = {
    type: 'float',
    value: 1e-23
  };
  expectEq('1e-23', glslunit.Generator.getSourceCode(testNode));
  testNode = {
    type: 'float',
    value: 42
  };
  expectEq('42.', glslunit.Generator.getSourceCode(testNode));
  testNode = {
    type: 'float',
    value: 0.42
  };
  expectEq('.42', glslunit.Generator.getSourceCode(testNode));
  testNode = {
    type: 'float',
    value: 0.000001
  };
  expectEq('1e-6', glslunit.Generator.getSourceCode(testNode));
  testNode = {
    type: 'float',
    value: -0.00000523
  };
  expectEq('-5.23e-6', glslunit.Generator.getSourceCode(testNode));
  testNode = {
    type: 'float',
    value: 10000
  };
  expectEq('1e4', glslunit.Generator.getSourceCode(testNode));
  testNode = {
    type: 'float',
    value: 1000
  };
  expectEq('1e3', glslunit.Generator.getSourceCode(testNode));
  testNode = {
    type: 'float',
    value: 320000
  };
  expectEq('3.2e5', glslunit.Generator.getSourceCode(testNode));
};

/**
 * Test case testFunctionCall
 */
GlslGeneratorTest.prototype.testFunctionCall = function() {
  var testNode = {
    type: 'function_call',
    function_name: 'test',
    parameters: []
  };
  expectEq('test()', glslunit.Generator.getSourceCode(testNode));
  testParameter = {
      type: 'identifier',
      name: 'a'
  };
  testNode.parameters = [testParameter, testParameter, testParameter];
  expectEq('test(a,a,a)', glslunit.Generator.getSourceCode(testNode));
};

/**
 * Test case testPostfix
 */
GlslGeneratorTest.prototype.testPostfix = function() {
  var testNode = {
    type: 'postfix',
    operator: {
      type: 'accessor',
      index: {
         type: 'int',
         value: 42
      }
    },
    expression: {
      type: 'identifier',
      name: 'x'
    }
  };
  expectEq('x[42]', glslunit.Generator.getSourceCode(testNode));
  testNode.operator = {
    type: 'field_selector',
    selection: 'rgba'
  };
  expectEq('x.rgba', glslunit.Generator.getSourceCode(testNode));
  testNode.operator = {
    type: 'operator',
    operator: '++'
  };
  expectEq('x++', glslunit.Generator.getSourceCode(testNode));
};

/**
 * Test case testUnary
 */
GlslGeneratorTest.prototype.testUnary = function() {
  var testNode = {
    type: 'unary',
    expression: {
      type: 'identifier',
      name: 'x'
    },
    operator: {
      type: 'operator',
      operator: '-'
    }
  };
  expectEq('-x', glslunit.Generator.getSourceCode(testNode));

  var binaryNode = {
    type: 'binary',
    operator: {
      type: 'operator',
      operator: '-'
    },
    left: {
      type: 'identifier',
      name: 'y'
    },
    right: testNode
  };
  expectEq('y- -x', glslunit.Generator.getSourceCode(binaryNode));
};

/**
 * Test case testJump
 */
GlslGeneratorTest.prototype.testJump = function() {
  var testNode = {
    type: 'return',
    value: {
      type: 'identifier',
      name: 'to_sender'
    }
  };
  expectEq('return to_sender;', glslunit.Generator.getSourceCode(testNode));
  delete testNode.value;
  expectEq('return;', glslunit.Generator.getSourceCode(testNode));
  testNode.type = 'continue';
  expectEq('continue;', glslunit.Generator.getSourceCode(testNode));
  testNode.type = 'break';
  expectEq('break;', glslunit.Generator.getSourceCode(testNode));
  testNode.type = 'discard';
  expectEq('discard;', glslunit.Generator.getSourceCode(testNode));
};

/**
 * Test case testExpression
 */
GlslGeneratorTest.prototype.testExpression = function() {
  var testNode = {
    type: 'expression',
    expression: {
      type: 'binary',
      operator: {
        type: 'operator',
        operator: '-='
      },
      left: {
        type: 'identifier',
        name: 'x'
      },
      right: {
        type: 'int',
        value: 12
      }
    }
  };
  expectEq('x-=12;', glslunit.Generator.getSourceCode(testNode));
};

/**
 * Test case testType
 */
GlslGeneratorTest.prototype.testType = function() {
  var testNode = {
    type: 'type',
    name: 'vec4'
  };
  expectEq('vec4', glslunit.Generator.getSourceCode(testNode));
  testNode.qualifier = 'invariant varying';
  expectEq('invariant varying vec4',
      glslunit.Generator.getSourceCode(testNode));
  testNode.precision = 'highp';
  expectEq('invariant varying highp vec4',
      glslunit.Generator.getSourceCode(testNode));
};

/**
 * Test case testDeclarator
 */
GlslGeneratorTest.prototype.testDeclarator = function() {
  var testNode = {
    type: 'declarator',
    typeAttribute: {
      type: 'type',
      name: 'int'
    },
    declarators: [
      {
         type: 'declarator_item',
         name: {
            type: 'identifier',
            name: 'foo'
         },
         isArray: true
      }
   ]
  };
  expectEq('int foo[];', glslunit.Generator.getSourceCode(testNode));
  testNode.declarators[0].arraySize = {
      type: 'int',
      value: 1
   };
   testNode.declarators = testNode.declarators.concat({
       type: 'declarator_item',
       name: {
          type: 'identifier',
          name: 'bar'
       },
       initializer: {
          type: 'int',
          value: 12
       }
     });
  expectEq('int foo[1],bar=12;', glslunit.Generator.getSourceCode(testNode));
};

/**
 * Test case testIfStatement
 */
GlslGeneratorTest.prototype.testIfStatement = function() {
  var testNode = {
    type: 'if_statement',
    condition: {
      type: 'bool',
      value: true
    },
    body: {
      type: 'return',
      value: {
        type: 'bool',
        value: false
      }
    }
  };
  expectEq('if(true)return false;',
      glslunit.Generator.getSourceCode(testNode));
  var bodyStatements = [testNode.body].concat({
     type: 'expression',
     expression: {
      type: 'binary',
      operator: {
        type: 'operator',
        operator: '-='
      },
      left: {
        type: 'identifier',
        name: 'x'
      },
      right: {
        type: 'int',
        value: 12
      }
    }
  });
  testNode.body = {
    type: 'scope',
    statements: bodyStatements
  };
  expectEq('if(true){return false;x-=12;}',
      glslunit.Generator.getSourceCode(testNode));
  var oldBody = testNode.body;
  testNode.body = {
    type: 'scope',
    statements: []
  };
  testNode.elseBody = oldBody;
  expectEq('if(true){}else{return false;x-=12;}',
      glslunit.Generator.getSourceCode(testNode));
  testNode.elseBody = oldBody.statements[0];
  expectEq('if(true){}else return false;',
      glslunit.Generator.getSourceCode(testNode));
};

/**
 * Test case testForLoop
 */
GlslGeneratorTest.prototype.testForLoop = function() {
  var testNode = {
    type: 'for_statement',
    initializer: {
       type: 'declarator',
       typeAttribute: {
          type: 'type',
          name: 'int'
       },
       declarators: [
          {
             type: 'declarator_item',
             name: {
                type: 'identifier',
                name: 'i'
             },
             initializer: {
                type: 'int',
                value: 0
             }
          }
       ]
    },
    condition: {
      type: 'binary',
       operator: {
         type: 'operator',
         operator: '<'
       },
      left: {
         type: 'identifier',
        name: 'i'
      },
      right: {
         type: 'int',
         value: 23
      }
    },
    increment: {
      type: 'postfix',
      operator: {
        type: 'operator',
        operator: '++'
      },
      expression: {
         type: 'identifier',
         name: 'i'
      }
    },
    body: {
      type: 'scope',
      statements: []
    }
  };
  expectEq('for(int i=0;i<23;i++){}',
      glslunit.Generator.getSourceCode(testNode));
  testNode.body = {
    type: 'return',
    value: {
       type: 'bool',
       value: false
    }
  };
  expectEq('for(int i=0;i<23;i++)return false;',
      glslunit.Generator.getSourceCode(testNode));
  testNode.body = {
    type: 'scope',
    statements: [testNode.body, testNode.body]
  };
  expectEq('for(int i=0;i<23;i++){return false;return false;}',
      glslunit.Generator.getSourceCode(testNode));
};

/**
 * Test case testWhile
 */
GlslGeneratorTest.prototype.testWhile = function() {
  var testNode = {
    type: 'while_statement',
    condition: {
      type: 'binary',
      operator: {
        type: 'operator',
        operator: '<'
      },
      left: {
         type: 'identifier',
         name: 'i'
      },
      right: {
         type: 'int',
         value: 23
      }
    },
    body: {
      type: 'scope',
      statements: []
    }
  };
  expectEq('while(i<23){}', glslunit.Generator.getSourceCode(testNode));
};

/**
 * Test case testDo
 */
GlslGeneratorTest.prototype.testDo = function() {
  var testNode = {
    type: 'do_statement',
    condition: {
      type: 'binary',
      operator: {
        type: 'operator',
        operator: '<'
      },
      left: {
        type: 'identifier',
        name: 'i'
      },
      right: {
        type: 'int',
        value: 23
      }
    },
    body: {
      type: 'scope',
      statements: []
    }
  };
  expectEq('do{}while(i<23)', glslunit.Generator.getSourceCode(testNode));
  testNode.body = {
    type: 'return',
    value: {
       type: 'bool',
       value: false
    }
  };
  expectEq('do return false;while(i<23)',
      glslunit.Generator.getSourceCode(testNode));
};

/**
 * Test case testPreprocessor
 */
GlslGeneratorTest.prototype.testPreprocessor = function() {
  var testNode = {
          type: 'preprocessor',
          directive: '#define',
          identifier: 'FOO',
          token_string: 'a + b - 1.0',
          parameters: [
            {
              type: 'identifier',
              name: 'a'
            },
            {
              type: 'identifier',
              name: 'b'
            }
          ]
        };
        expectEq('#define FOO(a,b) a + b - 1.0\n',
            glslunit.Generator.getSourceCode(testNode));
  testNode = {
    type: 'preprocessor',
    directive: '#ifdef',
    value: 'FOO'
  };
  expectEq('#ifdef FOO\n', glslunit.Generator.getSourceCode(testNode));
  testNode.guarded_statements = [{
    type: 'return',
    value: {
       type: 'bool',
       value: false
    }
  }];
  expectEq('#ifdef FOO\nreturn false;\n#endif\n',
      glslunit.Generator.getSourceCode(testNode));
  testNode.elseBody = {
      type: 'preprocessor',
      directive: '#else',
      guarded_statements: testNode.guarded_statements
    };
  expectEq('#ifdef FOO\\nreturn false;\\n' +
           '#else\\nreturn false;\\n#endif\\n',
      glslunit.Generator.getSourceCode(testNode, '\\n'));
};

/**
 * Test case testFunction
 */
GlslGeneratorTest.prototype.testFunction = function() {
  var testNode = {
      type: 'function_prototype',
      name: 'foo',
      returnType: {
        type: 'type',
        name: 'int',
        precision: 'highp'
      },
      parameters: [
         {
            type: 'parameter',
            type_name: 'int',
            name: 'x',
            typeQualifier: 'const',
            parameterQualifier: 'in',
            precision: 'highp',
            arraySize: {
               type: 'int',
               value: 4
            }
         },
         {
            type: 'parameter',
            type_name: 'int',
            name: 'y'
         }
      ]
  };
  expectEq('highp int foo(const in highp int x[4],int y);',
      glslunit.Generator.getSourceCode(testNode));
  testNode.type = 'function_declaration';
  delete testNode.returnType.precision;
  testNode.body = {
    type: 'scope',
    statements: []
  };
  expectEq('int foo(const in highp int x[4],int y){}',
      glslunit.Generator.getSourceCode(testNode));
  testNode.body.statements = [
    {
      type: 'return',
      value: {
        type: 'bool',
        value: false
      }
    },
    {
       type: 'expression',
       expression: {
         type: 'postfix',
         operator: {
           type: 'operator',
           operator: '++'
         },
         expression: {
            type: 'identifier',
            name: 'i'
         }
       }
    }
  ];
  expectEq('int foo(const in highp int x[4],int y){return false;i++;}',
      glslunit.Generator.getSourceCode(testNode));
};

/**
 * Test case testInvariant
 */
GlslGeneratorTest.prototype.testInvariant = function() {
  var testNode = {
    type: 'invariant',
    identifiers: [
       {
          type: 'identifier',
          name: 'foo'
       },
       {
          type: 'identifier',
          name: 'bar'
       }
    ]
  };
  expectEq('invariant foo,bar;', glslunit.Generator.getSourceCode(testNode));
};

/**
 * Test case testPrecision
 */
GlslGeneratorTest.prototype.testPrecision = function() {
  var testNode = {
    type: 'precision',
    precision: 'highp',
    typeName: 'float'
  };
  expectEq('precision highp float;',
      glslunit.Generator.getSourceCode(testNode));
};

/**
 * Test case testStructDefinition
 */
GlslGeneratorTest.prototype.testStructDefinition = function() {
  var testNode = {
      type: 'struct_definition',
      members: [
         {
            type: 'declarator',
            typeAttribute: {
               type: 'type',
               name: 'int'
            },
            declarators: [
              {
                  type: 'declarator_item',
                  name: {
                    type: 'identifier',
                    name: 'x'
                  }
               }
            ]
         },
         {
            type: 'declarator',
            typeAttribute: {
               type: 'type',
               name: 'int'
            },
            declarators: [
               {
                  type: 'declarator_item',
                  name: {
                    type: 'identifier',
                    name: 'y'
                  }
               }
            ]
         }
      ],
      name: 'testStruct',
      qualifier: 'attribute',
      declarators: [
         {
            type: 'declarator_item',
            name: {
              type: 'identifier',
              name: 'z'
            }
         }
      ]
   };
   expectEq('attribute struct testStruct{int x;int y;}z;',
       glslunit.Generator.getSourceCode(testNode));
   delete testNode.name;
   delete testNode.qualifier;
   delete testNode.declarators;
   expectEq('struct{int x;int y;};',
       glslunit.Generator.getSourceCode(testNode));
};
