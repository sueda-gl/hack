// Arena, Towers, and Decorations Builder
// Depends on: scene-setup.js (scene, towers global variables)

function createArena() {
    // Create larger arena platform
    const platformGeometry = new THREE.BoxGeometry(50, 2, 30);
    const platformMaterial = new THREE.MeshPhongMaterial({
        color: 0x5a6670,
        emissive: 0x2a3035,
        emissiveIntensity: 0.05,
        roughness: 0.7,
        metalness: 0.1
    });
    arena = new THREE.Mesh(platformGeometry, platformMaterial);
    arena.position.y = -11;
    arena.receiveShadow = true;
    scene.add(arena);
    
    // Add grass areas on the platform
    const grassTopGeometry = new THREE.PlaneGeometry(50, 30);
    const grassTopMaterial = new THREE.MeshPhongMaterial({
        color: 0x4d7c4d,
        emissive: 0x2d4c2d,
        emissiveIntensity: 0.02,
        roughness: 0.9
    });
    const grassTop = new THREE.Mesh(grassTopGeometry, grassTopMaterial);
    grassTop.rotation.x = -Math.PI / 2;
    grassTop.position.y = -9.99;
    grassTop.receiveShadow = true;
    scene.add(grassTop);
    
    // Stone pathway in the middle (longer for increased distance)
    const pathGeometry = new THREE.BoxGeometry(12, 0.1, 30);
    const pathMaterial = new THREE.MeshPhongMaterial({
        color: 0x8b8680,
        roughness: 0.9,
        metalness: 0.1
    });
    const path = new THREE.Mesh(pathGeometry, pathMaterial);
    path.position.set(0, -9.95, 0);
    path.receiveShadow = true;
    scene.add(path);
    
    // Wooden bridge
    const bridgeGeometry = new THREE.BoxGeometry(10, 0.5, 8);
    const bridgeMaterial = new THREE.MeshPhongMaterial({
        color: 0x8b6914,
        emissive: 0x5c4610,
        emissiveIntensity: 0.03,
        roughness: 0.8
    });
    const bridge = new THREE.Mesh(bridgeGeometry, bridgeMaterial);
    bridge.position.set(0, -9.5, 0);
    bridge.receiveShadow = true;
    bridge.castShadow = true;
    scene.add(bridge);
    
    // Bridge railings with wood texture
    const railGeometry = new THREE.BoxGeometry(10, 1.2, 0.3);
    const railMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x6b5030,
        roughness: 0.9 
    });
    
    const rail1 = new THREE.Mesh(railGeometry, railMaterial);
    rail1.position.set(0, -8.5, 4);
    rail1.castShadow = true;
    scene.add(rail1);
    
    const rail2 = new THREE.Mesh(railGeometry, railMaterial);
    rail2.position.set(0, -8.5, -4);
    rail2.castShadow = true;
    scene.add(rail2);
    
    // Add decorative bridge posts
    const postGeometry = new THREE.CylinderGeometry(0.15, 0.15, 2);
    const postMaterial = new THREE.MeshPhongMaterial({ color: 0x5c4030 });
    for (let i = -4; i <= 4; i += 2) {
        const post1 = new THREE.Mesh(postGeometry, postMaterial);
        post1.position.set(i, -8.5, 4);
        post1.castShadow = true;
        scene.add(post1);
        
        const post2 = new THREE.Mesh(postGeometry, postMaterial);
        post2.position.set(i, -8.5, -4);
        post2.castShadow = true;
        scene.add(post2);
    }
    
    // River with clearer water
    const waterGeometry = new THREE.PlaneGeometry(50, 30);
    const waterMaterial = new THREE.MeshPhongMaterial({
        color: 0x006FA0,
        transparent: true,
        opacity: 0.75,
        emissive: 0x003050,
        emissiveIntensity: 0.1,
        roughness: 0.2,
        metalness: 0.9
    });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -12.5;
    water.userData = { material: waterMaterial };
    scene.add(water);
    
    // Add lily pads
    const lilyPadGeometry = new THREE.CircleGeometry(0.5, 6);
    const lilyPadMaterial = new THREE.MeshPhongMaterial({
        color: 0x2d5a2d,
        side: THREE.DoubleSide
    });
    
    for (let i = 0; i < 8; i++) {
        const lilyPad = new THREE.Mesh(lilyPadGeometry, lilyPadMaterial);
        lilyPad.rotation.x = -Math.PI / 2;
        lilyPad.position.set(
            (Math.random() - 0.5) * 30,
            -12.4,
            (Math.random() - 0.5) * 20
        );
        lilyPad.rotation.z = Math.random() * Math.PI;
        scene.add(lilyPad);
    }
    
    // Add clouds
    addClouds();
}

function addClouds() {
    // Create realistic clouds
    function createCloud(x, y, z) {
        const cloud = new THREE.Group();
        const cloudMaterial = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.9,
            emissive: 0xFFFFFF,
            emissiveIntensity: 0.1
        });
        
        // Create cloud with multiple spheres
        const positions = [
            [0, 0, 0, 2],
            [1.5, 0.2, 0, 1.8],
            [-1.5, 0, 0.5, 1.6],
            [0.8, -0.3, -0.8, 1.4],
            [-0.8, 0.3, 0.8, 1.5],
            [2.2, 0, -0.5, 1.2],
            [-2.2, 0.1, 0, 1.3]
        ];
        
        positions.forEach(pos => {
            const geometry = new THREE.SphereGeometry(pos[3], 8, 6);
            const sphere = new THREE.Mesh(geometry, cloudMaterial);
            sphere.position.set(pos[0], pos[1], pos[2]);
            sphere.castShadow = false;
            sphere.receiveShadow = false;
            cloud.add(sphere);
        });
        
        cloud.position.set(x, y, z);
        cloud.scale.set(1 + Math.random() * 0.5, 0.8 + Math.random() * 0.4, 1 + Math.random() * 0.5);
        cloud.userData = { 
            speed: 0.01 + Math.random() * 0.02,
            startX: x
        };
        
        return cloud;
    }
    
    // Add multiple clouds at different heights
    const clouds = [];
    for (let i = 0; i < 8; i++) {
        const cloud = createCloud(
            (Math.random() - 0.5) * 80,
            25 + Math.random() * 15,
            (Math.random() - 0.5) * 60
        );
        scene.add(cloud);
        clouds.push(cloud);
    }
    
    // Store clouds for animation
    scene.userData.clouds = clouds;
}

function createTowers() {
    // Enhanced tower creation function
    function createTower(x, z, color, team) {
        const group = new THREE.Group();
        
        // Stone tower base with texture
        const baseGeometry = new THREE.CylinderGeometry(2.5, 3, 4, 12);
        const baseMaterial = new THREE.MeshPhongMaterial({
            color: 0x8b8680,
            emissive: 0x333333,
            emissiveIntensity: 0.05,
            roughness: 0.95,
            metalness: 0
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 2;
        base.castShadow = true;
        base.receiveShadow = true;
        group.add(base);
        
        // Add stone brick pattern
        for (let i = 0; i < 4; i++) {
            const brickGeometry = new THREE.BoxGeometry(0.3, 0.8, 3.5);
            const brick = new THREE.Mesh(brickGeometry, baseMaterial);
            brick.position.set(
                Math.cos((i / 4) * Math.PI * 2) * 2.5,
                2 + (i % 2) * 0.5,
                Math.sin((i / 4) * Math.PI * 2) * 2.5
            );
            brick.rotation.y = (i / 4) * Math.PI * 2;
            brick.castShadow = true;
            group.add(brick);
        }
        
        // Tower main body with gradient
        const towerGeometry = new THREE.CylinderGeometry(2, 2.5, 7, 8);
        const towerMaterial = new THREE.MeshPhongMaterial({
            color: new THREE.Color(color).lerp(new THREE.Color(0x666666), 0.3),
            emissive: color,
            emissiveIntensity: 0.15,
            roughness: 0.7,
            metalness: 0.1
        });
        const tower = new THREE.Mesh(towerGeometry, towerMaterial);
        tower.position.y = 6;
        tower.castShadow = true;
        tower.receiveShadow = true;
        group.add(tower);
        
        // Battlements
        for (let i = 0; i < 8; i++) {
            const battlementGeometry = new THREE.BoxGeometry(0.5, 1, 0.8);
            const battlement = new THREE.Mesh(battlementGeometry, towerMaterial);
            battlement.position.set(
                Math.cos((i / 8) * Math.PI * 2) * 2,
                10,
                Math.sin((i / 8) * Math.PI * 2) * 2
            );
            battlement.castShadow = true;
            group.add(battlement);
        }
        
        // Magical roof with team color
        const roofGeometry = new THREE.ConeGeometry(2.8, 3.5, 8);
        const roofMaterial = new THREE.MeshPhongMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.25,
            roughness: 0.5,
            metalness: 0.3
        });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 11.5;
        roof.castShadow = true;
        group.add(roof);
        
        // Magical crystal on top
        const crystalGeometry = new THREE.OctahedronGeometry(0.6);
        const crystalMaterial = new THREE.MeshPhongMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 1,
            transparent: true,
            opacity: 0.9,
            roughness: 0,
            metalness: 0.5
        });
        const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
        crystal.position.y = 14;
        group.add(crystal);
        
        // Inner glow effect
        const glowGeometry = new THREE.SphereGeometry(1);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.3
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.y = 14;
        group.add(glow);
        
        // Add magical particles around tower
        const particleRingGeometry = new THREE.TorusGeometry(3, 0.1, 3, 20);
        const particleRingMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.2
        });
        const particleRing = new THREE.Mesh(particleRingGeometry, particleRingMaterial);
        particleRing.position.y = 8;
        particleRing.rotation.x = Math.PI / 2;
        group.add(particleRing);
        
        // Tower flag
        const flagPoleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 4);
        const flagPoleMaterial = new THREE.MeshPhongMaterial({ color: 0x4a3c28 });
        const flagPole = new THREE.Mesh(flagPoleGeometry, flagPoleMaterial);
        flagPole.position.set(0, 15, 0);
        group.add(flagPole);
        
        const flagGeometry = new THREE.PlaneGeometry(1.5, 1);
        const flagMaterial = new THREE.MeshPhongMaterial({
            color: color,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });
        const flag = new THREE.Mesh(flagGeometry, flagMaterial);
        flag.position.set(0.75, 16, 0);
        group.add(flag);
        
        group.position.set(x, -10, z);
        group.userData = { team, crystal, glow, particleRing, flag };
        
        return group;
    }
    
    // Create blue team towers with increased spacing
    const blueTower1 = createTower(-20, 8, 0x4444ff, 'blue');
    scene.add(blueTower1);
    towers.push(blueTower1);
    
    const blueTower2 = createTower(-20, -8, 0x4444ff, 'blue');
    scene.add(blueTower2);
    towers.push(blueTower2);
    
    const blueKing = createTower(-22, 0, 0x6666ff, 'blue');
    blueKing.scale.set(1.3, 1.3, 1.3);
    scene.add(blueKing);
    towers.push(blueKing);
    
    // Create red team towers with increased spacing
    const redTower1 = createTower(20, 8, 0xff4444, 'red');
    scene.add(redTower1);
    towers.push(redTower1);
    
    const redTower2 = createTower(20, -8, 0xff4444, 'red');
    scene.add(redTower2);
    towers.push(redTower2);
    
    const redKing = createTower(22, 0, 0xff6666, 'red');
    redKing.scale.set(1.3, 1.3, 1.3);
    scene.add(redKing);
    towers.push(redKing);
}

function addDecorations() {
    // Create different tree types
    function createTree(x, y, z, type = 'pine') {
        const group = new THREE.Group();
        
        // Tree trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 2);
        const trunkMaterial = new THREE.MeshPhongMaterial({
            color: 0x4a3c28,
            roughness: 0.9
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1;
        trunk.castShadow = true;
        group.add(trunk);
        
        if (type === 'pine') {
            // Pine tree layers
            for (let i = 0; i < 3; i++) {
                const coneGeometry = new THREE.ConeGeometry(1.5 - i * 0.3, 2, 8);
                const coneMaterial = new THREE.MeshPhongMaterial({
                    color: new THREE.Color().setHSL(0.3, 0.7, 0.3 + i * 0.05),
                    roughness: 0.8
                });
                const cone = new THREE.Mesh(coneGeometry, coneMaterial);
                cone.position.y = 2.5 + i * 1.2;
                cone.castShadow = true;
                cone.receiveShadow = true;
                group.add(cone);
            }
        } else if (type === 'oak') {
            // Oak tree crown
            const crownGeometry = new THREE.SphereGeometry(2, 8, 6);
            const crownMaterial = new THREE.MeshPhongMaterial({
                color: 0x2d5a2d,
                roughness: 0.9
            });
            const crown = new THREE.Mesh(crownGeometry, crownMaterial);
            crown.position.y = 3.5;
            crown.scale.y = 0.8;
            crown.castShadow = true;
            crown.receiveShadow = true;
            group.add(crown);
            
            // Add variation with smaller spheres
            for (let i = 0; i < 3; i++) {
                const smallCrown = new THREE.Mesh(
                    new THREE.SphereGeometry(0.8, 6, 5),
                    crownMaterial
                );
                smallCrown.position.set(
                    Math.cos(i * 2.1) * 1.5,
                    3.5 + Math.sin(i * 1.5) * 0.5,
                    Math.sin(i * 2.1) * 1.5
                );
                smallCrown.castShadow = true;
                group.add(smallCrown);
            }
        } else if (type === 'willow') {
            // Willow tree
            const crownGeometry = new THREE.SphereGeometry(2.5, 8, 6);
            const crownMaterial = new THREE.MeshPhongMaterial({
                color: 0x4d7c4d,
                transparent: true,
                opacity: 0.9,
                roughness: 0.9
            });
            const crown = new THREE.Mesh(crownGeometry, crownMaterial);
            crown.position.y = 4;
            crown.scale.y = 1.2;
            crown.castShadow = true;
            group.add(crown);
        }
        
        group.position.set(x, y, z);
        group.scale.set(0.8 + Math.random() * 0.4, 0.9 + Math.random() * 0.2, 0.8 + Math.random() * 0.4);
        group.rotation.y = Math.random() * Math.PI * 2;
        return group;
    }
    
    // Create bushes
    function createBush(x, y, z) {
        const group = new THREE.Group();
        const bushMaterial = new THREE.MeshPhongMaterial({
            color: new THREE.Color().setHSL(0.3, 0.6, 0.35),
            roughness: 0.9
        });
        
        for (let i = 0; i < 3; i++) {
            const bushGeometry = new THREE.SphereGeometry(0.6 + Math.random() * 0.3, 6, 5);
            const bush = new THREE.Mesh(bushGeometry, bushMaterial);
            bush.position.set(
                Math.random() * 0.8 - 0.4,
                0.5,
                Math.random() * 0.8 - 0.4
            );
            bush.castShadow = true;
            group.add(bush);
        }
        
        group.position.set(x, y, z);
        return group;
    }
    
    // Create flowers
    function createFlower(x, y, z, color) {
        const group = new THREE.Group();
        
        // Stem
        const stemGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.5);
        const stemMaterial = new THREE.MeshPhongMaterial({ color: 0x2d5a2d });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = 0.25;
        group.add(stem);
        
        // Flower petals
        const petalGeometry = new THREE.CircleGeometry(0.15, 6);
        const petalMaterial = new THREE.MeshPhongMaterial({ 
            color: color,
            emissive: color,
            emissiveIntensity: 0.2,
            side: THREE.DoubleSide 
        });
        
        for (let i = 0; i < 5; i++) {
            const petal = new THREE.Mesh(petalGeometry, petalMaterial);
            petal.position.set(
                Math.cos((i / 5) * Math.PI * 2) * 0.1,
                0.5,
                Math.sin((i / 5) * Math.PI * 2) * 0.1
            );
            petal.lookAt(new THREE.Vector3(0, 0.5, 0));
            group.add(petal);
        }
        
        // Center
        const centerGeometry = new THREE.SphereGeometry(0.05);
        const centerMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 0.3
        });
        const center = new THREE.Mesh(centerGeometry, centerMaterial);
        center.position.y = 0.5;
        group.add(center);
        
        group.position.set(x, y, z);
        group.scale.set(1.5, 1.5, 1.5);
        return group;
    }
    
    // Add multiple tree types around the expanded arena
    const treePositions = [
        // Behind blue towers
        [-25, -10, 10, 'pine'], [-25, -10, -10, 'pine'], [-27, -10, 0, 'oak'],
        [-23, -10, 13, 'willow'], [-23, -10, -13, 'willow'],
        // Behind red towers  
        [25, -10, 10, 'pine'], [25, -10, -10, 'pine'], [27, -10, 0, 'oak'],
        [23, -10, 13, 'willow'], [23, -10, -13, 'willow'],
        // Sides
        [-15, -10, 15, 'oak'], [15, -10, 15, 'oak'],
        [-15, -10, -15, 'oak'], [15, -10, -15, 'oak'],
        // Scattered pines
        [-18, -10, 14, 'pine'], [18, -10, 14, 'pine'],
        [-18, -10, -14, 'pine'], [18, -10, -14, 'pine'],
        [-10, -10, 13, 'pine'], [10, -10, 13, 'pine'],
        [-10, -10, -13, 'pine'], [10, -10, -13, 'pine']
    ];
    
    treePositions.forEach(pos => {
        const tree = createTree(pos[0], pos[1], pos[2], pos[3]);
        scene.add(tree);
    });
    
    // Add bushes
    for (let i = 0; i < 25; i++) {
        const angle = (i / 25) * Math.PI * 2;
        const radius = 20 + Math.random() * 5;
        const bush = createBush(
            Math.cos(angle) * radius,
            -10,
            Math.sin(angle) * radius
        );
        scene.add(bush);
    }
    
    // Add flower patches
    const flowerColors = [0xff69b4, 0xffa500, 0xff0000, 0xffff00, 0x9370db];
    for (let i = 0; i < 40; i++) {
        const x = (Math.random() - 0.5) * 45;
        const z = (Math.random() - 0.5) * 28;
        // Only place flowers away from the path
        if (Math.abs(x) > 7 || Math.abs(z) > 10) {
            const flower = createFlower(
                x, -10, z,
                flowerColors[Math.floor(Math.random() * flowerColors.length)]
            );
            scene.add(flower);
        }
    }
    
    // Add rocks
    const rockGeometry = new THREE.DodecahedronGeometry(0.5);
    const rockMaterial = new THREE.MeshPhongMaterial({
        color: 0x696969,
        roughness: 0.9,
        flatShading: true
    });
    
    for (let i = 0; i < 10; i++) {
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        rock.position.set(
            (Math.random() - 0.5) * 35,
            -9.8,
            (Math.random() - 0.5) * 25
        );
        rock.scale.set(
            0.5 + Math.random(),
            0.5 + Math.random() * 0.5,
            0.5 + Math.random()
        );
        rock.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        rock.castShadow = true;
        scene.add(rock);
    }
}

