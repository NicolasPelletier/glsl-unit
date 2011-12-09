// Copyright 2011 Google Inc. All Rights Reserved.

/**
 * @fileoverview Description of this file.
 * @author rowillia@google.com (Roy Williams)
 */
GLSLCompilerController = function($xhr) {
  this.vertexSource = 'void main(){}';
  this.fragmentSource = 'void main(){}';

  this.compiledVertexSource = '';
  this.compiledFragmentSource = '';

  this.newLength = 0;
  this.originalLength = 0;
  this.percentSaved = 0;
};

GLSLCompilerController.prototype.compile = function() {
  var compiler = new glslunit.compiler.DemoCompiler(this.vertexSource,
                                                    this.fragmentSource);
  var result = compiler.compileProgram();
  this.compiledVertexSource =
    glslunit.Generator.getSourceCode(result.vertexAst);
  this.compiledFragmentSource =
    glslunit.Generator.getSourceCode(result.fragmentAst);
  this.originalLength  = this.vertexSource.length + this.fragmentSource.length;
  this.newLength = this.compiledVertexSource.length +
      this.compiledFragmentSource.length;
  this.percentSaved = Math.round((this.originalLength - this.newLength)*100/
                                 this.originalLength);
}

