import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";

interface ThreeCanvasProps {
  viewMode: "orbit" | "grid";
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ viewMode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const icoRef = useRef<THREE.Mesh | null>(null);
  const wireRef = useRef<THREE.Mesh | null>(null);
  const spritesRef = useRef<THREE.Sprite[]>([]);
  
  const mouseX = useRef(0);
  const mouseY = useRef(0);

  // Layout calculations
  const sphereLayout = (i: number, n: number, r: number) => {
    const phi = Math.acos(1 - 2 * (i + 0.5) / n);
    const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
    return new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    );
  };

  const gridLayout = (i: number, n: number, r: number) => {
    const cols = 5;
    const row = Math.floor(i / cols);
    const col = i % cols;
    return new THREE.Vector3((col - 2) * 1.6, (row - 0.5) * 1.7, r * 0.4);
  };

  // Helper to draw custom rounded rectangle canvas texture for sprites
  const makeLabelSprite = (text: string) => {
    const cnv = document.createElement("canvas");
    cnv.width = 256;
    cnv.height = 96;
    const ctx = cnv.getContext("2d");
    if (!ctx) return new THREE.Sprite();

    const roundRect = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
      c.beginPath();
      c.moveTo(x + r, y);
      c.arcTo(x + w, y, x + w, y + h, r);
      c.arcTo(x + w, y + h, x, y + h, r);
      c.arcTo(x, y + h, x, y, r);
      c.arcTo(x, y, x + w, y, r);
      c.closePath();
    };

    // Background fill
    ctx.fillStyle = "rgba(13, 18, 64, 0.9)";
    roundRect(ctx, 2, 2, 252, 92, 20);
    ctx.fill();

    // Border stroke
    ctx.strokeStyle = "#5EE7FF";
    ctx.lineWidth = 3;
    roundRect(ctx, 2, 2, 252, 92, 20);
    ctx.stroke();

    // Text label
    ctx.fillStyle = "#F2F4FF";
    ctx.font = "bold 26px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 128, 50);

    const tex = new THREE.CanvasTexture(cnv);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(1.9, 0.7, 1);
    return sprite;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Setup Renderer
    const width = window.innerWidth;
    const height = window.innerHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 2. Setup Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 3. Setup Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 10);
    cameraRef.current = camera;

    // 4. Setup Lighting
    const ambientLight = new THREE.AmbientLight(0x8899ff, 0.7);
    scene.add(ambientLight);

    const dl = new THREE.DirectionalLight(0x5EE7FF, 1.4);
    dl.position.set(4, 6, 8);
    scene.add(dl);

    const dl2 = new THREE.DirectionalLight(0xffffff, 0.5);
    dl2.position.set(-5, -3, 4);
    scene.add(dl2);

    // 5. Setup Starfield
    const starGeo = new THREE.BufferGeometry();
    const starCount = 900;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 60;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 60;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x9fb3ff,
      size: 0.06,
      transparent: true,
      opacity: 0.8,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // 6. Setup Central Metallic Geometry Group
    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    const icoGeo = new THREE.IcosahedronGeometry(2.1, 1);
    const icoMat = new THREE.MeshStandardMaterial({
      color: 0xcfe0ff,
      metalness: 1,
      roughness: 0.22,
      flatShading: true,
    });
    const ico = new THREE.Mesh(icoGeo, icoMat);
    group.add(ico);
    icoRef.current = ico;

    const wireGeo = new THREE.IcosahedronGeometry(2.45, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x5EE7FF,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    group.add(wire);
    wireRef.current = wire;

    // 7. Setup Orbiting Labels
    const labels = [
      "IFC · REVIT",
      "TEXT2BIM",
      "$4,200",
      "HIRING",
      "KARACHI",
      "LORA",
      "PAKPLAN",
      "ARCHICAD",
      "NAQSH = PATTERN",
      "IFCOPENSHELL",
    ];

    const sprites = labels.map(makeLabelSprite);
    sprites.forEach((sprite) => group.add(sprite));
    spritesRef.current = sprites;

    // Connect core to sprites with geometric line segments
    const linesGroup = new THREE.Group();
    group.add(linesGroup);

    sprites.forEach((sprite) => {
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        sprite.position.clone()
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x5EE7FF,
        transparent: true,
        opacity: 0.3,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      linesGroup.add(line);
    });

    // Position sprites initially
    const initialPos = viewMode === "orbit"
      ? sprites.map((_, i) => sphereLayout(i, sprites.length, 4.2))
      : sprites.map((_, i) => gridLayout(i, sprites.length, 4.2));

    sprites.forEach((sprite, i) => {
      sprite.position.copy(initialPos[i]);
    });

    // 8. Track Mouse coordinates
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.current = e.clientX / window.innerWidth - 0.5;
      mouseY.current = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // 9. Resize handler
    const handleResize = () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // 10. Animation Loop
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Spin internal meshes
      if (ico) {
        ico.rotation.y = t * 0.25;
        ico.rotation.x = t * 0.12;
      }
      if (wire) {
        wire.rotation.y = -t * 0.18;
        wire.rotation.x = t * 0.08;
      }

      // Revolve the entire system group containing both sphere and text labels
      if (group) {
        group.rotation.y = t * 0.15;
        group.rotation.x = Math.sin(t * 0.05) * 0.18;
        group.rotation.z = Math.cos(t * 0.03) * 0.12;
      }

      // Update lines dynamically to connect sphere to moving text labels
      if (linesGroup) {
        linesGroup.children.forEach((child, i) => {
          const sprite = sprites[i];
          if (sprite && child instanceof THREE.Line) {
            const positions = child.geometry.attributes.position.array as Float32Array;
            positions[3] = sprite.position.x;
            positions[4] = sprite.position.y;
            positions[5] = sprite.position.z;
            child.geometry.attributes.position.needsUpdate = true;
          }
        });
      }

      // Parallax smooth camera drift
      if (camera) {
        camera.position.x += (mouseX.current * 2.6 - camera.position.x) * 0.03;
        camera.position.y += (-mouseY.current * 1.6 - camera.position.y) * 0.03;
        camera.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
    };
    animate();

    // 11. Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);

      // Dispose geometries & materials
      icoGeo.dispose();
      icoMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      starGeo.dispose();
      starMat.dispose();

      sprites.forEach((sprite) => {
        if (sprite.material.map) sprite.material.map.dispose();
        sprite.material.dispose();
      });

      if (renderer.domElement && containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update layout positions when viewMode prop changes
  useEffect(() => {
    const sprites = spritesRef.current;
    if (sprites.length === 0) return;

    const targetPositions = viewMode === "orbit"
      ? sprites.map((_, i) => sphereLayout(i, sprites.length, 4.2))
      : sprites.map((_, i) => gridLayout(i, sprites.length, 4.2));

    sprites.forEach((sprite, i) => {
      gsap.to(sprite.position, {
        x: targetPositions[i].x,
        y: targetPositions[i].y,
        z: targetPositions[i].z,
        duration: 1.1,
        ease: "power3.inOut",
        overwrite: "auto",
      });
    });
  }, [viewMode]);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 z-0 pointer-events-none block" 
      style={{ mixBlendMode: "screen" }}
    />
  );
};
