import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

// Galaxy/Constellation color themes (Electric Blues, Cyans, Purples, Golds)
const colorMap = [
  { key: "H", color: 0x00dfff, glow: 0x0055ff, primary: true },  // Galactic Cyan (Focal Peak behind card)
  { key: "I", color: 0x0072ff, glow: 0x33bbff },                // Space Blue
  { key: "T", color: 0x00ffaa, glow: 0x00aa77 },                // Nebula Green
  { key: "S", color: 0xff33bb, glow: 0xcc0088 },                // Cosmic Pink
  { key: "D", color: 0x8800ff, glow: 0xcc88ff },                // Quantum Purple
  { key: "I", color: 0xff4477, glow: 0xff88aa },               // Rose Nebula
  { key: "F", color: 0x00ff88, glow: 0x00cc66 },                // Aurora Green
  { key: "F", color: 0xffdd00, glow: 0xffaa00 },               // Solar Gold
  { key: "E", color: 0xcc1111, glow: 0xff4444 },                // Supernova Red
  { key: "R", color: 0x3f51b5, glow: 0x757de8 },                // Indigo Star
  { key: "E", color: 0xff69b4, glow: 0xffb6c1 },               // Pink Dust
  { key: "N", color: 0x2e7d32, glow: 0x66bb6a },                // Muted Emerald
  { key: "T", color: 0xc5a059, glow: 0xffdf6d }                // Antique Gold Star
];

export default function ThreeDBackdrop({ className = "" }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    let scene, camera, renderer;
    let animationFrameId;
    let observer;
    let isPaused = false;

    // Dimensions
    let width = window.innerWidth;
    let height = window.innerHeight;

    const groundY = -3.2;

    // Interaction states
    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;
    let scrollProgress = 0;
    let lerpedScroll = 0;

    // 1. SCENE SETUP
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040207); // Dark space void
    scene.fog = new THREE.FogExp2(0x040207, 0.045); // Atmospheric cosmic dust fog

    // Perspective Camera
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.0, 10);

    // WebGL Renderer
    renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    // 2. STAGE LIGHTING (Electric Blue, Cyan, & Indigo wash)
    const ambientLight = new THREE.AmbientLight(0x070b22, 0.8); // Space-blue ambient
    scene.add(ambientLight);

    // Glowing cyan spotlight focusing on right showcase card
    const spotLight = new THREE.SpotLight(0x00ffff, 10, 25, Math.PI * 0.28, 0.5, 1);
    spotLight.position.set(4, 5, -3);
    spotLight.target.position.set(2.5, 0.5, -2);
    scene.add(spotLight);
    scene.add(spotLight.target);

    // Shifting colored directional light shafts
    const blueLight = new THREE.DirectionalLight(0x0055ff, 3.0);
    blueLight.position.set(-6, 4, -4);
    scene.add(blueLight);

    const purpleLight = new THREE.DirectionalLight(0x7a00ff, 2.5);
    purpleLight.position.set(6, 3, -4);
    scene.add(purpleLight);

    // 3. GLOSSY SPACE DUST FLOOR
    const floorGeom = new THREE.PlaneGeometry(100, 100);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x040207,
      roughness: 0.25, // glossier for constellation reflections
      metalness: 0.95,
      transparent: true,
      opacity: 0.8,
    });
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = groundY;
    scene.add(floor);

    // 4. REVOLVING SPIRAL GALAXY (MILKY WAY CORE)
    const starCount = 800;
    const galaxyGeom = new THREE.BufferGeometry();
    const galaxyPositions = new Float32Array(starCount * 3);
    const galaxyColors = new Float32Array(starCount * 3);

    const galaxyColorsList = [
      new THREE.Color(0x00ffff), // Cyan core
      new THREE.Color(0x0072ff), // Blue arm
      new THREE.Color(0x7a00ff), // Purple arm
      new THREE.Color(0xff44aa)  // Pink cluster
    ];

    for (let i = 0; i < starCount; i++) {
      // Swirling double-armed spiral distribution
      const r = (i / starCount) * 16.0 + Math.random() * 1.5;
      const armIdx = i % 2 === 0 ? 0 : 1;
      const angle = r * 0.45 + (armIdx * Math.PI) + (Math.random() - 0.5) * 0.35;

      galaxyPositions[i * 3] = Math.cos(angle) * r;
      galaxyPositions[i * 3 + 1] = (Math.random() - 0.5) * 1.2;
      galaxyPositions[i * 3 + 2] = Math.sin(angle) * r;

      const col = galaxyColorsList[Math.floor(Math.random() * galaxyColorsList.length)].clone();
      // Core is brighter, outer edges are dimmer
      const edgeFade = Math.max(1.0 - (r / 16.0), 0.1);
      col.multiplyScalar(edgeFade);

      galaxyColors[i * 3] = col.r;
      galaxyColors[i * 3 + 1] = col.g;
      galaxyColors[i * 3 + 2] = col.b;
    }

    galaxyGeom.setAttribute("position", new THREE.BufferAttribute(galaxyPositions, 3));
    galaxyGeom.setAttribute("color", new THREE.BufferAttribute(galaxyColors, 3));

    // Star texture
    const starCanvas = document.createElement("canvas");
    starCanvas.width = 16;
    starCanvas.height = 16;
    const starCtx = starCanvas.getContext("2d");
    const starGrad = starCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
    starGrad.addColorStop(0, "rgba(255, 255, 255, 1)");
    starGrad.addColorStop(0.3, "rgba(0, 255, 255, 0.8)");
    starGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    starCtx.fillStyle = starGrad;
    starCtx.fillRect(0, 0, 16, 16);
    const starTexture = new THREE.CanvasTexture(starCanvas);

    const galaxyMaterial = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      map: starTexture,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const galaxyDisc = new THREE.Points(galaxyGeom, galaxyMaterial);
    // Centered behind the right showcase area and letter H
    galaxyDisc.position.set(2.8, 1.8, -7.5);
    galaxyDisc.rotation.x = Math.PI * 0.12; // tilt towards camera
    scene.add(galaxyDisc);

    // 5. ASYMMETRIC GLOWING ARCH LINES
    const isMobile = window.innerWidth < 1024;
    const letterGroup = new THREE.Group();
    scene.add(letterGroup);

    const activeArches = [];
    let mainArchCurve = null;

    const getArchCurve = (offsetZ, heightOffset, scale) => {
      const curvePoints = [];
      const steps = 60;
      
      if (isMobile) {
        // Mobile vertical curve
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const y = 3.5 - t * 7.5;
          const x = Math.sin(y * 1.3) * 1.5 * scale;
          const z = -y * 0.15 - 2.8 + offsetZ;
          curvePoints.push(new THREE.Vector3(x, y + heightOffset, z));
        }
      } else {
        // Desktop asymmetric arch
        const leftPt = new THREE.Vector3(-9.0 * scale, -3.5 + heightOffset, -6.5 + offsetZ);
        const midLeft = new THREE.Vector3(-5.0 * scale, -1.8 + heightOffset, -4.5 + offsetZ);
        const center = new THREE.Vector3(-1.0 * scale, -0.6 + heightOffset, -3.0 + offsetZ);
        const peak = new THREE.Vector3(2.5 * scale, 0.6 + heightOffset, -2.5 + offsetZ); // peak behind card
        const midRight = new THREE.Vector3(5.5 * scale, -1.2 + heightOffset, -3.5 + offsetZ);
        const rightPt = new THREE.Vector3(8.0 * scale, -3.0 + heightOffset, -5.0 + offsetZ);
        curvePoints.push(leftPt, midLeft, center, peak, midRight, rightPt);
      }
      return new THREE.CatmullRomCurve3(curvePoints);
    };

    const buildLayeredArches = () => {
      activeArches.forEach((obj) => {
        scene.remove(obj.main);
        scene.remove(obj.mirror);
      });
      activeArches.length = 0;

      mainArchCurve = getArchCurve(0, 0, 1.0);
      const midCurve = getArchCurve(-1.5, 0.2, 0.94);
      const backCurve = getArchCurve(-3.0, 0.4, 0.88);

      const archDefs = [
        { curve: mainArchCurve, thickness: 0.035, color: 0x00ffff, emissive: 0x0055ff, intensity: 2.0, opacity: 0.35 },
        { curve: midCurve, thickness: 0.025, color: 0x7a00ff, emissive: 0x4400cc, intensity: 1.0, opacity: 0.16 },
        { curve: backCurve, thickness: 0.015, color: 0x0072ff, emissive: 0x0033cc, intensity: 0.5, opacity: 0.08 }
      ];

      archDefs.forEach((def) => {
        const geom = new THREE.TubeGeometry(def.curve, 80, def.thickness, 8, false);
        const mat = new THREE.MeshStandardMaterial({
          color: def.color,
          emissive: def.emissive,
          emissiveIntensity: def.intensity,
          transparent: true,
          opacity: def.opacity
        });

        const mainMesh = new THREE.Mesh(geom, mat);
        scene.add(mainMesh);

        // Mirror
        const mirrorMesh = mainMesh.clone();
        mirrorMesh.material = mainMesh.material.clone();
        mirrorMesh.material.transparent = true;
        mirrorMesh.material.opacity = def.opacity * 0.16;
        mirrorMesh.material.depthWrite = false;
        mirrorMesh.scale.y = -1;
        mirrorMesh.position.y = groundY * 2;
        scene.add(mirrorMesh);

        activeArches.push({ main: mainMesh, mirror: mirrorMesh });
      });
    };

    buildLayeredArches();

    // 6. BUILD 3D CONSTELLATION SYMBOLS FROM SVGS
    const symbolInstances = [];
    const svgLoader = new SVGLoader();

    colorMap.forEach((symbol, index) => {
      svgLoader.load(`/images/${symbol.key.toLowerCase().replace("i2", "ii").replace("f2", "ff").replace("e2", "ee").replace("t2", "tt")}.svg`, (data) => {
        const paths = data.paths;
        if (paths.length === 0) return;

        const shapes = [];
        paths.forEach(p => shapes.push(...SVGLoader.createShapes(p)));

        // Create volumetric hollow cage boundary segments
        const outlinePoints = [];
        const cageConnections = [];
        
        shapes.forEach((shape) => {
          // sample outline points along the curve
          const pts = shape.getSpacedPoints(isMobile ? 30 : 50);
          outlinePoints.push(...pts);
        });

        if (outlinePoints.length === 0) return;

        // Build 3D Cage Geometry: Front outline at Z = 0.1, Back outline at Z = -0.1
        const vertices = [];
        const indices = [];
        const n = outlinePoints.length;

        // Front Outline Points (Z = 0.1)
        for (let i = 0; i < n; i++) {
          vertices.push(outlinePoints[i].x, outlinePoints[i].y, 0.1);
        }
        // Back Outline Points (Z = -0.1)
        for (let i = 0; i < n; i++) {
          vertices.push(outlinePoints[i].x, outlinePoints[i].y, -0.1);
        }

        // Connecting indices for line segments
        // Front Loop
        for (let i = 0; i < n; i++) {
          indices.push(i, (i + 1) % n);
        }
        // Back Loop
        for (let i = 0; i < n; i++) {
          indices.push(n + i, n + ((i + 1) % n));
        }
        // Vertical cross-bars (connecting front and back loops every 4th node)
        for (let i = 0; i < n; i += 4) {
          indices.push(i, n + i);
        }

        const cageGeom = new THREE.BufferGeometry();
        cageGeom.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
        cageGeom.setIndex(indices);

        const themeColor = new THREE.Color(symbol.color);
        const glowColor = new THREE.Color(symbol.glow);

        let baseOpacity = symbol.primary ? 0.95 : 0.4 - (index * 0.02);
        if (isMobile) {
          baseOpacity = symbol.primary ? 0.8 : (index < 4 ? 0.15 : 0.02);
        }

        // 1. Constellation boundary lines
        const lineMat = new THREE.LineBasicMaterial({
          color: themeColor,
          transparent: true,
          opacity: Math.max(baseOpacity * 0.7, 0.03),
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });

        const linesMesh = new THREE.LineSegments(cageGeom, lineMat);

        // 2. Constellation star nodes (Points)
        const nodeMat = new THREE.PointsMaterial({
          color: glowColor,
          size: symbol.primary ? 0.15 : 0.11,
          map: starTexture,
          transparent: true,
          opacity: Math.max(baseOpacity, 0.05),
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });

        const nodesMesh = new THREE.Points(cageGeom, nodeMat);

        // Group them
        const letterConstellation = new THREE.Group();
        letterConstellation.add(linesMesh, nodesMesh);

        // Position along the main foreground curve (H at peak t = 0.62)
        let t = 0.62;
        if (!symbol.primary) {
          t = 0.62 - index * 0.048;
        }
        t = Math.max(Math.min(t, 1.0), 0.0);

        const position = mainArchCurve.getPointAt(t);
        letterConstellation.position.copy(position);

        // Galactic constellation scale: 2x larger than solid meshes to look "big" and majestic!
        const baseScale = symbol.primary ? 0.016 : 0.009 - (index * 0.0002);
        letterConstellation.scale.set(baseScale, -baseScale, baseScale);

        letterGroup.add(letterConstellation);

        // Mirrored reflection group
        const mirrorConstellation = letterConstellation.clone();
        mirrorConstellation.scale.set(baseScale, baseScale, baseScale); // flipped scale.y is updated in loop
        
        // Traverse to make mirror materials softer
        mirrorConstellation.traverse((child) => {
          if (child.material) {
            child.material = child.material.clone();
            child.material.transparent = true;
            child.material.opacity = child.material.opacity * 0.18;
            child.material.depthWrite = false;
          }
        });
        scene.add(mirrorConstellation);

        // Store animation variables
        letterConstellation.userData = {
          primary: symbol.primary,
          baseY: letterConstellation.position.y,
          baseX: letterConstellation.position.x,
          baseZ: letterConstellation.position.z,
          floatPhase: Math.random() * Math.PI * 2,
          floatSpeed: 0.4 + Math.random() * 0.6,
          index: index,
          mirrorRef: mirrorConstellation,
          linesRef: linesMesh,
          nodesRef: nodesMesh
        };

        symbolInstances.push(letterConstellation);
      });
    });

    // 7. SWIRLING AMBER & CYAN EMBERS
    const particleCount = isMobile ? 40 : 150;
    const positions = new Float32Array(particleCount * 3);
    const phases = new Float32Array(particleCount);
    const speeds = new Float32Array(particleCount);
    const radii = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.0 + Math.random() * 5.0;
      const height = (Math.random() - 0.5) * 6;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      phases[i] = Math.random() * Math.PI * 2;
      speeds[i] = 0.15 + Math.random() * 0.3;
      radii[i] = radius;
    }

    const pGeom = new THREE.BufferGeometry();
    pGeom.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.13,
      map: starTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particleSystem = new THREE.Points(pGeom, pMat);
    scene.add(particleSystem);

    // 8. INTERACTION HANDLERS
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        scrollProgress = window.scrollY / docHeight;
      }
    };

    const handleMouseMove = (e) => {
      targetMouseX = (e.clientX - width / 2) / (width / 2);
      targetMouseY = (e.clientY - height / 2) / (height / 2);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);

    // 9. ANIMATION LOOP
    const clock = new THREE.Clock();

    const animate = () => {
      if (isPaused) return;

      animationFrameId = requestAnimationFrame(animate);

      const time = clock.getElapsedTime();
      const delta = clock.getDelta();

      // Mouse Parallax & Scroll Damping
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;
      lerpedScroll += (scrollProgress - lerpedScroll) * 0.07;

      // ─── CAMERA ORBIT ───
      const slowTime = time * 0.08;
      const cameraOrbitX = Math.sin(slowTime) * 1.5;
      const cameraOrbitZ = 10.0 + Math.cos(slowTime * 1.2) * 1.0;
      const cameraOrbitY = 1.0 + Math.sin(slowTime * 0.8) * 0.4;

      camera.position.x = cameraOrbitX + mouseX * 0.6;
      camera.position.y = cameraOrbitY - mouseY * 0.4 - lerpedScroll * 1.2;
      camera.position.z = cameraOrbitZ;
      camera.lookAt(0, 1.0 - lerpedScroll * 1.2, -2.5);

      // ─── REVOLVE GALAXY DISC ───
      galaxyDisc.rotation.y = time * 0.05;
      galaxyDisc.position.y = 1.8 + Math.sin(time * 0.4) * 0.15; // slow float

      // ─── SWEEP STAGE LIGHTS ───
      spotLight.position.x = 4.0 + Math.sin(time * 0.25) * 2.0;
      spotLight.position.y = 5.0 + Math.cos(time * 0.2) * 1.0;
      blueLight.position.x = -6.0 + Math.sin(time * 0.15) * 2.5;
      purpleLight.position.x = 6.0 + Math.cos(time * 0.18) * 2.0;

      // ─── ANIMATE CONSTELLATION SYMBOLS ───
      symbolInstances.forEach((group) => {
        const data = group.userData;
        
        // bobbing
        const floatOffset = Math.sin(time * data.floatSpeed + data.floatPhase) * 0.07;
        group.position.y = data.baseY + floatOffset;

        // Custom slow constellation drift rotations
        if (data.primary) {
          group.position.y = data.baseY + floatOffset * 1.3 + 0.15;
          group.rotation.y = time * 0.15 + mouseX * 0.15;
          group.rotation.z = Math.sin(time * 0.4) * 0.06;
          // Pulsing constellation glow
          data.nodesRef.material.opacity = data.nodesRef.material.opacity * 0.8 + (0.95 + Math.sin(time * 2.5) * 0.15) * 0.2;
        } else {
          group.rotation.y = Math.sin(time * 0.25 + data.index) * 0.12 + mouseX * 0.1;
          group.rotation.z = Math.cos(time * 0.2 + data.index) * 0.06;
        }

        // Sync mirrored reflection
        const mirror = data.mirrorRef;
        if (mirror) {
          mirror.position.set(
            group.position.x,
            groundY - (group.position.y - groundY),
            group.position.z
          );
          
          mirror.rotation.set(
            -group.rotation.x,
            group.rotation.y,
            -group.rotation.z
          );

          // Mirror scaling opacity sync
          mirror.traverse((child) => {
            if (child.material) {
              // Copy parent opacity factor
              const pMat = child.name === group.children[0].name ? group.children[0].material : group.children[1].material;
              child.material.opacity = pMat.opacity * 0.16;
            }
          });
        }
      });

      // ─── SWIRLING TORNADO DUST ───
      const positionsArr = pGeom.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        phases[i] += speeds[i] * delta * 0.6;
        const rad = radii[i];
        const angle = phases[i];
        
        positionsArr[i * 3] = Math.cos(angle) * rad;
        positionsArr[i * 3 + 2] = Math.sin(angle) * rad;
        positionsArr[i * 3 + 1] += speeds[i] * delta * 1.5;

        if (positionsArr[i * 3 + 1] > 4.0) {
          positionsArr[i * 3 + 1] = -4.0;
        }
      }
      pGeom.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    // 10. RESIZE ADJUSTER
    const handleResize = () => {
      if (!renderer || !camera) return;
      width = window.innerWidth;
      height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);

      const currentIsMobile = width < 1024;
      buildLayeredArches();

      symbolInstances.forEach((group) => {
        const symbol = colorMap[group.userData.index];
        let t = 0.62;
        if (!group.userData.primary) {
          t = 0.62 - group.userData.index * 0.048;
        }
        t = Math.max(Math.min(t, 1.0), 0.0);

        const position = mainArchCurve.getPointAt(t);
        group.position.copy(position);
        group.userData.baseX = position.x;
        group.userData.baseY = position.y;
        group.userData.baseZ = position.z;
        
        const baseOpacity = symbol.primary ? 0.95 : 0.4 - (group.userData.index * 0.02);
        const finalOpacity = currentIsMobile ? (symbol.primary ? 0.8 : (group.userData.index < 4 ? 0.15 : 0.02)) : baseOpacity;
        
        group.children[0].material.opacity = Math.max(finalOpacity * 0.7, 0.03);
        group.children[1].material.opacity = Math.max(finalOpacity, 0.05);

        if (group.userData.mirrorRef) {
          group.userData.mirrorRef.traverse((child) => {
            if (child.material) {
              child.material.opacity = finalOpacity * 0.16;
            }
          });
        }
      });
    };

    window.addEventListener("resize", handleResize);

    // 11. VIEWPORT OBSERVER
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isPaused = !entry.isIntersecting;
          if (entry.isIntersecting) {
            clock.getDelta();
            animate();
          }
        });
      },
      { threshold: 0.05 }
    );
    observer.observe(containerRef.current);

    animate();

    // 12. CLEANUP ON UNMOUNT
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);

      if (observer) observer.disconnect();

      symbolInstances.forEach((group) => {
        group.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        });
        if (group.userData.mirrorRef) {
          group.userData.mirrorRef.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
          });
        }
      });

      activeArches.forEach((obj) => {
        obj.main.geometry.dispose();
        obj.main.material.dispose();
        obj.mirror.geometry.dispose();
        obj.mirror.material.dispose();
      });

      floorGeom.dispose();
      floorMat.dispose();

      galaxyGeom.dispose();
      starTexture.dispose();
      galaxyMaterial.dispose();

      pGeom.dispose();
      pMat.dispose();

      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 w-full h-full z-0 pointer-events-none overflow-hidden ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
}
