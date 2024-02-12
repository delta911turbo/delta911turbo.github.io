// WebGL initialization
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    alert('Unable to initialize WebGL. Your browser may not support it.');
}

// Load GLTFLoader script from CDN
const loaderScript = document.createElement('script');
loaderScript.src = 'https://cdn.jsdelivr.net/npm/three@0.135.0/examples/js/loaders/GLTFLoader.js';
document.head.appendChild(loaderScript);

loaderScript.onload = () => {
    // Shader sources
    const vertexShaderSource = `
        attribute vec4 aVertexPosition;
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;

        void main() {
            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        }
    `;

    const fragmentShaderSource = `
        void main() {
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // White color
        }
    `;

    // Load 3D model
    const modelPath = '3dmodels/HeadHole.glb';

    function loadModel(path) {
        return new Promise((resolve, reject) => {
            fetch(path)
                .then(response => response.arrayBuffer())
                .then(buffer => {
                    const loader = new THREE.GLTFLoader();
                    loader.parse(buffer, '', (gltf) => {
                        resolve(gltf);
                    });
                })
                .catch(error => reject(error));
        });
    }

    // Render loop
    function render() {
        // Clear canvas
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Set up perspective
        const fov = 45 * Math.PI / 180;
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;
        const projectionMatrix = mat4.create();

        mat4.perspective(projectionMatrix, fov, aspect, zNear, zFar);

        // Set up model view matrix
        const modelViewMatrix = mat4.create();

        mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -6.0]);

        // Rotate model
        const now = Date.now();
        const rotation = (now / 1000) * Math.PI; // Rotate 180 degrees per second
        mat4.rotate(modelViewMatrix, modelViewMatrix, rotation, [0, 1, 0]);

        // Pass data to shaders
        const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

        const program = createProgram(gl, vertexShader, fragmentShader);

        const positionAttributeLocation = gl.getAttribLocation(program, 'aVertexPosition');

        const modelViewMatrixLocation = gl.getUniformLocation(program, 'uModelViewMatrix');
        const projectionMatrixLocation = gl.getUniformLocation(program, 'uProjectionMatrix');

        gl.useProgram(program);

        gl.enableVertexAttribArray(positionAttributeLocation);

        const model = await loadModel(modelPath);

        model.scene.traverse(function(child) {
            if (child.isMesh) {
                const positionBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(child.geometry.attributes.position.array), gl.STATIC_DRAW);
                gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(positionAttributeLocation);

                gl.uniformMatrix4fv(modelViewMatrixLocation, false, modelViewMatrix);
                gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);

                gl.drawArrays(gl.TRIANGLES, 0, child.geometry.attributes.position.array.length / 3);
            }
        });

        // Request next frame
        requestAnimationFrame(render);
    }

    // Start rendering
    render();

    // Helper functions
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

    function createProgram(gl, vertexShader, fragmentShader) {
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
            return null;
        }

        return program;
    }
};
