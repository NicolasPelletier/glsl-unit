# Introduction #

WebGL introduces a new language, GLSL, to the previous triumvirate of JS, HTML, and CSS.  Just like the previous 3, developers need to minimize GLSL in order to reduce their payload size protect their IP.  The GLSL Compiler is a minifying compiler that allows you to simply replace your existing shader code with the minified shader code.

In practice, The GLSL Compiler reduces the size of shader code by 50%-60%.  [Shader Toy](http://www.iquilezles.org/apps/shadertoy/) Is a great repository of shaders to test out.  One thing to note is that a lot of these shaders were written to fit in a small amount of code, so they tend to use one letter variable and function names.  Even with this, however, we'll still see atleast a 30% reduction in code size.


# Installation and Usage #

To install the GLSL compiler, use npm to install glsl-unit.

```
npm install glsl-unit -g
```

On OSX, you may need to run

```
sudo npm install glsl-unit -g
```

Then, invoke the GLSL Compiler.

```
glsl-compiler --input=<Source file> 
```

This will output the vertex and fragment shader source to standard out.  See CompilerPreprocessor for more information on the input format.

# Optimizations #

The GLSL Compiler will perform a series of safe transformations on the GLSL code, resulting in glsl code that acts as a drop in replacement the original code.

## Comments/Whitespace/Number Formatting ##
We remove all comments and whitespace where possible.  We also format all numbers in the smallest possible format, using Hex or Exponential notation where it would be shorter.

```
/* Lots Of
   Comments
*/
void main() {
  // Insightful Comment.
  gl_FragColor=vec4(100000);
}
```

Becomes

```
void main(){gl_FragColor=vec4(1e5);}
```

## Dead Function Removal ##

We remove any functions which aren't in the call graph of the global scope or by the main function.

```
void foo() {unusedChild();}
void unusedChild() {}
vec4 globalFunction() {}
vec4 gValue = globalFunction();
void bar(){}
void main() {
  bar();
  gl_FragColor=vec4(1e5);
}
```

Becomes

```
vec4 globalFunction(){}
vec4 gValue=globalFunction();
void bar(){}
void main(){
  bar();
  gl_FragColor=vec4(1e5);
}
```

## Variable/Function Renaming ##

All variables that aren't input values (uniforms and attributes) are renamed to minified names.  Varyings will be renamed to the same value across the vertex and fragment shader to preserve functionality.

```
//Taken from ShaderToy
uniform vec2 resolution;
uniform float time;
uniform sampler2D tex0;

void setColor(vec2 coord, bool isHole) {
  if (isHole)
    gl_FragColor = vec4(texture2D(tex0, coord).xyz, 1.0);
  else
    gl_FragColor = vec4(coord.x, 0.5, coord.y, 1.0);
}
void main() {
  vec2 coord = vec2(1, 2);
  gl_FragColor = setColor(coord, false);
}
```

Becomes

```
uniform vec2 resolution;
uniform float time;
uniform sampler2D tex0;
void c(vec2 a,bool b) {
  if(b)
    gl_FragColor=vec4(texture2D(tex0,a).xyz,1.);
  else 
    gl_FragColor=vec4(a.x,.5,a.y,1.);
}
void main() {
  vec2 a=vec2(1,2);
  gl_FragColor=c(a,false);
}
```

## Declaration Consolidation ##
All declarations of the same type within a scope get consolidated to the same line.

```
uniform float time;
uniform vec2 resolution;
uniform vec4 mouse;
uniform sampler2D tex0;
uniform sampler2D tex1;

void main(void)
{
    vec2 p = -1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;
    vec2 m = -1.0 + 2.0 * mouse.xy / resolution.xy;

    float a1 = atan(p.y-m.y,p.x-m.x);
    float r1 = sqrt(dot(p-m,p-m));
    float a2 = atan(p.y+m.y,p.x+m.x);
    float r2 = sqrt(dot(p+m,p+m));

    vec2 uv;
    uv.x = 0.2*time + (r1-r2)*0.25;
    uv.y = sin(2.0*(a1-a2));

    float w = r1*r2*0.8;
    vec3 col = texture2D(tex0,uv).xyz;

    gl_FragColor = vec4(col/(.1+w),1.0);
}
```

Becomes

```
uniform float time;
uniform vec2 resolution;
uniform vec4 mouse;
uniform sampler2D tex0,tex1;

void main(void)
{
    vec2 p,m;,uv
    p = -1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;
    m = -1.0 + 2.0 * mouse.xy / resolution.xy;

    float a1,r1,a2,r2,w
    a1 = atan(p.y-m.y,p.x-m.x);
    r1 = sqrt(dot(p-m,p-m));
    a2 = atan(p.y+m.y,p.x+m.x);
    r2 = sqrt(dot(p+m,p+m));

    uv.x = 0.2*time + (r1-r2)*0.25;
    uv.y = sin(2.0*(a1-a2));

    w = r1*r2*0.8;
    vec3 col = texture2D(tex0,uv).xyz;

    gl_FragColor = vec4(col/(.1+w),1.0);
}
```

## Combined Optimizations ##

Putting it all together, we get something like this from a [ShaderToy](http://www.iquilezles.org/apps/shadertoy/?p=sierpinski) example:

```

#ifdef GL_ES
precision highp float;
#endif

uniform vec2 resolution;
uniform float time;
uniform sampler2D tex0;

// Set color at the current fragment, with given coords
// and whether it should be "hole" or not.
void setColor(vec2 coord, bool isHole) {
	if (isHole)
		gl_FragColor = vec4(texture2D(tex0, coord).xyz, 1.0);
	else
		gl_FragColor = vec4(coord.x, 0.5, coord.y, 1.0);
}

// Sierpinski carpet - with anti-holes!
// Maybe call it "Sierpinski tablecloth". If it doesn't already have a name.
void main(void)
{
	ivec2 sectors;
	vec2 coordOrig = gl_FragCoord.xy / resolution.xy;
	const int lim = 5;
	// Toggle between "carpet" and "tablecloth" every 3 seconds.
	bool doInverseHoles = (mod(time, 6.0) < 3.0);
	
	/* If you want it to spin, just to prove that it is redrawing
	the carpet every frame: */
	vec2 center = vec2(0.5, 0.5);
	mat2 rotation = mat2(
        vec2( cos(time), sin(time)),
        vec2(-sin(time), cos(time))
    );
    vec2 coordRot = rotation * (coordOrig - center) + center;
	// rotation can put us out of bounds
	if (coordRot.x < 0.0 || coordRot.x > 1.0 ||
		coordRot.y < 0.0 || coordRot.y > 1.0) {
		setColor(coordOrig, true);
		return;
	}

	vec2 coordIter = coordRot;
	bool isHole = false;
	
	for (int i=0; i < lim; i++) {
		sectors = ivec2(floor(coordIter.xy * 3.0));
		if (sectors.x == 1 && sectors.y == 1) {
			if (doInverseHoles) {
				isHole = !isHole;
			} else {
				setColor(coordOrig, true);
				return;
			}
		}

		if (i + 1 < lim) {
			// map current sector to whole carpet
			coordIter.xy = coordIter.xy * 3.0 - vec2(sectors.xy);
		}
	}
	
	setColor(isHole ? coordOrig : coordRot, isHole);
}

```

Becomes

```
#ifdef GL_ES
precision highp float;
#endif
uniform vec2 resolution;uniform float time;uniform sampler2D tex0;void k(vec2 a,bool b){if(b)gl_FragColor=vec4(texture2D(tex0,a).xyz,1.);else gl_FragColor=vec4(a.x,.5,a.y,1.);}void main(){ivec2 a;vec2 b,c,d,e;b=gl_FragCoord.xy/resolution.xy;const int f=5;bool g,h;g=mod(time,6.)<3.;c=vec2(.5,.5);mat2 i=mat2(vec2(cos(time),sin(time)),vec2(-sin(time),cos(time)));d=i*(b-c)+c;if(d.x<0.||d.x>1.||d.y<0.||d.y>1.){k(b,true);return;}e=d;h=false;for(int j=0;j<f;j++){a=ivec2(floor(e.xy*3.));if(a.x==1&&a.y==1){if(g){h=!h;}else {k(b,true);return;}}if(j+1<f){e.xy=e.xy*3.-vec2(a.xy);}}k(h?b:d,h);}
```

Go ahead, paste it back into Shader Toy and you'll get the same example!

In this case, we've reduced the size of the fragment shader from 1.6kb to 0.6kb, a savings of 61% and the shader code works exactly the same as it did before.