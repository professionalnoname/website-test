const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const fragmentShaderSource = `
precision mediump float;
uniform vec2 iResolution;
uniform float iTime;

vec2 hash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(mix(dot(hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
                   dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
               mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
                   dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 2.0;
    
    for (int i = 0; i < 5; i++) {
        value += amplitude * noise(p);
        p *= frequency;
        amplitude *= 0.5;
    }
    
    return value;
}

void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    uv.x *= iResolution.x / iResolution.y;

    vec2 direction = vec2(0.0, 1.0);
    vec2 warp = vec2(sin(iTime * 0.7) * 0.7, iTime * -1.1) * 0.5;
    float goo = fbm(uv * 3.0 + warp + direction * (iTime * 0.3));
    
    vec3 color1 = vec3(0.2, 0.0, 0.3);
    vec3 color2 = vec3(0.6, 0.2, 0.8);
    vec3 finalColor = mix(color1, color2, goo);

    gl_FragColor = vec4(finalColor, 1.0);
}

`;

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, `attribute vec4 position; void main() { gl_Position = position; }`);
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderSource);
gl.compileShader(fragmentShader);

if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    alert("Fragment Shader Error: " + gl.getShaderInfoLog(fragmentShader));
}

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

const vertices = new Float32Array([
    -1, -1, 1, -1, -1, 1,
    -1, 1, 1, -1, 1, 1
]);

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const position = gl.getAttribLocation(program, "position");
gl.enableVertexAttribArray(position);
gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

const timeUniform = gl.getUniformLocation(program, "iTime");
const resolutionUniform = gl.getUniformLocation(program, "iResolution");

function render(time) {
    gl.uniform1f(timeUniform, time * 0.001);
    gl.uniform2f(resolutionUniform, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
}
render(0);
