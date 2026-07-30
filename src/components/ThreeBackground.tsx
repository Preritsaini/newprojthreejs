"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface ThreeBackgroundProps {
  onSelectObject: (objectName: string) => void;
}

export default function ThreeBackground({ onSelectObject }: ThreeBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xfcf9f2, 0.015);
    
    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 20);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2; // Don't let user go below ground
    controls.minDistance = 8;
    controls.maxDistance = 40;

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffd5e5, 1.2);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pinkLight = new THREE.PointLight(0xec4899, 4, 30);
    pinkLight.position.set(-8, 3, 5);
    scene.add(pinkLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 4, 30);
    purpleLight.position.set(8, -3, -5);
    scene.add(purpleLight);

    // --- 1. Star Dust Particle System ---
    const particleCount = 200;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const palette = [new THREE.Color(0xec4899), new THREE.Color(0xa855f7), new THREE.Color(0xfbbf24)];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;

      const color = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const pCanvas = document.createElement("canvas");
    pCanvas.width = 16;
    pCanvas.height = 16;
    const pCtx = pCanvas.getContext("2d");
    if (pCtx) {
      const grad = pCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, "rgba(255, 255, 255, 1)");
      grad.addColorStop(1, "rgba(255, 255, 255, 0)");
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 16, 16);
    }
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.4,
      map: new THREE.CanvasTexture(pCanvas),
      transparent: true,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      depthWrite: false,
    });

    const stars = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(stars);

    // --- 2. Interactive 3D Gift Box ---
    const giftBoxGroup = new THREE.Group();
    giftBoxGroup.position.set(-4, -1, 2);
    scene.add(giftBoxGroup);

    // Gift Base
    const boxBaseGeom = new THREE.BoxGeometry(2, 2, 2);
    const boxBaseMat = new THREE.MeshPhysicalMaterial({
      color: 0xe11d48, // Rich Red
      roughness: 0.2,
      metalness: 0.1,
      clearcoat: 0.8,
    });
    const boxBase = new THREE.Mesh(boxBaseGeom, boxBaseMat);
    boxBase.name = "gift_box";
    giftBoxGroup.add(boxBase);

    // Gift Lid
    const boxLidGeom = new THREE.BoxGeometry(2.2, 0.5, 2.2);
    const boxLidMat = new THREE.MeshPhysicalMaterial({
      color: 0xfbbf24, // Gold Accent
      roughness: 0.1,
      metalness: 0.5,
    });
    const boxLid = new THREE.Mesh(boxLidGeom, boxLidMat);
    boxLid.position.y = 1.2;
    boxLid.name = "gift_box";
    giftBoxGroup.add(boxLid);

    // --- 3. Interactive 3D Photo Frame ---
    const frameGroup = new THREE.Group();
    frameGroup.position.set(4, 1, -2);
    scene.add(frameGroup);

    // Load couple texture
    const textureLoader = new THREE.TextureLoader();
    const coupleTexture = textureLoader.load("/images/couple.png");

    // Frame Core / Photo (Aspect ratio for landscape couple photo)
    const photoGeom = new THREE.BoxGeometry(4, 2.55, 0.15);
    const photoMaterials = [
      new THREE.MeshStandardMaterial({ color: 0x27272a }), // Right
      new THREE.MeshStandardMaterial({ color: 0x27272a }), // Left
      new THREE.MeshStandardMaterial({ color: 0x27272a }), // Top
      new THREE.MeshStandardMaterial({ color: 0x27272a }), // Bottom
      new THREE.MeshStandardMaterial({ map: coupleTexture }), // Front (Show picture!)
      new THREE.MeshStandardMaterial({ color: 0x18181b }), // Back
    ];
    const photoMesh = new THREE.Mesh(photoGeom, photoMaterials);
    photoMesh.name = "photo_frame";
    frameGroup.add(photoMesh);

    // Gold frame border
    const frameBorderGeom = new THREE.BoxGeometry(4.3, 2.85, 0.1);
    const frameBorderMat = new THREE.MeshPhysicalMaterial({
      color: 0xfbbf24,
      metalness: 0.9,
      roughness: 0.1,
    });
    const frameBorder = new THREE.Mesh(frameBorderGeom, frameBorderMat);
    frameBorder.position.z = -0.05;
    frameBorder.name = "photo_frame";
    frameGroup.add(frameBorder);

    // --- 4. Rotating Glassy Heart ---
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, -1.5);
    heartShape.bezierCurveTo(-1, -1.5, -2, -0.7, -2, 0.5);
    heartShape.bezierCurveTo(-2, 1.8, -1, 2.8, 0, 1.2);
    heartShape.bezierCurveTo(1, 2.8, 2, 1.8, 2, 0.5);
    heartShape.bezierCurveTo(2, -0.7, 1, -1.5, 0, -1.5);

    const heartGeom = new THREE.ExtrudeGeometry(heartShape, {
      depth: 0.5,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.15,
      bevelThickness: 0.15,
    });
    heartGeom.center();

    const heartMat = new THREE.MeshPhysicalMaterial({
      color: 0xec4899,
      metalness: 0.2,
      roughness: 0.1,
      transmission: 0.6,
      ior: 1.4,
    });
    const mainHeart = new THREE.Mesh(heartGeom, heartMat);
    mainHeart.position.set(0, 3, 0);
    mainHeart.name = "main_heart";
    scene.add(mainHeart);

    // --- Raycasting / Interaction ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Track pointer down coordinates to distinguish click from drag
    const pointerDownPos = { x: 0, y: 0 };
    
    const handlePointerDown = (event: PointerEvent) => {
      pointerDownPos.x = event.clientX;
      pointerDownPos.y = event.clientY;
    };

    // Gift Box Animation Variables
    let lidTargetY = 1.2;
    let lidTargetRotZ = 0;

    const handlePointerUp = (event: PointerEvent) => {
      // If the pointer moved more than 5 pixels, treat it as a camera drag, not a click
      const moveDistance = Math.sqrt(
        Math.pow(event.clientX - pointerDownPos.x, 2) +
        Math.pow(event.clientY - pointerDownPos.y, 2)
      );
      if (moveDistance > 8) return;

      // Calculate mouse position in normalized device coordinates
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        let clickedObj = intersects[0].object;
        
        // Find named group/root
        let objName = clickedObj.name;
        let parent = clickedObj.parent;
        while (parent && !objName) {
          objName = parent.name;
          parent = parent.parent;
        }

        if (objName === "gift_box") {
          // Open Gift Box
          lidTargetY = 3.5;
          lidTargetRotZ = 0.5;
          
          // Create small floating heart rising out of the box
          const miniHeart = new THREE.Mesh(heartGeom, heartMat.clone());
          miniHeart.position.copy(giftBoxGroup.position).add(new THREE.Vector3(0, 1.2, 0));
          miniHeart.scale.set(0.3, 0.3, 0.3);
          scene.add(miniHeart);
          
          // Animate rising mini heart
          const riseInterval = setInterval(() => {
            miniHeart.position.y += 0.15;
            miniHeart.rotation.y += 0.1;
            miniHeart.scale.multiplyScalar(0.97);
            if (miniHeart.position.y > 6) {
              clearInterval(riseInterval);
              scene.remove(miniHeart);
            }
          }, 30);

          onSelectObject("gift_box");
        } else if (objName === "photo_frame") {
          // Spin frame as feedback
          let spinCount = 0;
          const spinInterval = setInterval(() => {
            frameGroup.rotation.y += 0.2;
            spinCount++;
            if (spinCount > 31) { // 2 full rotations roughly
              clearInterval(spinInterval);
              frameGroup.rotation.y = 0;
            }
          }, 20);

          onSelectObject("photo_frame");
        } else if (objName === "main_heart") {
          // Heart scale pulse
          mainHeart.scale.set(1.4, 1.4, 1.4);
          setTimeout(() => {
            mainHeart.scale.set(1, 1, 1);
          }, 200);

          onSelectObject("main_heart");
        }
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);

    // --- Animation Loop ---
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Main heart floating & rotation
      mainHeart.rotation.y = elapsedTime * 0.8;
      mainHeart.position.y = 3 + Math.sin(elapsedTime * 2) * 0.4;

      // Photo frame slow float
      frameGroup.position.y = 1 + Math.sin(elapsedTime * 1.2) * 0.2;
      frameGroup.rotation.y = Math.sin(elapsedTime * 0.5) * 0.15;

      // Gift box lid animation
      boxLid.position.y += (lidTargetY - boxLid.position.y) * 0.1;
      boxLid.rotation.z += (lidTargetRotZ - boxLid.rotation.z) * 0.1;

      // Rotate stardust particles
      const positions = stars.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += 0.015;
        if (positions[i * 3 + 1] > 20) {
          positions[i * 3 + 1] = -20;
        }
      }
      stars.geometry.attributes.position.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // --- Window Resize Handler ---
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // --- Cleanup ---
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [onSelectObject]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
    />
  );
}
