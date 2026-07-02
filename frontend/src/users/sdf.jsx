import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { Compass, Volume2, VolumeX, ArrowLeft } from "lucide-react";

// ═══════════════════════════════════════════════════
// WEB AUDIO API REAL-TIME SYNTHESIZER
// ═══════════════════════════════════════════════════
const useAudioAmbient = () => {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioCtxRef = useRef(null);
  const droneNodeRef = useRef(null);
  const windNodeRef = useRef(null);

  const startAudio = () => {
    if (audioCtxRef.current) return;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // Low warm drone synthesizer
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gainNode = ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.value = 55; // A1 drone

      osc2.type = 'sine';
      osc2.frequency.value = 110; // A2 overtone

      filter.type = 'lowpass';
      filter.frequency.value = 130;
      filter.Q.value = 8;

      // Slow LFO to sweep filter frequency
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.08; 
      lfoGain.gain.value = 40;

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 3);

      osc1.start(0);
      osc2.start(0);
      lfo.start(0);

      droneNodeRef.current = { osc1, osc2, lfo, gain: gainNode };

      // Wind Generator (White Noise + Swept Bandpass Filter)
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.value = 400;
      windFilter.Q.value = 2.0;

      const windGain = ctx.createGain();

      // slow LFO for wind sweeps
      const windLfo = ctx.createOscillator();
      const windLfoGain = ctx.createGain();
      windLfo.frequency.value = 0.05;
      windLfoGain.gain.value = 200;

      windLfo.connect(windLfoGain);
      windLfoGain.connect(windFilter.frequency);

      whiteNoise.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(ctx.destination);

      windGain.gain.setValueAtTime(0, ctx.currentTime);
      windGain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 4);

      whiteNoise.start(0);
      windLfo.start(0);

      windNodeRef.current = { whiteNoise, windLfo, gain: windGain };

      setAudioEnabled(true);
    } catch (e) {
      console.error("Audio Context failed to initialize", e);
    }
  };

  const toggleAudio = () => {
    if (!audioCtxRef.current) {
      startAudio();
      return;
    }

    if (audioCtxRef.current.state === "running") {
      audioCtxRef.current.suspend();
      setAudioEnabled(false);
    } else {
      audioCtxRef.current.resume();
      setAudioEnabled(true);
    }
  };

  useEffect(() => {
    return () => {
      if (droneNodeRef.current) {
        try { droneNodeRef.current.osc1.stop(); } catch (e) {}
        try { droneNodeRef.current.osc2.stop(); } catch (e) {}
        try { droneNodeRef.current.lfo.stop(); } catch (e) {}
      }
      if (windNodeRef.current) {
        try { windNodeRef.current.whiteNoise.stop(); } catch (e) {}
        try { windNodeRef.current.windLfo.stop(); } catch (e) {}
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return { audioEnabled, toggleAudio, startAudio, audioCtxRef, droneNodeRef };
};

// ═══════════════════════════════════════════════════
// EXHIBITION STORY DATA & STRUCTURAL DETAILS
// ═══════════════════════════════════════════════════
const letterData = [
  { 
    key: "H", 
    theme: "Hope • Humanity • History", 
    color: "#ff7a00", 
    glow: "#ffaa44", 
    bgHex: 0xff7a00, 
    symbol: "Gateway", 
    desc: "Rooted in a century of moral reform and spiritual empowerment. We traverse the historical pathways of knowledge, celebrating a legacy that shaped the human landscape of Malabar.", 
    badges: ["100 Years of Samastha", "50 Years of Kanthapuram Leadership", "Legacy Seminar"] 
  },
  { 
    key: "I", 
    theme: "Influence", 
    color: "#0072ff", 
    glow: "#33bbff", 
    bgHex: 0x0055dd, 
    symbol: "The Pen", 
    desc: "Voices that resonate across generations. Exploring the power of literature, digital audio, and media to build healthy social narratives and speak truth to power.", 
    badges: ["Sahithyotsav Podcast", "Student Media Meet", "Cultural Talk Circle"] 
  },
  { 
    key: "T", 
    theme: "Talent", 
    color: "#00aa44", 
    glow: "#44ff88", 
    bgHex: 0x00aa44, 
    symbol: "Career Compass", 
    desc: "Where passion meets purpose. Navigating paths of growth, mapping career compasses, and channeling artistic expression to address contemporary global issues.", 
    badges: ["Career Navigation Hub", "Art Exhibition", "Innovative Tech Expo"] 
  },
  { 
    key: "S", 
    theme: "Signature", 
    color: "#ff44aa", 
    glow: "#ff88dd", 
    bgHex: 0xff44aa, 
    symbol: "Ripple", 
    desc: "Every individual is an original manuscript. Leaving an indelible mark through creative writing, ink drawings, and calligraphic compositions that reflect the soul.", 
    badges: ["Calligraphy Contest", "Poetry Slam", "Short Story Masterclass"] 
  },
  { 
    key: "D", 
    theme: "Discovery", 
    color: "#8800ff", 
    glow: "#cc88ff", 
    bgHex: 0x8800ff, 
    symbol: "Window", 
    desc: "Unlocking portals of wonder. Opening windows to scientific inquiry, classical wisdom, and hidden chambers of knowledge that traditional pathways ignore.", 
    badges: ["Book Fair & Reading Corner", "Science & Faith Seminar", "Young Researchers Forum"] 
  },
  { 
    key: "I2", 
    theme: "Inspire", 
    color: "#ff4477", 
    glow: "#ff88aa", 
    bgHex: 0xff4477, 
    symbol: "Voice Wave", 
    desc: "Igniting a flame in others. Elevating the community's voice through speech, theatrical drama, and public debate under the cinematic spotlight of leadership.", 
    badges: ["Elocution Grand Prix", "Sufi Devotional Music", "Youth Parliament"] 
  },
  { 
    key: "F", 
    theme: "Faith", 
    color: "#11aa33", 
    glow: "#66ff88", 
    bgHex: 0x11aa33, 
    symbol: "Geometric Leaf", 
    desc: "Spiritual roots grounding creative growth. Integrating Islamic aesthetic heritage, calligraphy, and Ghibli-esque harmony with nature to experience peace.", 
    badges: ["Fiqh Seminars", "Islamic Arts & Calligraphy", "Echoes of Sufism"] 
  },
  { 
    key: "F2", 
    theme: "Forward", 
    color: "#ffcc00", 
    glow: "#ffee66", 
    bgHex: 0xffcc00, 
    symbol: "Staircase", 
    desc: "The staircase of progress. Ascending step by step towards educational excellence, academic accomplishments, and community leadership awards.", 
    badges: ["Academic Excellence Awards", "Leadership Bootcamp", "Empowerment Summit"] 
  },
  { 
    key: "E", 
    theme: "Echo Of Ideas", 
    color: "#cc1111", 
    glow: "#ff4444", 
    bgHex: 0xcc1111, 
    symbol: "Spark", 
    desc: "A resonance of intellect. Creating waves of thoughts, brainstorming social initiatives, and nurturing an entrepreneurial fire that hits different.", 
    badges: ["Idea Pitch Deck", "Social Entrepreneurship Panel", "Student Innovation Lab"] 
  },
  { 
    key: "R", 
    theme: "Reflection", 
    color: "#3300aa", 
    glow: "#6644ff", 
    bgHex: 0x3300aa, 
    symbol: "Mirror", 
    desc: "Contemplating the depths. Mirroring our past to design our future. A space of quiet contemplation, literary evaluation, and self-discovery.", 
    badges: ["Literary Review Circle", "Mindfulness Retreat", "Critique Desk"] 
  },
  { 
    key: "E2", 
    theme: "Express Your Opinion", 
    color: "#ff3388", 
    glow: "#ff77bb", 
    bgHex: 0xff3388, 
    symbol: "Bubble", 
    desc: "Your voice is your power. Open discussion boards, interactive forums, and chat spaces designed to cultivate critical thinking and civil discourse.", 
    badges: ["District Debate Championship", "Media Panel Discussion", "Creative Writers Desk"] 
  },
  { 
    key: "N", 
    theme: "Nurture New Ideas", 
    color: "#00cc44", 
    glow: "#55ff99", 
    bgHex: 0x00cc44, 
    symbol: "Seed", 
    desc: "Cultivating the seeds of tomorrow. Providing resources, mentoring, and support to young minds to grow their organic concepts into social realities.", 
    badges: ["Start-Up Mentorship", "Eco-Green Initiatives", "Young Scholars Fellowship"] 
  },
  { 
    key: "T2", 
    theme: "Timeless", 
    color: "#ffaa00", 
    glow: "#ffdd44", 
    bgHex: 0xffaa00, 
    symbol: "Archway", 
    desc: "The synthesis of our journey. All letters assemble under the golden archway of Sahithyotsav. A testament that different voices, when united, hit different.", 
    badges: ["Sahithyotsav Finale Grand Arch", "Awards Ceremony", "Cultural Harmony Night"] 
  }
];

export default function HitsDifferent() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [loaded, setLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loaderAudioChoice, setLoaderAudioChoice] = useState(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [svgAssets, setSvgAssets] = useState(null);

  const { audioEnabled, toggleAudio, startAudio, audioCtxRef, droneNodeRef } = useAudioAmbient();

  // Lerp variables for smooth scrolling
  const targetScroll = useRef(0);
  const currentScroll = useRef(0);

  // 1. Disable body scrolling when welcoming entry portal is active
  useEffect(() => {
    if (!loaded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [loaded]);

  // 2. Load SVG assets on mount
  useEffect(() => {
    const loadAllSVGs = async () => {
      const loader = new SVGLoader();
      const fileMapping = [
        { key: "H", url: "/images/h.svg" },
        { key: "I", url: "/images/i.svg" },
        { key: "T", url: "/images/t.svg" },
        { key: "S", url: "/images/s.svg" },
        { key: "D", url: "/images/d.svg" },
        { key: "I2", url: "/images/ii.svg" },
        { key: "F", url: "/images/f.svg" },
        { key: "F2", url: "/images/ff.svg" },
        { key: "E", url: "/images/e.svg" },
        { key: "R", url: "/images/r.svg" },
        { key: "E2", url: "/images/ee.svg" },
        { key: "N", url: "/images/n.svg" },
        { key: "T2", url: "/images/tt.svg" }
      ];

      const loadedData = {};
      let completedCount = 0;

      const loadSingle = (item) => {
        return new Promise((resolve) => {
          loader.load(
            item.url,
            (data) => {
              completedCount++;
              setLoadingProgress(Math.floor((completedCount / fileMapping.length) * 100));
              resolve({ key: item.key, paths: data.paths });
            },
            undefined,
            (err) => {
              console.error(`Failed to load SVG for ${item.key}:`, err);
              completedCount++;
              setLoadingProgress(Math.floor((completedCount / fileMapping.length) * 100));
              resolve({ key: item.key, paths: [] });
            }
          );
        });
      };

      const results = await Promise.all(fileMapping.map(loadSingle));
      results.forEach(res => {
        loadedData[res.key] = res.paths;
      });

      setSvgAssets(loadedData);
    };

    loadAllSVGs();
  }, []);

  // 3. Three.js initialization and tick loop execution
  useEffect(() => {
    if (!loaded || !svgAssets) return;

    // ═══════════════════════════════════════════════════
    // THREE.JS SYSTEM
    // ═══════════════════════════════════════════════════
    let scene, camera, renderer;
    let animationFrameId;
    let clock = new THREE.Clock();

    // Scene variables
    const letterGroups = [];
    const sceneryObjects = {
      rings: [],
      books: [],
      bubbles: [],
      sprouts: [],
      ripples: [],
      birds: [],
      compassNeedle: null
    };

    const initThree = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x050706);
      scene.fog = new THREE.FogExp2(0x050706, 0.003);

      camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 4000);
      
      renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
      scene.add(ambientLight);

      // Main directional sun light
      const sunLight = new THREE.DirectionalLight(0xfff0dd, 2.5);
      sunLight.position.set(20, 100, 20);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 1024;
      sunLight.shadow.mapSize.height = 1024;
      scene.add(sunLight);

      // ═══════════════════════════════════════════════════
      // CAMERA RAIL SPLINE PATH Setup
      // ═══════════════════════════════════════════════════
      const roadPoints = [];
      const numLetters = letterData.length;
      
      // Let's create a beautiful curved pathway along the Z axis
      for (let i = 0; i <= numLetters + 2; i++) {
        const z = i * 220; // 220 units distance between scenes
        const x = Math.sin(i * 0.75) * 35; // curved road S-pattern
        const y = 0; // road sits flat
        roadPoints.push(new THREE.Vector3(x, y, z));
      }
      const roadSpline = new THREE.CatmullRomCurve3(roadPoints);

      // Create glowing double guide rails for the pathway
      const leftRailPts = [];
      const rightRailPts = [];
      const steps = 150;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const pt = roadSpline.getPointAt(t);
        const tangent = roadSpline.getTangentAt(t);
        const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
        
        leftRailPts.push(pt.clone().addScaledVector(normal, -3.5));
        rightRailPts.push(pt.clone().addScaledVector(normal, 3.5));
      }
      
      const leftRailGeom = new THREE.BufferGeometry().setFromPoints(leftRailPts);
      const rightRailGeom = new THREE.BufferGeometry().setFromPoints(rightRailPts);
      const railMat = new THREE.LineBasicMaterial({
        color: 0xa97843,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending
      });
      
      const leftLine = new THREE.Line(leftRailGeom, railMat);
      const rightLine = new THREE.Line(rightRailGeom, railMat);
      scene.add(leftLine, rightLine);

      // ═══════════════════════════════════════════════════
      // EXTRUDE SVG LETTERS & PLACE ALONG THE ROAD
      // ═══════════════════════════════════════════════════
      const finalArchCenter = new THREE.Vector3(0, 14, numLetters * 220 + 80);

      letterData.forEach((data, index) => {
        const letterGroup = new THREE.Group();
        letterGroup.name = `letter_${data.key}`;

        const paths = svgAssets[data.key] || [];
        const themeColor = new THREE.Color(data.color);
        const strokeColor = new THREE.Color(data.glow);

        if (paths.length > 0) {
          paths.forEach((path, pathIdx) => {
            const shapes = SVGLoader.createShapes(path);
            shapes.forEach(shape => {
              const extrudeSettings = {
                depth: 3 + pathIdx * 0.6, // depth layered thickness
                bevelEnabled: true,
                bevelSegments: 4,
                steps: 1,
                bevelSize: 0.25,
                bevelThickness: 0.25
              };

              // Reflective material
              const material = new THREE.MeshStandardMaterial({
                color: themeColor,
                metalness: 0.9,
                roughness: 0.15,
                emissive: themeColor.clone().multiplyScalar(0.18),
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.95
              });

              const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
              geometry.center();

              const mesh = new THREE.Mesh(geometry, material);
              mesh.castShadow = true;
              mesh.receiveShadow = true;
              
              // Parallax depth positioning inside letter
              mesh.position.z = (pathIdx - paths.length / 2) * 0.8;
              letterGroup.add(mesh);

              // Glowing contours
              const edges = new THREE.EdgesGeometry(geometry);
              const lineMat = new THREE.LineBasicMaterial({
                color: strokeColor,
                transparent: true,
                opacity: 0.75,
                blending: THREE.AdditiveBlending
              });
              const line = new THREE.LineSegments(edges, lineMat);
              line.position.copy(mesh.position);
              letterGroup.add(line);
            });
          });

          // Center the group children
          const box = new THREE.Box3().setFromObject(letterGroup);
          const center = new THREE.Vector3();
          box.getCenter(center);
          letterGroup.children.forEach(child => {
            child.position.sub(center);
          });

          // Scale letters dynamically (standard height of ~10 units)
          const size = new THREE.Vector3();
          box.setFromObject(letterGroup).getSize(size);
          const maxDim = Math.max(size.x, size.y);
          const scale = 11.5 / maxDim;
          letterGroup.scale.set(scale, -scale, scale);
        } else {
          // Fallback box shape if SVG is missing
          const geom = new THREE.BoxGeometry(7, 11, 2);
          const mat = new THREE.MeshStandardMaterial({ color: themeColor, metalness: 0.8 });
          const m = new THREE.Mesh(geom, mat);
          letterGroup.add(m);
        }

        // Add light cone (volumetric spotlight look)
        const coneGeom = new THREE.ConeGeometry(8, 30, 16, 1, true);
        const coneMat = new THREE.MeshBasicMaterial({
          color: themeColor,
          transparent: true,
          opacity: 0.08,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          depthWrite: false
        });
        const cone = new THREE.Mesh(coneGeom, coneMat);
        cone.rotation.x = Math.PI; // point down
        cone.position.set(0, 5, 0);
        letterGroup.add(cone);

        // Add local point light for dynamic ground glow
        const ptLight = new THREE.PointLight(themeColor, 8, 40);
        ptLight.position.set(0, -6, 2);
        letterGroup.add(ptLight);

        // Compute original road coordinates
        const progress_k = 0.04 + index * 0.07 + 0.035; // center of that letter section
        const letterRoadPos = roadSpline.getPointAt(progress_k);
        const tangent = roadSpline.getTangentAt(progress_k);
        const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
        
        // Offset letter to the right side of the road
        const originalPos = letterRoadPos.clone().addScaledVector(normal, 5.5);
        originalPos.y = 8; // floating height
        
        letterGroup.position.copy(originalPos);
        
        // Rotation to face the camera along the road rails
        const rotY = -Math.atan2(tangent.x, tangent.z) + Math.PI / 2;
        letterGroup.rotation.y = rotY;

        // Store original values for interpolation
        letterGroup.userData = {
          key: data.key,
          index: index,
          originalPos: originalPos.clone(),
          originalRot: new THREE.Euler(0, rotY, 0),
          floatOffset: Math.random() * 50
        };

        scene.add(letterGroup);
        letterGroups.push(letterGroup);

        // ═══════════════════════════════════════════════════
        // SCENERY OBJECTS FOR SPECIFIC ZONES
        // ═══════════════════════════════════════════════════
        
        // H: Stone gateway behind it
        if (data.key === "H") {
          const arch = new THREE.Group();
          const pillarGeom = new THREE.BoxGeometry(1.5, 16, 1.5);
          const topGeom = new THREE.BoxGeometry(11, 1.5, 2.5);
          const stoneMat = new THREE.MeshStandardMaterial({ color: 0x1f1912, roughness: 0.95 });
          
          const lp = new THREE.Mesh(pillarGeom, stoneMat);
          lp.position.set(-5, 8, 0);
          const rp = new THREE.Mesh(pillarGeom, stoneMat);
          rp.position.set(5, 8, 0);
          const ts = new THREE.Mesh(topGeom, stoneMat);
          ts.position.set(0, 16, 0);
          
          arch.add(lp, rp, ts);
          arch.position.copy(originalPos).add(new THREE.Vector3(-1, -8, -2.5));
          arch.rotation.y = rotY;
          scene.add(arch);
        }

        // I: Sound waves
        if (data.key === "I") {
          const ringGeom = new THREE.TorusGeometry(6, 0.08, 8, 32);
          const ringMat = new THREE.MeshBasicMaterial({ color: 0x0072ff, transparent: true, opacity: 0.35 });
          for (let r = 0; r < 3; r++) {
            const ring = new THREE.Mesh(ringGeom, ringMat);
            ring.rotation.x = Math.PI / 2;
            ring.position.copy(originalPos);
            ring.scale.setScalar(0.3 + r * 0.45);
            scene.add(ring);
            sceneryObjects.rings.push({ mesh: ring, baseScale: 0.3 + r * 0.45 });
          }
        }

        // T: Career Compass + Split pathway
        if (data.key === "T") {
          const compass = new THREE.Group();
          const dialGeom = new THREE.TorusGeometry(3.5, 0.12, 8, 32);
          const dialMat = new THREE.MeshStandardMaterial({ color: 0x00aa44, metalness: 0.7 });
          const dial = new THREE.Mesh(dialGeom, dialMat);
          dial.rotation.x = Math.PI / 2;
          compass.add(dial);

          const pointerGeom = new THREE.ConeGeometry(0.3, 3, 4);
          const pointerMat = new THREE.MeshBasicMaterial({ color: 0x44ff88 });
          const pointer = new THREE.Mesh(pointerGeom, pointerMat);
          pointer.rotation.x = Math.PI / 2;
          pointer.position.y = 0.1;
          compass.add(pointer);
          sceneryObjects.compassNeedle = pointer;

          compass.position.copy(originalPos).add(new THREE.Vector3(-4, -6, -2));
          scene.add(compass);
        }

        // S: Ripple
        if (data.key === "S") {
          const ripGeom = new THREE.RingGeometry(0.1, 5, 32);
          const ripMat = new THREE.MeshBasicMaterial({
            color: 0xff44aa,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
          });
          const rip = new THREE.Mesh(ripGeom, ripMat);
          rip.rotation.x = -Math.PI / 2;
          rip.position.copy(originalPos);
          rip.position.y = 0.1;
          scene.add(rip);
          sceneryObjects.ripples.push(rip);
        }

        // D: Floating books + Glass portal behind
        if (data.key === "D") {
          // Glass Portal
          const portGeom = new THREE.PlaneGeometry(9, 14);
          const portMat = new THREE.MeshPhysicalMaterial({
            color: 0x8800ff,
            transparent: true,
            opacity: 0.3,
            roughness: 0.05,
            metalness: 0.1,
            transmission: 0.85,
            thickness: 1.2,
            side: THREE.DoubleSide
          });
          const portal = new THREE.Mesh(portGeom, portMat);
          portal.position.copy(originalPos).add(new THREE.Vector3(-0.5, 0, -2));
          portal.rotation.y = rotY;
          scene.add(portal);

          // Books
          const bookGeom = new THREE.BoxGeometry(1.2, 1.6, 0.25);
          const bookMat = new THREE.MeshStandardMaterial({ color: 0x8800ff, roughness: 0.7 });
          for (let b = 0; b < 5; b++) {
            const book = new THREE.Mesh(bookGeom, bookMat);
            book.position.copy(originalPos).add(new THREE.Vector3(
              (Math.random() - 0.5) * 8,
              (Math.random() - 0.5) * 6 - 1,
              (Math.random() - 0.5) * 4
            ));
            book.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
            scene.add(book);
            sceneryObjects.books.push(book);
          }
        }

        // I2: Additional theatrical spotlight beams
        if (data.key === "I2") {
          const beamGeom = new THREE.ConeGeometry(2.5, 30, 16, 1, true);
          const beamMat = new THREE.MeshBasicMaterial({
            color: 0xff4477,
            transparent: true,
            opacity: 0.15,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false
          });
          const b1 = new THREE.Mesh(beamGeom, beamMat);
          b1.position.copy(originalPos).add(new THREE.Vector3(-10, 12, -2));
          b1.rotation.z = -Math.PI / 6;

          const b2 = new THREE.Mesh(beamGeom, beamMat);
          b2.position.copy(originalPos).add(new THREE.Vector3(10, 12, -2));
          b2.rotation.z = Math.PI / 6;

          scene.add(b1, b2);
        }

        // F: Islamic geometric octagon frame behind it
        if (data.key === "F") {
          const panel = new THREE.Group();
          const frameGeom = new THREE.RingGeometry(5.5, 5.7, 8);
          const frameMat = new THREE.MeshBasicMaterial({ color: 0x66ff88, side: THREE.DoubleSide });
          const oct = new THREE.Mesh(frameGeom, frameMat);
          panel.add(oct);

          const starGeom = new THREE.RingGeometry(3.5, 3.65, 8);
          const star = new THREE.Mesh(starGeom, frameMat);
          star.rotation.z = Math.PI / 8;
          panel.add(star);

          panel.position.copy(originalPos).add(new THREE.Vector3(0, 0, -2.5));
          panel.rotation.y = rotY;
          scene.add(panel);
        }

        // F2: Helical stone staircase
        if (data.key === "F2") {
          const stairs = new THREE.Group();
          const stepGeom = new THREE.BoxGeometry(2.8, 0.4, 1.2);
          const stepMat = new THREE.MeshStandardMaterial({ color: 0x554411, roughness: 0.9 });
          
          for (let s = 0; s < 7; s++) {
            const step = new THREE.Mesh(stepGeom, stepMat);
            // Spiral distribution offset
            const angle = s * 0.45;
            const radius = 3.5;
            step.position.set(Math.cos(angle) * radius - 2, s * 0.8 - 5, Math.sin(angle) * radius - 2);
            step.rotation.y = -angle;
            stairs.add(step);
          }
          stairs.position.copy(originalPos);
          stairs.rotation.y = rotY;
          scene.add(stairs);
        }

        // E2: Conversation Bubbles
        if (data.key === "E2") {
          const bubbleShape = new THREE.Shape();
          bubbleShape.absarc(0, 0, 1.2, 0, Math.PI * 2);
          bubbleShape.moveTo(-0.4, -1.0);
          bubbleShape.lineTo(-0.9, -1.7);
          bubbleShape.lineTo(0.1, -1.1);

          const bExtrude = { depth: 0.3, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.08, bevelThickness: 0.08 };
          const bGeom = new THREE.ExtrudeGeometry(bubbleShape, bExtrude);
          const bMat = new THREE.MeshStandardMaterial({ color: 0xff77bb, metalness: 0.4, roughness: 0.3 });
          
          for (let b = 0; b < 3; b++) {
            const bub = new THREE.Mesh(bGeom, bMat);
            bub.position.copy(originalPos).add(new THREE.Vector3(
              (Math.random() - 0.5) * 7,
              (Math.random() - 0.5) * 5 + 1,
              (Math.random() - 0.5) * 3
            ));
            bub.rotation.y = rotY;
            scene.add(bub);
            sceneryObjects.bubbles.push(bub);
          }
        }

        // N: Sprouting vines
        if (data.key === "N") {
          const sproutGroup = new THREE.Group();
          for (let j = 0; j < 3; j++) {
            const curvePts = [
              new THREE.Vector3(0, -6, 0),
              new THREE.Vector3(Math.sin(j * 2) * 1.5, -2, Math.cos(j * 2) * 1.5),
              new THREE.Vector3(Math.sin(j * 2.5) * 3, 2, Math.cos(j * 2.5) * 3)
            ];
            const sprCurve = new THREE.CatmullRomCurve3(curvePts);
            const sprGeom = new THREE.TubeGeometry(sprCurve, 20, 0.15, 8, false);
            const sprMat = new THREE.MeshStandardMaterial({ color: 0x55ff99, roughness: 0.7 });
            const spr = new THREE.Mesh(sprGeom, sprMat);
            sproutGroup.add(spr);
            sceneryObjects.sprouts.push(spr);
          }
          sproutGroup.position.copy(originalPos);
          sproutGroup.rotation.y = rotY;
          scene.add(sproutGroup);
        }
      });

      // ═══════════════════════════════════════════════════
      // MASSIVE GLOBAL DRIFTING PARTICLES
      // ═══════════════════════════════════════════════════
      const pCount = 1200;
      const pGeom = new THREE.BufferGeometry();
      const pPosArray = new Float32Array(pCount * 3);
      const pColArray = new Float32Array(pCount * 3);

      const colorPalette = [
        new THREE.Color(0xff7a00), // Orange
        new THREE.Color(0x0072ff), // Blue
        new THREE.Color(0x00aa44), // Green
        new THREE.Color(0xff44aa), // Pink
        new THREE.Color(0x8800ff)  // Purple
      ];

      for (let i = 0; i < pCount * 3; i += 3) {
        pPosArray[i] = (Math.random() - 0.5) * 150;      // X
        pPosArray[i + 1] = Math.random() * 45 + 1;       // Y
        pPosArray[i + 2] = Math.random() * (numLetters * 220 + 200); // Z distribute
        
        const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        pColArray[i] = col.r;
        pColArray[i + 1] = col.g;
        pColArray[i + 2] = col.b;
      }

      pGeom.setAttribute("position", new THREE.BufferAttribute(pPosArray, 3));
      pGeom.setAttribute("color", new THREE.BufferAttribute(pColArray, 3));

      const pMat = new THREE.PointsMaterial({
        size: 0.8,
        vertexColors: true,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending
      });

      const particleSystem = new THREE.Points(pGeom, pMat);
      scene.add(particleSystem);

      // ═══════════════════════════════════════════════════
      // FLOCK OF BIRDS (Finale T2 scene)
      // ═══════════════════════════════════════════════════
      const birdFlock = new THREE.Group();
      const wingG = new THREE.PlaneGeometry(1.2, 0.5);
      const wingM = new THREE.MeshBasicMaterial({ color: 0xffdd66, side: THREE.DoubleSide });

      for (let b = 0; b < 12; b++) {
        const singleBird = new THREE.Group();
        const lw = new THREE.Mesh(wingG, wingM);
        lw.position.x = -0.6;
        const rw = new THREE.Mesh(wingG, wingM);
        rw.position.x = 0.6;
        singleBird.add(lw, rw);

        singleBird.position.set(
          (Math.random() - 0.5) * 45,
          25 + Math.random() * 15,
          finalArchCenter.z - 100 + Math.random() * 80
        );

        singleBird.userData = {
          lw,
          rw,
          speed: 0.15 + Math.random() * 0.1,
          offset: Math.random() * 10
        };

        birdFlock.add(singleBird);
        sceneryObjects.birds.push(singleBird);
      }
      scene.add(birdFlock);

      // Final illuminated sun sphere
      const sunGeom = new THREE.SphereGeometry(45, 32, 32);
      const sunMat = new THREE.MeshBasicMaterial({ color: 0xfff3d0 });
      const sunMesh = new THREE.Mesh(sunGeom, sunMat);
      sunMesh.position.copy(finalArchCenter).add(new THREE.Vector3(0, 10, 150));
      scene.add(sunMesh);

      // ═══════════════════════════════════════════════════
      // PLATEAU SCROLL CURVE MAPPING
      // ═══════════════════════════════════════════════════
      const getPlateauProgress = (progress) => {
        if (progress < 0.04) return progress;
        if (progress > 0.94) return progress;
        
        const adjusted = progress - 0.04;
        const step = Math.floor(adjusted / 0.07);
        const local = (adjusted / 0.07) % 1.0;
        
        // Pause in the middle of each step segment
        let smoothLocal;
        if (local < 0.25) {
          smoothLocal = (local / 0.25) * 0.35;
        } else if (local < 0.75) {
          smoothLocal = 0.35 + ((local - 0.25) / 0.5) * 0.3; // slow crawl plateau
        } else {
          smoothLocal = 0.65 + ((local - 0.75) / 0.25) * 0.35;
        }
        
        return 0.04 + (step + smoothLocal) * 0.07;
      };

      // ═══════════════════════════════════════════════════
      // ANIMATION / TICK LOOP
      // ═══════════════════════════════════════════════════
      const tick = () => {
        const elapsedTime = clock.getElapsedTime();

        // 1. Lerped scrolling updates
        currentScroll.current += (targetScroll.current - currentScroll.current) * 0.042;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const rawProgress = scrollHeight > 0 ? Math.min(Math.max(currentScroll.current / scrollHeight, 0), 1) : 0;
        
        // Map scrolling to plateau progress
        const p = getPlateauProgress(rawProgress);

        // 2. Camera rails mapping
        const camPos = roadSpline.getPointAt(p);
        const tangent = roadSpline.getTangentAt(p);
        const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

        // Camera stays offset to left side of road rails, looking towards letters on right side
        const cameraPos = camPos.clone()
          .addScaledVector(normal, -11)
          .add(new THREE.Vector3(0, 9, 0));
        
        const targetLookAt = camPos.clone().addScaledVector(normal, 3);

        // 3. Finale Assembly Scene Interpolations
        if (rawProgress >= 0.86) {
          const t = Math.min((rawProgress - 0.86) / 0.08, 1.0); // complete arch assembly
          
          // Animate camera to pull back dramatically
          const pullBackCam = finalArchCenter.clone().add(new THREE.Vector3(0, 18, -120));
          const pullBackLook = finalArchCenter.clone().add(new THREE.Vector3(0, 3, 0));
          
          camera.position.lerp(pullBackCam, t);
          camera.lookAt(pullBackLook);

          // Position letters in an arched semicircle
          const radius = 22;
          const startAngle = -Math.PI * 0.55;
          const endAngle = Math.PI * 0.55;

          letterGroups.forEach((letterGroup, idx) => {
            const angle = startAngle + (idx / (numLetters - 1)) * (endAngle - startAngle);
            const archOffset = new THREE.Vector3(
              Math.sin(angle) * radius,
              Math.cos(angle) * radius + 5,
              -Math.abs(Math.sin(angle)) * 3.5
            );
            const targetPos = finalArchCenter.clone().add(archOffset);
            const targetRot = new THREE.Euler(0, -angle * 0.5, 0);

            letterGroup.position.lerp(targetPos, 0.08);
            
            letterGroup.rotation.x = THREE.MathUtils.lerp(letterGroup.rotation.x, targetRot.x, 0.08);
            letterGroup.rotation.y = THREE.MathUtils.lerp(letterGroup.rotation.y, targetRot.y, 0.08);
            letterGroup.rotation.z = THREE.MathUtils.lerp(letterGroup.rotation.z, targetRot.z, 0.08);
          });
        } else {
          // Standard flight logic
          camera.position.copy(cameraPos);
          camera.lookAt(targetLookAt);

          // Standard floating letters logic
          letterGroups.forEach((letterGroup) => {
            const fTime = elapsedTime + letterGroup.userData.floatOffset;
            const floatY = Math.sin(fTime * 1.3) * 0.38;
            
            const destPos = letterGroup.userData.originalPos.clone();
            destPos.y += floatY;
            
            letterGroup.position.lerp(destPos, 0.1);
            
            const destRot = letterGroup.userData.originalRot;
            letterGroup.rotation.x = THREE.MathUtils.lerp(letterGroup.rotation.x, destRot.x, 0.1);
            letterGroup.rotation.y = THREE.MathUtils.lerp(letterGroup.rotation.y, destRot.y, 0.1);
            letterGroup.rotation.z = THREE.MathUtils.lerp(letterGroup.rotation.z, destRot.z, 0.1);
          });
        }

        // 4. Scenery Objects animations
        // Rings
        sceneryObjects.rings.forEach(ring => {
          const scaleOffset = (elapsedTime * 0.8) % 1.5;
          ring.mesh.scale.setScalar(ring.baseScale + scaleOffset);
        });

        // Compass pointer jitter
        if (sceneryObjects.compassNeedle) {
          sceneryObjects.compassNeedle.rotation.z = Math.sin(elapsedTime * 2.5) * 0.45;
        }

        // Ripple pulse
        sceneryObjects.ripples.forEach(rip => {
          const scale = 1.0 + (elapsedTime % 2.0) * 1.5;
          rip.scale.setScalar(scale);
          rip.material.opacity = Math.max(0.4 - (elapsedTime % 2.0) * 0.2, 0);
        });

        // Books float and sway
        sceneryObjects.books.forEach((book, idx) => {
          book.rotation.y += 0.005;
          book.position.y += Math.sin(elapsedTime * 1.2 + idx) * 0.015;
        });

        // Talk bubbles float
        sceneryObjects.bubbles.forEach((bub, idx) => {
          bub.position.y += Math.cos(elapsedTime * 1.5 + idx) * 0.012;
        });

        // Sprouting vine scale animations
        sceneryObjects.sprouts.forEach((spr, idx) => {
          const distance = Math.abs(camera.position.z - spr.position.z);
          const growth = Math.max(0.01, Math.min(1.0, 1.8 - distance / 220));
          spr.scale.set(growth, growth, growth);
        });

        // Global drifting particles movement
        const posArray = particleSystem.geometry.attributes.position.array;
        for (let i = 0; i < pCount * 3; i += 3) {
          posArray[i + 1] += Math.sin(elapsedTime + posArray[i]) * 0.012;
          posArray[i] += Math.cos(elapsedTime + posArray[i + 2]) * 0.008;
        }
        particleSystem.geometry.attributes.position.needsUpdate = true;

        // Birds wing flap & flight
        sceneryObjects.birds.forEach(bird => {
          const flap = Math.sin(elapsedTime * 9 + bird.userData.offset) * 0.65;
          bird.userData.lw.rotation.z = flap;
          bird.userData.rw.rotation.z = -flap;
          
          bird.position.z += bird.userData.speed;
          if (bird.position.z > finalArchCenter.z + 120) {
            bird.position.z = finalArchCenter.z - 180;
          }
        });

        // 5. Dynamic Soundscape adjustments
        if (audioCtxRef.current && audioCtxRef.current.state === "running" && droneNodeRef.current) {
          const frequencyValue = 55 + rawProgress * 55;
          droneNodeRef.current.osc1.frequency.setValueAtTime(frequencyValue, audioCtxRef.current.currentTime);
          droneNodeRef.current.osc2.frequency.setValueAtTime(frequencyValue * 2, audioCtxRef.current.currentTime);
        }

        // 6. HUD / OVERLAY STATE UPDATES
        if (rawProgress < 0.04) {
          setCurrentSceneIndex(0);
        } else if (rawProgress > 0.94) {
          setCurrentSceneIndex(14);
        } else {
          const index = Math.floor((rawProgress - 0.04) / 0.07) + 1;
          setCurrentSceneIndex(Math.min(index, 13));
        }

        // 7. Dynamic Atmosphere transition (fog & background washes)
        let targetBg = new THREE.Color(0x050706);
        let targetFog = new THREE.Color(0x050706);
        let targetFogDensity = 0.0035;

        const currentActive = Math.floor((rawProgress - 0.04) / 0.07) + 1;
        if (rawProgress >= 0.04 && rawProgress <= 0.94 && letterData[currentActive - 1]) {
          const activeItem = letterData[currentActive - 1];
          const col = new THREE.Color(activeItem.color);
          targetBg.copy(col).multiplyScalar(0.04); 
          targetFog.copy(col).multiplyScalar(0.03); 
          targetFogDensity = 0.0055; 
        } else if (rawProgress > 0.94) {
          targetBg.setHex(0x130e06);
          targetFog.setHex(0x130e06);
          targetFogDensity = 0.0018; 
        }

        scene.background.lerp(targetBg, 0.04);
        scene.fog.color.lerp(targetFog, 0.04);
        scene.fog.density += (targetFogDensity - scene.fog.density) * 0.04;

        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(tick);
      };

      tick();
    };

    initThree();

    // Scroll capture
    const handleScroll = () => {
      targetScroll.current = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll);

    // Resize handler
    const handleResize = () => {
      if (!camera || !renderer) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      active = false;
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (renderer) {
        renderer.dispose();
      }
    };
  }, [loaded]);

  return (
    <div ref={containerRef} className="relative w-full min-h-[1550vh] bg-[#050706]">
      {/* ═══════════════════════════════════════════════════
         CINEMATIC ENTRY PORTAL
         ═══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {!loaded && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1.4 } }}
            className="fixed inset-0 z-[100] bg-[#050706] flex flex-col items-center justify-center p-6 border-4 border-double border-[#A97843]/30"
          >
            {/* Vintage Corners */}
            <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-[#A97843]/20"></div>
            <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-[#A97843]/20"></div>
            <div className="absolute bottom-8 left-8 w-16 h-16 border-b-2 border-l-2 border-[#A97843]/20"></div>
            <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-[#A97843]/20"></div>

            <motion.div 
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2 }}
              className="text-center max-w-xl space-y-8 z-10"
            >
              <Compass className="w-16 h-16 text-[#A97843] mx-auto animate-spin-slow mb-4 opacity-75" />
              
              <div className="space-y-3">
                <span className="text-xs uppercase tracking-[0.4em] text-[#A97843] font-semibold block">
                  SSF Kozhikode South District
                </span>
                <h1 className="text-5xl md:text-6xl font-bold tracking-wider text-[#F6F0E4] font-heading py-2">
                  HITS DIFFERENT
                </h1>
                <p className="text-xs italic text-[#F6F0E4]/60 font-serif">
                  28th Sahityotsav Immersive Digital Exhibition
                </p>
              </div>

              <div className="divider-vintage-ornamental text-[#A97843]/40"></div>

              <div className="space-y-4 font-serif italic text-sm text-[#F6F0E4]/80 px-4 leading-relaxed">
                <p>"Two roads diverged in a wood, and I—</p>
                <p>I took the one less traveled by,</p>
                <p>And that has made all the difference."</p>
              </div>

              {/* Progress and Enter controls */}
              <div className="flex flex-col items-center justify-center pt-8 space-y-4">
                {loadingProgress < 100 ? (
                  <div className="w-64 space-y-2">
                    <div className="h-1 bg-[#1A1F1C] w-full rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#A97843] transition-all duration-300"
                        style={{ width: `${loadingProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-[#F6F0E4]/40 font-heading">
                      Carving Sculptures ({loadingProgress}%)
                    </span>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                  >
                    <button
                      onClick={() => {
                        setLoaderAudioChoice(true);
                        setLoaded(true);
                        startAudio();
                      }}
                      className="px-8 py-3.5 bg-[#1D3B2A] border border-[#A97843]/50 text-[#F6F0E4] font-heading font-bold rounded-lg transition-all shadow-lg hover:bg-[#A97843] hover:text-[#0b0e0c] w-64 flex items-center justify-center gap-2 group text-sm"
                    >
                      <Volume2 size={16} /> Enter with soundscape
                    </button>
                    <button
                      onClick={() => {
                        setLoaderAudioChoice(false);
                        setLoaded(true);
                      }}
                      className="px-8 py-3.5 bg-transparent border border-[#F6F0E4]/30 text-[#F6F0E4]/80 font-heading rounded-lg hover:border-[#F6F0E4]/60 transition-all w-64 text-sm"
                    >
                      Enter silently
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════
         WEBGL RENDERING SURFACE
         ═══════════════════════════════════════════════════ */}
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-0 pointer-events-none" />

      {/* ═══════════════════════════════════════════════════
         INTERACTION OVERLAYS / EXHIBITION HUD
         ═══════════════════════════════════════════════════ */}
      {loaded && (
        <>
          {/* Top Header Utilities */}
          <div className="fixed top-8 left-8 right-8 z-50 flex justify-between items-center pointer-events-none">
            <button
              onClick={() => navigate("/")}
              className="p-3.5 rounded-full bg-[#050706]/80 border border-[#A97843]/40 text-[#A97843] hover:text-[#0b0e0c] hover:bg-[#A97843] transition-all backdrop-blur-md pointer-events-auto shadow-lg flex items-center gap-2 text-xs uppercase tracking-widest font-heading font-bold group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Portal Home</span>
            </button>

            <button
              onClick={toggleAudio}
              className="p-3.5 rounded-full bg-[#050706]/80 border border-[#A97843]/40 text-[#A97843] hover:text-[#0b0e0c] hover:bg-[#A97843] transition-all backdrop-blur-md pointer-events-auto shadow-lg"
            >
              {audioEnabled ? <Volume2 size={20} className="animate-pulse" /> : <VolumeX size={20} />}
            </button>
          </div>

          {/* Exhibition Content Hub Overlay */}
          <div className="fixed inset-0 z-10 flex flex-col justify-center items-center pointer-events-none p-6">
            <AnimatePresence mode="wait">
              {currentSceneIndex === 0 && (
                <motion.div
                  key="scene0-intro"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 1 }}
                  className="text-center max-w-3xl space-y-6 px-4"
                >
                  <span className="text-xs uppercase tracking-[0.4em] text-[#A97843]/70 font-semibold block">THE CHOICE</span>
                  <h2 className="text-3xl md:text-5xl font-serif italic text-[#F6F0E4]/95 leading-relaxed">
                    "Two roads diverged in a wood, and I—"
                  </h2>
                  <p className="text-[10px] tracking-[0.3em] text-[#F6F0E4]/40 uppercase pt-16 animate-pulse">
                    Scroll down to explore the pathway
                  </p>
                </motion.div>
              )}

              {currentSceneIndex >= 1 && currentSceneIndex <= 13 && (
                <motion.div
                  key={`scene-${currentSceneIndex}`}
                  initial={{ opacity: 0, x: -45 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 45 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="absolute bottom-12 left-6 right-6 md:left-16 md:bottom-16 max-w-lg pointer-events-auto bg-[#050706]/75 border border-[#A97843]/30 p-6 md:p-8 rounded-2xl shadow-2xl backdrop-blur-md"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[9px] uppercase tracking-[0.3em] text-[#A97843] font-bold block font-heading">
                      Symbol: {letterData[currentSceneIndex - 1].symbol}
                    </span>
                    <span className="text-[9px] font-heading font-black text-[#A97843]/60">
                      ZONE {currentSceneIndex} / 13
                    </span>
                  </div>

                  <div className="flex items-baseline gap-4 mb-4">
                    <h2 
                      className="text-6xl font-black font-heading tracking-tighter" 
                      style={{ 
                        color: letterData[currentSceneIndex - 1].color,
                        textShadow: `0 0 15px ${letterData[currentSceneIndex - 1].glow}44`
                      }}
                    >
                      {letterData[currentSceneIndex - 1].key}
                    </h2>
                    <h3 className="text-xl font-bold font-heading text-[#F6F0E4]">
                      {letterData[currentSceneIndex - 1].theme}
                    </h3>
                  </div>

                  <p className="text-sm font-serif leading-relaxed text-[#F6F0E4]/80 text-justify mb-6">
                    {letterData[currentSceneIndex - 1].desc}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {letterData[currentSceneIndex - 1].badges.map((badge, bIdx) => (
                      <span
                        key={bIdx}
                        className="text-[9px] font-heading font-semibold uppercase tracking-wider px-3 py-1 bg-[#A97843]/10 border border-[#A97843]/25 rounded-full text-[#F6F0E4]/90"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {currentSceneIndex === 14 && (
                <motion.div
                  key="scene14-outro"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2 }}
                  className="text-center max-w-4xl space-y-8 z-10 pointer-events-auto p-4"
                >
                  <span className="text-xs uppercase tracking-[0.4em] text-[#A97843] font-bold block mb-4">
                    District Sahityotsav 2026
                  </span>

                  <h2 
                    className="text-2xl md:text-3xl leading-relaxed text-[#F6F0E4]/90 font-serif"
                    style={{ fontFamily: "'Noto Serif Malayalam', serif" }}
                  >
                    വ്യത്യസ്തരായ മനുഷ്യരെ കണ്ടെത്തുകയാണ്,<br />
                    അവരെ ആഘോഷിക്കുകയാണ്<br />
                    എസ് എസ് എഫ് കോഴിക്കോട് സൗത്ത് ജില്ല സാഹിത്യോത്സവ്.
                  </h2>

                  <div className="divider-vintage-ornamental text-[#A97843]/30 max-w-xs mx-auto"></div>

                  <div className="space-y-4">
                    <h3 className="text-5xl md:text-7xl font-bold tracking-widest text-[#F6F0E4] font-heading py-2 bg-clip-text text-transparent bg-gradient-to-r from-[#A97843] via-[#ffdf6d] to-[#A97843]">
                      HITS DIFFERENT
                    </h3>
                    <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-[#F6F0E4]/60 font-heading">
                      Different Stories. Different Voices. Hits Different.
                    </p>
                  </div>

                  <div className="pt-8">
                    <button
                      onClick={() => navigate("/")}
                      className="group inline-flex items-center gap-3 px-8 py-4 bg-[#1D3B2A] border-2 border-[#A97843] text-[#F6F0E4] hover:bg-[#A97843] hover:text-[#0b0e0c] rounded-xl font-heading font-black tracking-widest transition-all duration-300 shadow-lg active:scale-95 shadow-[#A97843]/10"
                    >
                      <span>ENTER MAIN PORTAL</span>
                      <div className="w-6 h-6 rounded-full bg-[#A97843]/20 flex items-center justify-center group-hover:bg-[#0b0e0c] transition-colors">
                        <Compass size={14} className="group-hover:rotate-45 transition-transform" />
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Floating Dot Navigation Rails */}
          <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-2 pointer-events-auto bg-[#050706]/60 p-3 rounded-full border border-[#A97843]/20 backdrop-blur-md">
            {letterData.map((data, idx) => {
              const isPast = currentSceneIndex > idx;
              const isActive = currentSceneIndex === idx + 1;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
                    const targetP = 0.04 + idx * 0.07 + 0.035;
                    window.scrollTo({ top: targetP * scrollHeight, behavior: "smooth" });
                  }}
                  className="group relative flex items-center justify-center h-6.5 w-6.5"
                >
                  <span className="absolute right-9 text-[10px] font-heading font-bold uppercase tracking-wider text-[#F6F0E4] bg-[#050706] border border-[#A97843]/30 px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {data.key} - {data.theme}
                  </span>
                  
                  <div
                    className={`rounded-full transition-all duration-300 flex items-center justify-center font-heading text-[8px] font-black ${
                      isActive 
                        ? "h-5.5 w-5.5 bg-[#A97843] text-[#050706]" 
                        : isPast 
                          ? "h-2 w-2 bg-[#A97843]/55" 
                          : "h-2 w-2 bg-[#F6F0E4]/20 hover:bg-[#F6F0E4]/50"
                    }`}
                  >
                    {isActive && data.key[0]}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
