function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

var canvas = document.querySelector('#screen');
canvas.height = screen.height - 200;
canvas.width = canvas.height;
console.log(window.height)
var gl = canvas.getContext("webgl");

var VBO = gl.createBuffer();

var vertices = [];
function createModel()
{
    var stepSize = Number(document.getElementById("stepSize").value);
    var l = Number(document.getElementById("l").value);
    var m = Number(document.getElementById("m").value);

    document.getElementById("lstepSize").innerHTML = stepSize;
    document.getElementById("ll").innerHTML = l;
    document.getElementById("lm").innerHTML = m;
    
    vertices = [];
    for(var theta = 0; theta <= Math.PI; theta += stepSize)
    {
        for(var phi = -Math.PI; phi <= Math.PI; phi += stepSize)
        {
            var length = Math.abs(Y(l, m, theta, phi));
    
            var x = length * Math.sin(theta) * Math.cos(phi);
            var y = length * Math.sin(theta) * Math.sin(phi);
            var z = length * Math.cos(theta);
    
            vertices.push(x);
            vertices.push(y);
            vertices.push(z);
        }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

gl.clearColor(0, 0, 0, 1);
gl.clear(gl.COLOR_BUFFER_BIT);

createModel();

var vertCode =
            'attribute vec3 coordinates;' + 
            'uniform mat4 uModelMatrix;' + 
            'uniform mat4 uModelViewMatrix;' + 
            'uniform mat4 uProjectionMatrix;' +
            'void main(void) {' + 
                ' gl_Position = uProjectionMatrix * uModelViewMatrix * uModelMatrix * vec4(coordinates, 1.0);' + 
                ' gl_PointSize = 1.0;' +
            '}';
            
var vertShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertShader, vertCode);
gl.compileShader(vertShader);

var fragCode = 
    'void main(void) {' + 'gl_FragColor = vec4(0.2, 0.9, 0.2, 1.0);' + '}';
var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragShader, fragCode);
gl.compileShader(fragShader);

var shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertShader); 
gl.attachShader(shaderProgram, fragShader);
gl.linkProgram(shaderProgram);

var modelMat = mat4.create()
mat4.rotate(modelMat, modelMat, Math.PI / 2, [1.0, 0.0, 0]);

var viewMat = mat4.create();
mat4.translate(viewMat, viewMat, [0.0, 0.0, -3.0]);

function drawScene()
{
    gl.clearColor(0, 0, 0, 1);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST); 
    gl.depthFunc(gl.LEQUAL)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const fov = 45 * Math.PI / 180;
    const aspect = canvas.width / canvas.height;
    const zNear = 0.1;
    const zFar = 100.0;

    const projMat = mat4.create();
    mat4.perspective(projMat, fov, aspect, zNear, zFar);

    mat4.rotate(viewMat, viewMat, 0.05, [0.0, 1.0, 0.0]);

    gl.useProgram(shaderProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, VBO);

    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uModelMatrix"), false, modelMat);
    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uModelViewMatrix"), false, viewMat);
    gl.uniformMatrix4fv(gl.getUniformLocation(shaderProgram, "uProjectionMatrix"), false, projMat);
    
    var coord = gl.getAttribLocation(shaderProgram, "coordinates");
    
    gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord);
    
    gl.viewport(0,0,canvas.width,canvas.height);
    gl.drawArrays(gl.POINTS, 0, vertices.length / 3);
}

var then = 0;

function render(now) {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;

    drawScene();

    requestAnimationFrame(render);
}
requestAnimationFrame(render);