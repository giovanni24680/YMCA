import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

export function initAmbientScene(selector = "[data-ambient-scene]") {
    const container = document.querySelector(selector);
    if (!container || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return null;
    }

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.className = "ambient-canvas";
    renderer.domElement.style.opacity = "1";
    container.prepend(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0.6, 9);

    const group = new THREE.Group();
    scene.add(group);

    const particleCount = 4200;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const palette = [
        new THREE.Color("#c2753a"),
        new THREE.Color("#daa840"),
        new THREE.Color("#e08a6a"),
        new THREE.Color("#7e9476"),
        new THREE.Color("#f5ece0")
    ];

    for (let i = 0; i < particleCount; i++) {
        const s = i * 3;
        const r = 0.8 + Math.pow(Math.random(), 0.5) * 3.0;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const col = palette[Math.floor(Math.random() * palette.length)];

        positions[s] = r * Math.sin(phi) * Math.cos(theta);
        positions[s + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.65;
        positions[s + 2] = r * Math.cos(phi);

        colors[s] = col.r;
        colors[s + 1] = col.g;
        colors[s + 2] = col.b;

        sizes[i] = 0.015 + Math.random() * 0.07;
    }

    const particleGeom = new THREE.BufferGeometry();
    particleGeom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    particleGeom.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const particles = new THREE.Points(
        particleGeom,
        new THREE.PointsMaterial({
            size: 0.045,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.72,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        })
    );
    group.add(particles);

    const orbGeom = new THREE.IcosahedronGeometry(1.6, 3);
    const orbMat = new THREE.MeshStandardMaterial({
        color: "#faf5ee",
        emissive: "#c2753a",
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.18,
        flatShading: true,
        wireframe: false,
        roughness: 0.4,
        metalness: 0.1
    });
    const orb = new THREE.Mesh(orbGeom, orbMat);
    group.add(orb);

    const glowGeom = new THREE.SphereGeometry(2.2, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
        color: "#daa840",
        transparent: true,
        opacity: 0.06,
        side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeom, glowMat);
    group.add(glow);

    /* Ribbon ring — torusKnot orbiting the cloud */
    const ribbonGeom = new THREE.TorusKnotGeometry(2.6, 0.04, 180, 8, 2, 3);
    const ribbonMat = new THREE.MeshStandardMaterial({
        color: "#c2753a",
        emissive: "#daa840",
        emissiveIntensity: 0.45,
        transparent: true,
        opacity: 0.28,
        roughness: 0.3,
        metalness: 0.6,
        wireframe: false
    });
    const ribbon = new THREE.Mesh(ribbonGeom, ribbonMat);
    ribbon.rotation.x = Math.PI * 0.35;
    group.add(ribbon);

    /* Inner accent ring */
    const ringGeom = new THREE.TorusGeometry(1.9, 0.015, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
        color: "#e08a6a",
        transparent: true,
        opacity: 0.22
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = Math.PI * 0.5;
    group.add(ring);

    scene.add(new THREE.AmbientLight("#faf5ee", 0.8));
    const key = new THREE.DirectionalLight("#e08a6a", 2.4);
    key.position.set(3, 4, 5);
    scene.add(key);

    const fill = new THREE.DirectionalLight("#7e9476", 0.6);
    fill.position.set(-3, -2, 2);
    scene.add(fill);

    const rimLight = new THREE.PointLight("#daa840", 1.2, 12);
    rimLight.position.set(-2, 3, -4);
    scene.add(rimLight);

    let mx = 0;
    let my = 0;

    container.addEventListener("pointermove", (e) => {
        const b = container.getBoundingClientRect();
        mx = ((e.clientX - b.left) / b.width - 0.5) * 0.5;
        my = ((e.clientY - b.top) / b.height - 0.5) * -0.35;
    });

    let time = 0;

    function onResize() {
        if (!container.clientWidth || !container.clientHeight) return;
        renderer.setSize(container.clientWidth, container.clientHeight);
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
    }

    function render() {
        requestAnimationFrame(render);
        time += 0.003;

        group.rotation.y += 0.001;
        group.rotation.x += 0.0004;
        group.rotation.y += (mx - group.rotation.y * 0.1) * 0.015;
        group.rotation.x += (my - group.rotation.x * 0.1) * 0.015;

        /* Breathing orb — scale + emissive pulse */
        const breathe = Math.sin(time * 1.8);
        orb.rotation.y = time * 0.4;
        orb.rotation.x = time * 0.2;
        orb.scale.setScalar(1 + breathe * 0.06);
        orbMat.emissiveIntensity = 0.28 + breathe * 0.12;
        orbMat.opacity = 0.16 + breathe * 0.04;

        glow.scale.setScalar(1 + Math.sin(time * 1.5) * 0.05);

        /* Ribbon rotates on its own axis */
        ribbon.rotation.y = time * 0.25;
        ribbon.rotation.z = time * 0.15;
        ribbonMat.emissiveIntensity = 0.35 + Math.sin(time * 2.5) * 0.15;

        ring.rotation.z = -time * 0.3;

        renderer.render(scene, camera);
    }

    window.addEventListener("resize", onResize);
    onResize();
    render();

    return { renderer, scene, camera };
}
