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
    // Scene setup with darker, stormy atmosphere
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a25);
    scene.fog = new THREE.Fog(0x2a2a35, 30, 120);
    
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
    // Reduced ambient light with cool, dark tone
    const ambientLight = new THREE.AmbientLight(0x404055, 0.3);
    scene.add(ambientLight);
    
    // Dimmed main directional light for dramatic shadows
    const dirLight = new THREE.DirectionalLight(0xc0c0d0, 0.6);
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
    
    // Subtle cool secondary light
    const dirLight2 = new THREE.DirectionalLight(0x4a4a60, 0.2);
    dirLight2.position.set(-20, 30, -20);
    scene.add(dirLight2);
    
    // Enhanced dramatic tower point lights
    const blueLight = new THREE.PointLight(0x3355ff, 5, 40);
    blueLight.position.set(-20, 10, 0);
    scene.add(blueLight);
    
    const redLight = new THREE.PointLight(0xff3333, 5, 40);
    redLight.position.set(20, 10, 0);
    scene.add(redLight);
    
    // Dark hemisphere light for stormy atmosphere
    const hemiLight = new THREE.HemisphereLight(0x3a3a50, 0x1a1a20, 0.4);
    scene.add(hemiLight);
    
    // Subtle ominous rim lighting from below
    const rimLight = new THREE.DirectionalLight(0x6a5a70, 0.15);
    rimLight.position.set(0, -10, -30);
    scene.add(rimLight);
    
    // Store lights for lightning effects
    scene.userData.mainLight = dirLight;
    scene.userData.ambientLight = ambientLight;
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize when page loads
window.addEventListener('load', init);

