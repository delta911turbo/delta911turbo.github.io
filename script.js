(function() {
    'use strict';

    // WebGL initialization
    const canvas = document.getElementById('glCanvas');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        console.error('Unable to initialize WebGL. Your browser may not support it.');
        return;
    }

    // Load GLTFLoader script from CDN
    const loaderScript = document.createElement('script');
    loaderScript.src = 'https://cdn.jsdelivr.net/npm/three@0.135.0/examples/js/loaders/GLTFLoader.js';
    document.head.appendChild(loaderScript);

    loaderScript.onload = () => {
        // Load 3D model
        const modelPath = './3dmodels/HoleHead.glb';

        async function loadModel(path) {
            try {
                const response = await fetch(path);
                if (!response.ok) {
                    throw new Error('Failed to load model');
                }
                const buffer = await response.arrayBuffer();
                const loader = new THREE.GLTFLoader();
                return new Promise((resolve, reject) => {
                    loader.parse(buffer, '', (gltf) => {
                        resolve(gltf);
                    }, (error) => {
                        reject(error);
                    });
                });
            } catch (error) {
                console.error('Error loading model:', error);
                return null;
            }
        }

        // Render loop
        function render() {
            // WebGL rendering code
        }

        // Start rendering
        render();
    };
})();
