# Introduction #

This compiler is built to work best with the Closure Compiler, especially with ADVANCED\_OPTIMIZATIONS turned on.

You'll find an example in the [examples/compiler](https://code.google.com/p/glsl-unit/source/browse/#git%2Fexample%2Fcompiler) directory.  This example utilizes code from the the WebGL framework [J3D](https://github.com/drojdjou/J3D/)

# Preprocessor directives #

At the top of Phong.glsl, you'll find a bit of header code for the preprocessor.  This code is used to specify the name of the class we're generating as well as to include any library functions.

## Headers ##
```
//! NAMESPACE=J3D
//! CLASS=PhongShader
//! INCLUDE CommonInclude.glsllib
//! INCLUDE VertexInclude.glsllib
//! INCLUDE Lights.glsllib
//! JSREQUIRE J3D.Constants
//! JSCONST POINTSIZE J3D.Constants.PointSize
```

```
//! NAMESPACE=<Namespace>
```

The namespace of the generated class.

```
//! CLASS=<Classname>
```

The name of the class to be generated.

```
//! SUPERCLASS=<Super Classname>
```

The name of the super class to be generated.  This field is optional and would have to taken advantage of by the template.

```
//! INCLUDE <Filename>
```

INCLUDE will splat the code contained in the .glsllib file into this file.  The optimization steps will then take care of removing any functions in this file but not used by the shader.  By default, the compiler will only look in the same directory as the input glsl file for library files.  To specify additional directories to look in, specify the `--glsl_include_prefix` flag.

NOTE:  This doesn't support any sort of smart ordering yet.  If you have file A include B which includes A, it will crash the compiler.

```
//! JSREQUIRE <Classname>
```

JSREQUIRE will add a goog.require() statement to the top of the generated file with the class name specified.  This is used mostly in conjunction with JSCONST

```
//! JSCONST <Define Name> <Javascript Snippet>
```

JSCONST allows developers to specify constants in JavaScript and use them from GLSL.  Each shader will have

```
'#define <Define Name> ' + <Javascript Snippet> + '\n';
```

Added to the top of it.  This is highly useful when sharing constants between GLSL and JavaScript without having to duplicate them.

## Sections ##

Throughout the compiler code, you'll find a few section headers.

`//! COMMON`, `//! VERTEX`, and `//! FRAGMENT`.  These are used to change what code goes where between the two shaders.

```
//! COMMON
```
Code in the common section will go into both the vertex shader and the fragment shader.  The default mode for a file is Common.

```
//! VERTEX
```
Code in the Vertex section will only go into the vertex shader.

```
//! FRAGMENT
```
Code in the Fragment section will only go into the fragment shader.

## Inheritance ##

The shader compiler provides the beginnings of support for inheritance.  It supports the ability to override functions specified in libraries.

```
//! OVERRIDE <Original Name> <New Name>
```

This will override the definition of <Original Name> with <New Name> in all previous instances of the code, including libraries.  OVERRIDE should only be used from the .glsl file, and not library files.

For example:

```
//! OVERRIDE luminance baseLuminance 
float luminance(vec3 c) {
  return baseLuminance(c) * 1.1;
}
```

# Templated Output #

The compiler supports a templated output using [mustache](http://mustache.github.com/) templates.

After all of the optimizations are performed, the
[ShaderProgram](http://code.google.com/p/glsl-unit/source/browse/compiler/shader_program.js) is fed into the mustache templating engine using the template specified with the `--template` flag.

You can find the default template [here](http://code.google.com/p/glsl-unit/source/browse/compiler/shader.mustache)