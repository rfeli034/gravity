// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;  // Enable shadow maps
renderer.setClearColor(0x000000);  // Set the background color to black
document.body.appendChild(renderer.domElement);

// Add orbit controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;
camera.position.set(10, 10, 10); // Set initial camera position
controls.update(); // Update controls with initial position

// Create the sun with emissive material and lighting
const starMass = 1.989e30;  // Mass of the sun in kilograms
const gravitationalConstant = 6.67430e-11;  // Gravitational constant in m^3 kg^-1 s^-2

const starGeometry = new THREE.SphereGeometry(1, 64, 64);
const starMaterial = new THREE.MeshStandardMaterial({ emissive: 0xffdf00, emissiveIntensity: 1 });
const star = new THREE.Mesh(starGeometry, starMaterial);
star.castShadow = true;
scene.add(star);

// Create sun's atmosphere
const sunAtmosphereGeometry = new THREE.SphereGeometry(1.2, 64, 64);
const sunAtmosphereMaterial = new THREE.MeshStandardMaterial({ color: 0xffdf00, transparent: true, opacity: 0.3 });
const sunAtmosphere = new THREE.Mesh(sunAtmosphereGeometry, sunAtmosphereMaterial);
scene.add(sunAtmosphere);

// Function to create realistic magnetic field lines
const magneticFieldLines = [];
function createMagneticFieldLines(object, radius) {
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffdf00 });
    const lineCount = 20;  // Number of lines
    const segments = 50;  // Number of segments per line

    for (let i = 0; i < lineCount; i++) {
        const points = [];
        const loopRadius = radius;  // Loop radius based on object size

        for (let j = 0; j <= segments; j++) {
            const t = j / segments;
            const phi = t * Math.PI;  // Varies from 0 to PI to form a loop
            const theta = (i / lineCount) * 2 * Math.PI;  // Spread around the object

            const r = loopRadius * Math.sin(phi);
            const y = loopRadius * Math.cos(phi);
            const x = r * Math.cos(theta);
            const z = r * Math.sin(theta);

            points.push(new THREE.Vector3(x, y, z));
        }

        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeometry, lineMaterial);
        magneticFieldLines.push(lineGeometry);
        object.add(line);
    }
}

createMagneticFieldLines(star, 1.5);

// Create a directional light to simulate the sun's light
const sunLight = new THREE.DirectionalLight(0xffdf00, 1.5);
sunLight.position.set(5, 5, 5);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
scene.add(sunLight);

// Create ambient light to soften shadows
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

// Create additional point lights to enhance lighting
const pointLight1 = new THREE.PointLight(0xffffff, 0.3);
pointLight1.position.set(10, 10, 10);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xffffff, 0.3);
pointLight2.position.set(-10, -10, -10);
scene.add(pointLight2);

// Arrays to store planets and asteroids
const planets = [];
const asteroids = [];

// Function to create a planet with magnetic field
function createPlanet(size, color, distance, speed, mass) {
    const planetGeometry = new THREE.SphereGeometry(size, 64, 64);
    const planetMaterial = new THREE.MeshStandardMaterial({ color: color, roughness: 0.7, metalness: 0.1 });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    planet.castShadow = true;
    planet.receiveShadow = true;

    planet.userData = {
        distance: distance,
        speed: speed,
        angle: 0,
        mass: mass
    };

    scene.add(planet);
    planets.push(planet);

    createMagneticFieldLines(planet, size * 2);
}

// Add three planets with different sizes, colors, distances, speeds, and masses
createPlanet(0.2, 0x3399ff, 3, 0.004, 5.972e24);  // Blue planet (Earth-like)
createPlanet(0.3, 0xff9933, 5, 0.00016, 6.39e23);  // Orange planet (Mars-like)
createPlanet(0.25, 0x99ff33, 7, 0.00012, 4.867e24); // Green planet (Venus-like)

// Create a finer asteroid belt that orbits the star system
function createAsteroidBelt() {
    const asteroidCount = 3000; // Increased number of asteroids
    const asteroidMaterial = new THREE.MeshStandardMaterial({ color: 0x505050, roughness: 0.8, metalness: 0.2 }); // Dark grey color

    function createAsteroid() {
        const size = Math.random() * 0.02 + 0.01; // Random size between 0.01 and 0.03
        const geometryType = Math.random();

        let asteroidGeometry;
        if (geometryType < 0.33) {
            asteroidGeometry = new THREE.SphereGeometry(size, 8, 8);
        } else if (geometryType < 0.66) {
            asteroidGeometry = new THREE.BoxGeometry(size, size, size);
        } else {
            asteroidGeometry = new THREE.DodecahedronGeometry(size, 0);
        }

        const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
        const angle = Math.random() * 2 * Math.PI;
        const distance = 8 + Math.random() * 2; // Distance outside the last planet
        asteroid.userData = { angle, distance }; // Store angle and distance for animation
        asteroid.position.set(
            distance * Math.cos(angle),
            distance * Math.sin(angle) * Math.sin(Math.PI / 4), // Tilted 45 degrees
            distance * Math.sin(angle) * Math.cos(Math.PI / 4)
        );
        asteroid.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        scene.add(asteroid);
        asteroids.push(asteroid);
    }

    for (let i = 0; i < asteroidCount; i++) {
        createAsteroid();
    }
}
createAsteroidBelt();

// Create background stars
function createStars() {
    const starGeometry = new THREE.SphereGeometry(0.05, 24, 24);
    const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (let i = 0; i < 1000; i++) {
        const star = new THREE.Mesh(starGeometry, starMaterial);
        star.position.set(
            Math.random() * 200 - 100,
            Math.random() * 200 - 100,
            Math.random() * 200 - 100
        );
        scene.add(star);
    }
}
createStars();

// Create space dust
function createSpaceDust() {
    const particles = new THREE.BufferGeometry();
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);
}
createSpaceDust();

// Information Display
const infoDiv = document.createElement('div');
infoDiv.style.position = 'absolute';
infoDiv.style.bottom = '10px';
infoDiv.style.left = '10px';
infoDiv.style.color = 'white';
infoDiv.style.padding = '10px';
infoDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
document.body.appendChild(infoDiv);

function updateInfo(object) {
    if (object === star) {
        infoDiv.innerHTML = 'Star: The Sun<br>Type: G-Type Main-Sequence Star';
    } else if (planets.some(p => p === object)) {
        infoDiv.innerHTML = `Planet: ${object.name || 'Unknown'}<br>Type: Terrestrial`;
    } else {
        infoDiv.innerHTML = '';
    }
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([star].concat(planets));

    if (intersects.length > 0) {
        focusedObject = intersects[0].object;
        updateInfo(intersects[0].object);
    } else {
        focusedObject = null;
        updateInfo(null);
    }
});

let focusedObject = null; // Define the focusedObject variable

// Function to update positions based on gravitational forces
function updatePositions() {
    for (let i = 0; i < planets.length; i++) {
        const planetA = planets[i];
        for (let j = i + 1; j < planets.length; j++) {
            const planetB = planets[j];

            const distanceVector = new THREE.Vector3().subVectors(planetB.position, planetA.position);
            const distance = distanceVector.length();
            const forceMagnitude = (gravitationalConstant * planetA.userData.mass * planetB.userData.mass) / (distance * distance);

            const forceVector = distanceVector.normalize().multiplyScalar(forceMagnitude);

            const accelerationA = forceVector.clone().divideScalar(planetA.userData.mass);
            const accelerationB = forceVector.clone().divideScalar(planetB.userData.mass).negate();

            planetA.userData.velocity.add(accelerationA);
            planetB.userData.velocity.add(accelerationB);
        }
    }

    planets.forEach(planet => {
        planet.position.add(planet.userData.velocity);
    });
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Update positions based on their speeds and gravitational interactions
    planets.forEach(planet => {
        planet.userData.angle += planet.userData.speed;
        planet.position.x = planet.userData.distance * Math.cos(planet.userData.angle);
        planet.position.z = planet.userData.distance * Math.sin(planet.userData.angle);
        planet.rotation.y += 0.01; // Rotate the planets for more realism
    });

    // Orbit the asteroids
    asteroids.forEach(asteroid => {
        asteroid.userData.angle += 0.001; // Adjust speed as needed
        const { angle, distance } = asteroid.userData;
        asteroid.position.set(
            distance * Math.cos(angle),
            distance * Math.sin(angle) * Math.sin(Math.PI / 4), // Maintain the 45 degree tilt
            distance * Math.sin(angle) * Math.cos(Math.PI / 4)
        );
    });

    // Animate magnetic field lines
    const time = Date.now() * 0.001; // Increase the multiplier to make the field move faster
    magneticFieldLines.forEach((lineGeometry, i) => {
        const positions = lineGeometry.attributes.position.array;
        for (let j = 0; j < positions.length / 3; j++) {
            const t = j / (positions.length / 3);
            const phi = t * Math.PI;  // Varies from 0 to PI to form a loop
            const theta = (i / magneticFieldLines.length) * 2 * Math.PI;  // Spread around the sun
            const r = 1.5 + 0.2 * Math.sin(theta * 2 + time + phi * 5);  // Adjusted to create a wavy effect

            positions[j * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[j * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[j * 3 + 2] = r * Math.cos(phi);
        }
        lineGeometry.attributes.position.needsUpdate = true;
    });

    // Update controls
    if (focusedObject) {
        const targetPosition = new THREE.Vector3();
        focusedObject.getWorldPosition(targetPosition);
        controls.target.copy(targetPosition);
    }
    controls.update();

    // Render the scene
    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
