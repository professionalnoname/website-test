const canvas = document.getElementById('shader-canvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    console.error('WebGL not supported, falling back on experimental-webgl');
    gl = canvas.getContext('experimental-webgl');
}

if (!gl) {
    alert('Your browser does not support WebGL');
}

const vertexShaderSource = `
attribute vec2 a_position;
void main() {
    gl_Position = vec4(a_position, 0, 1);
}
`;

const fragmentShaderSource = `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    vec3 color = 0.5 + 0.5 * cos(u_time + uv.xyx + vec3(0, 2, 4));
    gl_FragColor = vec4(color, 1.0);
}
`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
const positions = [-1, -1, 1, -1, -1, 1, 1, 1];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
const timeUniformLocation = gl.getUniformLocation(program, 'u_time');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let time = 0;
function render() {
    time += 0.01;
    gl.uniform1f(timeUniformLocation, time);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
}

render();
