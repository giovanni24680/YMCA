import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { PCDLoader } from "three/addons/loaders/PCDLoader.js";

/**
 * Point-cloud hero from design reference: OrbitControls + autoRotate, PCD load with procedural fallback.
 * Requires import map on the page for "three" and "three/addons/".
 */
export function initPartnersScene(selector = "[data-partners-scene]") {
    const container = document.querySelector(selector);
    if (!container || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return null;
    }

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.className = "partners-hero__canvas";
    renderer.domElement.setAttribute("aria-hidden", "true");
    container.prepend(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfaf5ee);

    const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 40);
    camera.position.set(0, 0, 1);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 0.5;
    controls.maxDistance = 10;
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;

    const bronze = 0xc2753a;
    let cloud = null;

    function createFallbackGeometry() {
        const particleCount = 10000;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const color = new THREE.Color(bronze);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const radius = 0.3 + Math.random() * 0.2;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);

            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.003,
            vertexColors: true,
            transparent: true,
            opacity: 0.85
        });

        const points = new THREE.Points(geometry, material);
        scene.add(points);
        cloud = points;
    }

    const loader = new PCDLoader();
    loader.load(
        "https://threejs.org/examples/models/pcd/binary/Zaghetto.pcd",
        (points) => {
            points.geometry.center();
            points.geometry.rotateX(Math.PI);
            points.material.size = 0.003;
            points.material.color.setHex(bronze);
            points.material.vertexColors = false;
            scene.add(points);
            cloud = points;
        },
        undefined,
        () => {
            if (!cloud) createFallbackGeometry();
        }
    );

    scene.add(new THREE.AmbientLight(0xfff5e1, 0.85));
    const key = new THREE.DirectionalLight(0xe08a6a, 1.4);
    key.position.set(5, 5, 5);
    scene.add(key);

    function resize() {
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (!w || !h) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }

    let raf = 0;
    function animate() {
        raf = requestAnimationFrame(animate);
        controls.update();
        if (cloud) cloud.rotation.y += 0.001;
        renderer.render(scene, camera);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    window.addEventListener("resize", resize);
    resize();
    animate();

    function pointerToCssVars(ev) {
        const b = container.getBoundingClientRect();
        const xPct = ((ev.clientX - b.left) / b.width) * 100;
        const yPct = ((ev.clientY - b.top) / b.height) * 100;
        container.style.setProperty("--ptr-x", `${Math.max(0, Math.min(100, xPct))}%`);
        container.style.setProperty("--ptr-y", `${Math.max(0, Math.min(100, yPct))}%`);
    }

    container.addEventListener("pointermove", pointerToCssVars);

    return {
        dispose() {
            cancelAnimationFrame(raf);
            ro.disconnect();
            window.removeEventListener("resize", resize);
            container.removeEventListener("pointermove", pointerToCssVars);
            controls.dispose();
            renderer.dispose();
            renderer.domElement.remove();
        }
    };
}
