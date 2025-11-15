// Three.js Scene Setup and Initialization
// Global variables - shared across all modules
let scene, camera, renderer;
let arena, towers = [];
let units = [];
let particles = [];
let gltfLoader; // GLTFLoader for 3D models
let isRotating = true; // Camera rotation enabled by default
let mixer, clock;

// Initialize Three.js
function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xBDD8E8, 20, 150);
    
    // Camera setup - FIXED POV behind player (Blue team)
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    // Fixed camera position - centered elevated view
    camera.position.set(0.52, 31.68, 52.16);
    camera.lookAt(0.09, 5.72, 9.43); // Looking at center of arena
    
    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Initialize GLTFLoader
    gltfLoader = new THREE.GLTFLoader();
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    
    // Clock for animations
    clock = new THREE.Clock();
    
    // Lighting
    setupLighting();
    
    // Create arena
    createArena();
    
    // Create towers
    createTowers();
    
    // Add decorative elements
    addDecorations();
    
    // Remove loading text
    document.querySelector('.loading').style.display = 'none';
    
    // Show splash screen and start game
    showSplashScreen();
    
    // Start animation loop
    animate();
}

function setupLighting() {
    // Ambient light with neutral/blue sky tint
    const ambientLight = new THREE.AmbientLight(0x8090A0, 0.6);
    scene.add(ambientLight);
    
    // Main directional light (bright sun)
    const dirLight = new THREE.DirectionalLight(0xFFFFFF, 1.2);
    dirLight.position.set(25, 50, 25);
    dirLight.castShadow = true;
    dirLight.shadow.camera.left = -50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = -50;
    dirLight.shadow.mapSize.width = 4096;
    dirLight.shadow.mapSize.height = 4096;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);
    
    // Secondary light for softer shadows (sky light)
    const dirLight2 = new THREE.DirectionalLight(0x87CEEB, 0.4);
    dirLight2.position.set(-20, 30, -20);
    scene.add(dirLight2);
    
    // Point lights for tower glow with increased range
    const blueLight = new THREE.PointLight(0x4466ff, 3, 35);
    blueLight.position.set(-20, 10, 0);
    scene.add(blueLight);
    
    const redLight = new THREE.PointLight(0xff6644, 3, 35);
    redLight.position.set(20, 10, 0);
    scene.add(redLight);
    
    // Hemisphere light for sky/ground color
    const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x3D5A3D, 0.7);
    scene.add(hemiLight);
    
    // Add rim lighting for better definition
    const rimLight = new THREE.DirectionalLight(0xFFFFFF, 0.2);
    rimLight.position.set(0, 15, -30);
    scene.add(rimLight);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize when page loads
window.addEventListener('load', init);

