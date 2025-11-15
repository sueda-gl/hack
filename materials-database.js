// Materials Database
// Maps material names to 3D model files for semantic matching
// rotationOffset: Additional Y-axis rotation in radians to correct model orientation (optional)
//                 Use this if a model doesn't face the correct direction by default
//                 Positive = counter-clockwise, Negative = clockwise

const MATERIALS_DATABASE = [
    // Dinosaurs
    { name: "T-Rex", file: "models/T-Rex.glb", rotationOffset: 0 },
    { name: "Tyrannosaurus", file: "models/T-Rex.glb", rotationOffset: 0 },
    { name: "Velociraptor", file: "models/Velociraptor.glb", rotationOffset: 0 },
    { name: "Raptor", file: "models/Velociraptor.glb", rotationOffset: 0 },
    { name: "Triceratops", file: "models/Triceratops.glb", rotationOffset: 0 },
    { name: "Stegosaurus", file: "models/Stegosaurus.glb", rotationOffset: 0 },
    { name: "Apatosaurus", file: "models/Apatosaurus.glb", rotationOffset: 0 },
    { name: "Parasaurolophus", file: "models/Parasaurolophus.glb", rotationOffset: 0 },
    
    // Canines/Dogs
    { name: "Wolf", file: "models/Wolf.glb", rotationOffset: 0 },
    { name: "German Shepard", file: "models/German Shepard.glb", rotationOffset: 0 },
    { name: "Husky", file: "models/Husky.glb", rotationOffset: 0 },
    { name: "Shiba Inu", file: "models/Shiba Inu.glb", rotationOffset: 0 },
    { name: "Pug", file: "models/Characters Pug.glb", rotationOffset: 0 },
    { name: "Dog", file: "models/German Shepard.glb", rotationOffset: 0 },
    
    // Other Animals
    { name: "Fox", file: "models/Fox.glb", rotationOffset: 0 },
    { name: "Cat", file: "models/Cat.glb", rotationOffset: 0 },
    { name: "Feline", file: "models/Cat.glb", rotationOffset: 0 },
    
    // Objects
    { name: "Market Stalls", file: "models/Market Stalls Compact.glb", rotationOffset: 0 },
    { name: "Market", file: "models/Market Stalls Compact.glb", rotationOffset: 0 },
    { name: "Rock Path", file: "models/Rock Path Round Small.glb", rotationOffset: 0 },
    { name: "Stone", file: "models/Rock Path Round Small.glb", rotationOffset: 0 },
    { name: "Rock", file: "models/Rock Path Round Small.glb", rotationOffset: 0 },
    { name: "Trees", file: "models/Trees.glb", rotationOffset: 0 },
    { name: "Forest", file: "models/Trees.glb", rotationOffset: 0 },
    { name: "Tree", file: "models/Trees.glb", rotationOffset: 0 }
];

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MATERIALS_DATABASE;
}

