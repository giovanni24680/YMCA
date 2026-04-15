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
    container.prepend(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0.6, 9);

    const group = new THREE.Group();
    scene.add(group);

    const particleCount = 1200;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const palette = [
        new THREE.Color("#c2753a"),
        new THREE.Color("#daa840"),
        new THREE.Color("#7e9476"),
        new THREE.Color("#f5ece0")
    ];

    for (let i = 0; i < particleCount; i++) {
        const s = i * 3;
        const r = 1.4 + Math.pow(Math.random(), 0.7) * 2.0;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const col = palette[Math.floor(Math.random() * palette.length)];

        positions[s] = r * Math.sin(phi) * Math.cos(theta);
        positions[s + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
        positions[s + 2] = r * Math.cos(phi);

        colors[s] = col.r;
        colors[s + 1] = col.g;
        colors[s + 2] = col.b;
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particles = new THREE.Points(geom, new THREE.PointsMaterial({
        size: 0.035,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.5,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    }));
    group.add(particles);

    const orbGeom = new THREE.IcosahedronGeometry(1.5, 3);
    const orbMat = new THREE.MeshStandardMaterial({
        color: "#faf5ee",
        emissive: "#c2753a",
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.12,
        flatShading: true,
        roughness: 0.5,
        metalness: 0.05
    });
    const orb = new THREE.Mesh(orbGeom, orbMat);
    group.add(orb);

    const glowGeom = new THREE.SphereGeometry(2.0, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
        color: "#daa840",
        transparent: true,
        opacity: 0.04,
        side: THREE.BackSide
    });
    group.add(new THREE.Mesh(glowGeom, glowMat));

    scene.add(new THREE.AmbientLight("#faf5ee", 0.6));
    const key = new THREE.DirectionalLight("#e08a6a", 1.8);
    key.position.set(3, 4, 5);
    scene.add(key);

    let time = 0;

    function onResize() {
        if (!container.clientWidth || !container.clientHeight) return;
        renderer.setSize(container.clientWidth, container.clientHeight);
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
    }

    function render() {
        requestAnimationFrame(render);
        time += 0.002;
        group.rotation.y += 0.0006;
        orb.rotation.y = time * 0.3;
        orbMat.emissiveIntensity = 0.18 + Math.sin(time * 1.5) * 0.04;
        renderer.render(scene, camera);
    }

    window.addEventListener("resize", onResize);
    onResize();
    render();

    return { renderer, scene, camera };
}
