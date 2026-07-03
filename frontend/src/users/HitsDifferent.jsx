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
        try { droneNodeRef.current.osc1.stop(); } catch (e) { }
        try { droneNodeRef.current.osc2.stop(); } catch (e) { }
        try { droneNodeRef.current.lfo.stop(); } catch (e) { }
      }
      if (windNodeRef.current) {
        try { windNodeRef.current.whiteNoise.stop(); } catch (e) { }
        try { windNodeRef.current.windLfo.stop(); } catch (e) { }
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
    symbol: "The Gateway",
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
    symbol: "The Ripple",
    desc: "Every individual is an original manuscript. Leaving an indelible mark through creative writing, ink drawings, and calligraphic compositions that reflect the soul.",
    badges: ["Calligraphy Contest", "Poetry Slam", "Short Story Masterclass"]
  },
  {
    key: "D",
    theme: "Discovery",
    color: "#8800ff",
    glow: "#cc88ff",
    bgHex: 0x8800ff,
    symbol: "The Window",
    desc: "Unlocking portals of wonder. Opening windows to scientific inquiry, classical wisdom, and hidden chambers of knowledge that traditional pathways ignore.",
    badges: ["Book Fair & Reading Corner", "Science & Faith Seminar", "Young Researchers Forum"]
  },
  {
    key: "I",
    theme: "Inspire",
    color: "#ff4477",
    glow: "#ff88aa",
    bgHex: 0xff4477,
    symbol: "The Voice",
    desc: "Igniting a flame in others. Elevating the community's voice through speech, theatrical drama, and public debate under the cinematic spotlight of leadership.",
    badges: ["Elocution Grand Prix", "Sufi Devotional Music", "Youth Parliament"]
  },
  {
    key: "F",
    theme: "Faith",
    color: "#11aa33",
    glow: "#66ff88",
    bgHex: 0x11aa33,
    symbol: "The Growing Leaf",
    desc: "Spiritual roots grounding creative growth. Integrating Islamic aesthetic heritage, calligraphy, and Ghibli-esque harmony with nature to experience peace.",
    badges: ["Fiqh Seminars", "Islamic Arts & Calligraphy", "Echoes of Sufism"]
  },
  {
    key: "F",
    theme: "Forward",
    color: "#ffcc00",
    glow: "#ffee66",
    bgHex: 0xffcc00,
    symbol: "The Turning Point",
    desc: "The staircase of progress. Ascending step by step towards educational excellence, academic accomplishments, and community leadership awards.",
    badges: ["Academic Excellence Awards", "Leadership Bootcamp", "Empowerment Summit"]
  },
  {
    key: "E",
    theme: "Echo Of Ideas",
    color: "#cc1111",
    glow: "#ff4444",
    bgHex: 0xcc1111,
    symbol: "The Waves",
    desc: "A resonance of intellect. Creating waves of thoughts, brainstorming social initiatives, and nurturing an entrepreneurial fire that hits different.",
    badges: ["Idea Pitch Deck", "Social Entrepreneurship Panel", "Student Innovation Lab"]
  },
  {
    key: "R",
    theme: "Reflection",
    color: "#3300aa",
    glow: "#6644ff",
    bgHex: 0x3300aa,
    symbol: "The Mirror",
    desc: "Contemplating the depths. Mirroring our past to design our future. A space of quiet contemplation, literary evaluation, and self-discovery.",
    badges: ["Literary Review Circle", "Mindfulness Retreat", "Critique Desk"]
  },
  {
    key: "E",
    theme: "Express Your Opinion",
    color: "#ff3388",
    glow: "#ff77bb",
    bgHex: 0xff3388,
    symbol: "The Conversation",
    desc: "Your voice is your power. Open discussion boards, interactive forums, and chat spaces designed to cultivate critical thinking and civil discourse.",
    badges: ["District Debate Championship", "Media Panel Discussion", "Creative Writers Desk"]
  },
  {
    key: "N",
    theme: "Nurture New Ideas",
    color: "#00cc44",
    glow: "#55ff99",
    bgHex: 0x00cc44,
    symbol: "The Growing Plant",
    desc: "Cultivating the seeds of tomorrow. Providing resources, mentoring, and support to young minds to grow their organic concepts into social realities.",
    badges: ["Start-Up Mentorship", "Eco-Green Initiatives", "Young Scholars Fellowship"]
  },
  {
    key: "T",
    theme: "Timeless",
    color: "#ffaa00",
    glow: "#ffdd44",
    bgHex: 0xffaa00,
    symbol: "The Milestone",
    desc: "The synthesis of our journey. All letters assemble under the golden archway of Sahithyotsav. A testament that different voices, when united, hit different.",
    badges: ["Sahithyotsav Finale Grand Arch", "Awards Ceremony", "Cultural Harmony Night"]
  }
];

// Tilt rotations for the editorial cards
const cardRotations = [-5, 6, 0, -6, 7, 0, -5, 6, 0, -6, 8, 0, 5];

export default function HitsDifferent() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const svgConnectorRef = useRef(null);
  const connectorDotRef = useRef(null);

  const [loaded, setLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loaderAudioChoice, setLoaderAudioChoice] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);

  const { audioEnabled, toggleAudio, startAudio, audioCtxRef, droneNodeRef } = useAudioAmbient();

  // Lerp variables for smooth scrolling
  const targetScroll = useRef(0);
  const currentScroll = useRef(0);
  const [svgAssets, setSvgAssets] = useState(null);

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
        { key: "I", url: "/images/ii.svg" },
        { key: "F", url: "/images/f.svg" },
        { key: "F", url: "/images/ff.svg" },
        { key: "E", url: "/images/e.svg" },
        { key: "R", url: "/images/r.svg" },
        { key: "E", url: "/images/ee.svg" },
        { key: "N", url: "/images/n.svg" },
        { key: "T", url: "/images/tt.svg" }
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
    let archLineMesh = null;

    // References to dynamically animated sub-elements inside the letter groups
    const sceneryAnims = {
      rings: [],
      books: [],
      bubbles: [],
      sprouts: [],
      ripples: [],
      birds: [],
      compassNeedle: null
    };

    // Flat horizontal semicircle layout options
    const radius = 22;
    const archCenter = new THREE.Vector3(0, -3.5, -12);

    // Arch Positioning logic (Horizontal Semicircular Stage)
    const getArchPosition = (index, total = 13) => {
      const isMobile = window.innerWidth < 768;
      const currentRadius = isMobile ? 12 : 22;
      const currentCenterZ = isMobile ? -8 : -12;
      const startAngle = Math.PI * 0.94;
      const endAngle = Math.PI * 0.06;
      const angle = startAngle - (index / (total - 1)) * (startAngle - endAngle);

      const x = archCenter.x + Math.cos(angle) * currentRadius;
      const z = currentCenterZ - Math.sin(angle) * currentRadius * 0.65;
      const y = -0.9; // bottom of 5.2 height letter stands on floor Y = -3.5

      const normal = new THREE.Vector3(0, 1, 0); // letters lift straight UP

      return {
        pos: new THREE.Vector3(x, y, z),
        normal
      };
    };

    const recreateArchLine = () => {
      if (archLineMesh) scene.remove(archLineMesh);

      const curvePoints = [];
      const divisions = 80;
      for (let i = 0; i <= divisions; i++) {
        curvePoints.push(getArchPosition((i / divisions) * 12).pos);
      }

      const archCurve = new THREE.CatmullRomCurve3(curvePoints);
      const archGeom = new THREE.TubeGeometry(archCurve, 80, 0.04, 6, false);
      const archMat = new THREE.MeshStandardMaterial({
        color: 0xffaa00,
        emissive: 0xffaa00,
        emissiveIntensity: 1.5,
        transparent: true,
        opacity: 0.6
      });

      archLineMesh = new THREE.Mesh(archGeom, archMat);
      scene.add(archLineMesh);
    };

    const initThree = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x050706);
      scene.fog = new THREE.FogExp2(0x050706, 0.003);

      camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);

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
      const sunLight = new THREE.DirectionalLight(0xfff0dd, 1.2);
      sunLight.position.set(10, 40, 20);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 1024;
      sunLight.shadow.mapSize.height = 1024;
      scene.add(sunLight);

      // Key light for highlights
      const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
      keyLight.position.set(-15, 25, 10);
      scene.add(keyLight);

      const isMobile = window.innerWidth < 768;

      if (!isMobile) {
        // ═══════════════════════════════════════════════════
        // REFLECTIVE FLOOR
        // ═══════════════════════════════════════════════════
        const floorGeom = new THREE.PlaneGeometry(150, 150);
        const floorMat = new THREE.MeshStandardMaterial({
          color: 0x050706,
          roughness: 0.18,
          metalness: 0.85,
          transparent: true,
          opacity: 0.95
        });
        const floor = new THREE.Mesh(floorGeom, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -3.5;
        floor.receiveShadow = true;
        scene.add(floor);

        // ═══════════════════════════════════════════════════
        // DOUBLE GLOWING NEON RAILS
        // ═══════════════════════════════════════════════════
        const createNeonRail = (rOffset, colorHex) => {
          const railPoints = [];
          const divisions = 100;
          const currentRadius = 22;
          const currentCenterZ = -12;

          for (let i = 0; i <= divisions; i++) {
            const angle = Math.PI * 0.96 - (i / divisions) * (Math.PI * 0.92);
            const x = archCenter.x + Math.cos(angle) * (currentRadius + rOffset);
            const z = currentCenterZ - Math.sin(angle) * (currentRadius + rOffset) * 0.65;
            railPoints.push(new THREE.Vector3(x, -3.48, z));
          }
          const railCurve = new THREE.CatmullRomCurve3(railPoints);
          const railGeom = new THREE.TubeGeometry(railCurve, 100, 0.08, 6, false);
          const railMat = new THREE.MeshStandardMaterial({
            color: colorHex,
            emissive: colorHex,
            emissiveIntensity: 3.5,
            metalness: 0.1,
            roughness: 0.5
          });
          const railMesh = new THREE.Mesh(railGeom, railMat);
          scene.add(railMesh);
        };

        // Create two rails with a red-orange neon glow
        createNeonRail(-0.45, 0xff3300);
        createNeonRail(0.45, 0xff3300);
      }

      // Draw the central Arch path line
      recreateArchLine();

      // ═══════════════════════════════════════════════════
      // EXTRUDE SVG LETTERS & ATTACH COMPONENT SCENERY
      // ═══════════════════════════════════════════════════
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
                depth: 0.4 + pathIdx * 0.15, // Sleek, thin depth matching concept art
                bevelEnabled: true,
                bevelSegments: 3,
                steps: 1,
                bevelSize: 0.08,
                bevelThickness: 0.08
              };

              // Premium reflective glossy physical material (opaque, catches reflection)
              const material = new THREE.MeshPhysicalMaterial({
                color: themeColor,
                metalness: 0.85,
                roughness: 0.18,
                clearcoat: 1.0,
                clearcoatRoughness: 0.1,
                emissive: themeColor.clone().multiplyScalar(0.12),
                side: THREE.DoubleSide,
                transparent: false
              });

              const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
              // geometry.center(); // REMOVED: Preserves relative offsets of separate SVG paths!

              const mesh = new THREE.Mesh(geometry, material);
              mesh.castShadow = true;
              mesh.receiveShadow = true;

              // Parallax depth layered thickness
              mesh.position.z = (pathIdx - paths.length / 2) * 0.5;
              letterGroup.add(mesh);

              // Outline edges removed to match the clean solid style of the concept image
            });
          });

          // Center the group children
          const box = new THREE.Box3().setFromObject(letterGroup);
          const center = new THREE.Vector3();
          box.getCenter(center);
          letterGroup.children.forEach(child => {
            child.position.sub(center);
          });

          // Scale letters to height of ~5.2 units
          const size = new THREE.Vector3();
          box.setFromObject(letterGroup).getSize(size);
          const maxDim = Math.max(size.x, size.y);
          const scale = 5.2 / maxDim;
          letterGroup.scale.set(scale, -scale, scale);
          letterGroup.userData.baseScale = scale; // STORE BASE SCALE
        } else {
          // Fallback box shape
          const geom = new THREE.BoxGeometry(3, 5, 1);
          const mat = new THREE.MeshStandardMaterial({ color: themeColor, metalness: 0.8 });
          const m = new THREE.Mesh(geom, mat);
          letterGroup.add(m);
          letterGroup.userData.baseScale = 1.0;
        }

        // Volumetric cone lights removed to prevent camera clipping and triangle artifacting

        // Small glowing base under each letter
        const baseGeom = new THREE.CylinderGeometry(1.2, 1.2, 0.1, 16);
        const baseMat = new THREE.MeshStandardMaterial({
          color: themeColor,
          emissive: themeColor,
          emissiveIntensity: 2.0,
          metalness: 0.2,
          roughness: 0.5
        });
        const baseMesh = new THREE.Mesh(baseGeom, baseMat);
        baseMesh.position.set(0, -2.55, 0); // bottom of 5.2h letter mesh
        letterGroup.add(baseMesh);

        // Add local point light for ground glow, placed just above the floor Y = -3.5
        const ptLight = new THREE.PointLight(themeColor, 4, 18);
        ptLight.position.set(0, -2.4, 0.5);
        letterGroup.add(ptLight);

        // Position on the curve
        const archData = getArchPosition(index);
        letterGroup.position.copy(archData.pos);

        // Angle letters slightly to face the center of the arc (camera direction)
        const isMobile = window.innerWidth < 768;
        const currentRadius = isMobile ? 12 : 22;
        const startAngle = Math.PI * 0.94;
        const endAngle = Math.PI * 0.06;
        const angle = startAngle - (index / 12) * (startAngle - endAngle);
        letterGroup.rotation.y = -Math.cos(angle) * 0.28;

        // Store references in userData for tick animations
        letterGroup.userData = {
          key: data.key,
          index: index,
          color: data.color,
          glow: data.glow,
          originalPos: archData.pos.clone(),
          normal: archData.normal.clone(),
          originalRot: letterGroup.rotation.clone(),
          floatOffset: Math.random() * 100,
          pointLight: ptLight,
          materials: []
        };

        // Cache materials to dynamically fade neighbors
        letterGroup.traverse(child => {
          if (child.material) {
            letterGroup.userData.materials.push(child.material);
          }
        });

        // ═══════════════════════════════════════════════════
        // SUB-INSTALLATIONS (Scenery linked to specific letters)
        // ═══════════════════════════════════════════════════

        // H: Gateway
        if (data.key === "H") {
          const arch = new THREE.Group();
          const pillarGeom = new THREE.BoxGeometry(0.5, 8, 0.5);
          const topGeom = new THREE.BoxGeometry(5.5, 0.5, 1);
          const stoneMat = new THREE.MeshStandardMaterial({ color: 0x1f1912, roughness: 0.9 });
          const lp = new THREE.Mesh(pillarGeom, stoneMat);
          lp.position.set(-2.5, 0, 0);
          const rp = new THREE.Mesh(pillarGeom, stoneMat);
          rp.position.set(2.5, 0, 0);
          const ts = new THREE.Mesh(topGeom, stoneMat);
          ts.position.set(0, 4, 0);
          arch.add(lp, rp, ts);
          arch.position.set(0, 0, -1);
          letterGroup.add(arch);
        }

        // I: sound waves
        if (data.key === "I") {
          const ringGeom = new THREE.TorusGeometry(3.5, 0.04, 8, 32);
          const ringMat = new THREE.MeshBasicMaterial({ color: 0x0072ff, transparent: true, opacity: 0.3 });
          for (let r = 0; r < 3; r++) {
            const ring = new THREE.Mesh(ringGeom, ringMat);
            ring.rotation.x = Math.PI / 2;
            ring.scale.setScalar(0.3 + r * 0.35);
            letterGroup.add(ring);
            sceneryAnims.rings.push({ mesh: ring, baseScale: 0.3 + r * 0.35 });
          }
        }

        // T: Compass pointer
        if (data.key === "T") {
          const compass = new THREE.Group();
          const dialGeom = new THREE.TorusGeometry(1.8, 0.08, 8, 32);
          const dialMat = new THREE.MeshStandardMaterial({ color: 0x00aa44, metalness: 0.7 });
          const dial = new THREE.Mesh(dialGeom, dialMat);
          dial.rotation.x = Math.PI / 2;
          compass.add(dial);

          const pointerGeom = new THREE.ConeGeometry(0.15, 1.5, 4);
          const pointerMat = new THREE.MeshBasicMaterial({ color: 0x44ff88 });
          const pointer = new THREE.Mesh(pointerGeom, pointerMat);
          pointer.rotation.x = Math.PI / 2;
          pointer.position.y = 0.05;
          compass.add(pointer);
          sceneryAnims.compassNeedle = pointer;

          compass.position.set(-2.5, -2, -1);
          letterGroup.add(compass);
        }

        // S: Ripple disk
        if (data.key === "S") {
          const ripGeom = new THREE.RingGeometry(0.1, 2.5, 32);
          const ripMat = new THREE.MeshBasicMaterial({ color: 0xff44aa, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
          const rip = new THREE.Mesh(ripGeom, ripMat);
          rip.rotation.x = -Math.PI / 2;
          rip.position.set(0, -2.5, 0);
          letterGroup.add(rip);
          sceneryAnims.ripples.push(rip);
        }

        // D: Floating books & Glass Portal
        if (data.key === "D") {
          const portGeom = new THREE.PlaneGeometry(4.5, 7.5);
          const portMat = new THREE.MeshPhysicalMaterial({
            color: 0x8800ff,
            transparent: true,
            opacity: 0.3,
            roughness: 0.05,
            metalness: 0.1,
            transmission: 0.85,
            thickness: 0.5,
            side: THREE.DoubleSide
          });
          const portal = new THREE.Mesh(portGeom, portMat);
          portal.position.set(0, 0, -1);
          letterGroup.add(portal);

          const bookGeom = new THREE.BoxGeometry(0.5, 0.7, 0.1);
          const bookMat = new THREE.MeshStandardMaterial({ color: 0x8800ff, roughness: 0.7 });
          for (let b = 0; b < 4; b++) {
            const book = new THREE.Mesh(bookGeom, bookMat);
            book.position.set(
              (Math.random() - 0.5) * 4,
              (Math.random() - 0.5) * 3,
              (Math.random() - 0.5) * 2
            );
            book.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
            letterGroup.add(book);
            sceneryAnims.books.push(book);
          }
        }

        // F: Islamic pattern panel
        if (data.key === "F") {
          const panel = new THREE.Group();
          const frameGeom = new THREE.RingGeometry(2.5, 2.6, 8);
          const frameMat = new THREE.MeshBasicMaterial({ color: 0x66ff88, side: THREE.DoubleSide });
          const oct = new THREE.Mesh(frameGeom, frameMat);
          panel.add(oct);

          const starGeom = new THREE.RingGeometry(1.6, 1.7, 8);
          const star = new THREE.Mesh(starGeom, frameMat);
          star.rotation.z = Math.PI / 8;
          panel.add(star);

          panel.position.set(0, 0, -1.2);
          letterGroup.add(panel);
        }

        // F2: Staircase
        if (data.key === "F2") {
          const stairs = new THREE.Group();
          const stepGeom = new THREE.BoxGeometry(1.3, 0.18, 0.6);
          const stepMat = new THREE.MeshStandardMaterial({ color: 0xffee66, roughness: 0.8 });
          for (let s = 0; s < 5; s++) {
            const step = new THREE.Mesh(stepGeom, stepMat);
            step.position.set(s * 0.4 - 0.8, s * 0.4 - 1.5, -s * 0.4);
            stairs.add(step);
          }
          letterGroup.add(stairs);
        }

        // E2: Chat bubbles
        if (data.key === "E2") {
          const bubbleShape = new THREE.Shape();
          bubbleShape.absarc(0, 0, 0.6, 0, Math.PI * 2);
          bubbleShape.moveTo(-0.2, -0.5);
          bubbleShape.lineTo(-0.45, -0.85);
          bubbleShape.lineTo(0.05, -0.55);

          const bExtrude = { depth: 0.15, bevelEnabled: true, bevelSegments: 3, bevelSize: 0.04, bevelThickness: 0.04 };
          const bGeom = new THREE.ExtrudeGeometry(bubbleShape, bExtrude);
          const bMat = new THREE.MeshStandardMaterial({ color: 0xff77bb, roughness: 0.3 });

          for (let b = 0; b < 3; b++) {
            const bub = new THREE.Mesh(bGeom, bMat);
            bub.position.set(
              (Math.random() - 0.5) * 3.5,
              (Math.random() - 0.5) * 2.5 + 0.5,
              (Math.random() - 0.5) * 1.5
            );
            letterGroup.add(bub);
            sceneryAnims.bubbles.push(bub);
          }
        }

        // N: Sprouts
        if (data.key === "N") {
          const sproutGroup = new THREE.Group();
          for (let j = 0; j < 3; j++) {
            const curvePts = [
              new THREE.Vector3(0, -3, 0),
              new THREE.Vector3(Math.sin(j * 2) * 0.75, -1, Math.cos(j * 2) * 0.75),
              new THREE.Vector3(Math.sin(j * 2.5) * 1.5, 1, Math.cos(j * 2.5) * 1.5)
            ];
            const sprCurve = new THREE.CatmullRomCurve3(curvePts);
            const sprGeom = new THREE.TubeGeometry(sprCurve, 20, 0.07, 8, false);
            const sprMat = new THREE.MeshStandardMaterial({ color: 0x55ff99, roughness: 0.7 });
            const spr = new THREE.Mesh(sprGeom, sprMat);
            sproutGroup.add(spr);
            sceneryAnims.sprouts.push(spr);
          }
          letterGroup.add(sproutGroup);
        }

        scene.add(letterGroup);
        letterGroups.push(letterGroup);
      });

      // ═══════════════════════════════════════════════════
      // GLOBAL DRIFTING PARTICLES
      // ═══════════════════════════════════════════════════
      const pCount = 500;
      const pGeom = new THREE.BufferGeometry();
      const pPosArray = new Float32Array(pCount * 3);
      const pColArray = new Float32Array(pCount * 3);

      const colorPalette = [
        new THREE.Color(0xff7a00),
        new THREE.Color(0x0072ff),
        new THREE.Color(0x00aa44),
        new THREE.Color(0xff44aa),
        new THREE.Color(0x8800ff)
      ];

      for (let i = 0; i < pCount * 3; i += 3) {
        pPosArray[i] = (Math.random() - 0.5) * 60;
        pPosArray[i + 1] = (Math.random() - 0.5) * 35;
        pPosArray[i + 2] = -22 + (Math.random() - 0.5) * 15;

        const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        pColArray[i] = col.r;
        pColArray[i + 1] = col.g;
        pColArray[i + 2] = col.b;
      }

      pGeom.setAttribute("position", new THREE.BufferAttribute(pPosArray, 3));
      pGeom.setAttribute("color", new THREE.BufferAttribute(pColArray, 3));

      const pMat = new THREE.PointsMaterial({
        size: 0.6,
        vertexColors: true,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending
      });

      const particleSystem = new THREE.Points(pGeom, pMat);
      scene.add(particleSystem);

      // ═══════════════════════════════════════════════════
      // FLOCK OF BIRDS
      // ═══════════════════════════════════════════════════
      const birdFlock = new THREE.Group();
      const wingG = new THREE.PlaneGeometry(0.7, 0.3);
      const wingM = new THREE.MeshBasicMaterial({ color: 0xffdd66, side: THREE.DoubleSide });

      for (let b = 0; b < 10; b++) {
        const singleBird = new THREE.Group();
        const lw = new THREE.Mesh(wingG, wingM);
        lw.position.x = -0.35;
        const rw = new THREE.Mesh(wingG, wingM);
        rw.position.x = 0.35;
        singleBird.add(lw, rw);

        singleBird.position.set(
          (Math.random() - 0.5) * 30,
          10 + Math.random() * 8,
          -18 + (Math.random() - 0.5) * 10
        );

        singleBird.userData = {
          lw,
          rw,
          speed: 0.08 + Math.random() * 0.06,
          offset: Math.random() * 10
        };

        birdFlock.add(singleBird);
        sceneryAnims.birds.push(singleBird);
      }
      scene.add(birdFlock);

      // Initial camera setup centered on the first milestone (H)
      camera.position.set(-13.9, 4.8, 5.5);
      const currentLookAt = new THREE.Vector3(-21.5, 0.1, -14.5);
      camera.lookAt(currentLookAt);

      let lastActiveIndex = null;

      // ═══════════════════════════════════════════════════
      // TICK RENDER LOOP
      // ═══════════════════════════════════════════════════
      const tick = () => {
        const elapsedTime = clock.getElapsedTime();

        // 1. Smooth lerp scrolling progress calculations
        currentScroll.current += (targetScroll.current - currentScroll.current) * 0.042;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const p = scrollHeight > 0 ? Math.min(Math.max(currentScroll.current / scrollHeight, 0), 1) : 0;

        // Calculate continuous active index factor
        const targetIndex = p * 12;
        const currentActive = Math.min(Math.max(Math.round(targetIndex), 0), 12);

        // 2. React Active Card overlay state trigger
        if (lastActiveIndex !== currentActive) {
          lastActiveIndex = currentActive;
          setActiveIndex(currentActive);
        }

        // 3. Dynamic Camera Pan-and-Focus target coordinates (downward angle)
        const activeItem = letterGroups[currentActive];
        let targetCamPos = new THREE.Vector3(0, 4, 18);
        let targetLookAt = new THREE.Vector3(0, 0, -15);

        if (activeItem) {
          const itemPos = activeItem.userData.originalPos.clone();
          const isMobile = window.innerWidth < 768;

          if (isMobile) {
            targetCamPos.set(itemPos.x * 0.7, 2.5, itemPos.z + 15);
            targetLookAt.set(itemPos.x, itemPos.y + 1.2, itemPos.z);
          } else {
            targetCamPos.set(itemPos.x * 0.65, 4.8, itemPos.z + 20);
            targetLookAt.set(itemPos.x, itemPos.y + 1.0, itemPos.z);
          }
        }

        camera.position.lerp(targetCamPos, 0.045);
        currentLookAt.lerp(targetLookAt, 0.045);
        camera.lookAt(currentLookAt);

        // 4. Animate letters (grow, lift, glow, fade neighbors)
        letterGroups.forEach((letterGroup, i) => {
          const distance = Math.abs(i - targetIndex);
          const factor = Math.max(0, 1.0 - distance);

          // A. Scale animation
          const baseScale = letterGroup.userData.baseScale || 0.015;
          const targetScale = baseScale * (1.0 + factor * 0.22);
          letterGroup.scale.set(
            targetScale,
            -targetScale,
            targetScale
          );

          // B. Lift animation along normal vector (Y axis, straight UP)
          const liftDist = factor * 2.8;
          const liftVector = letterGroup.userData.normal.clone().multiplyScalar(liftDist);
          const destPos = letterGroup.userData.originalPos.clone().add(liftVector);

          // Ambient float swaying
          const fTime = elapsedTime + letterGroup.userData.floatOffset;
          destPos.y += Math.sin(fTime * 1.4) * 0.18;
          destPos.x += Math.cos(fTime * 0.8) * 0.08;

          letterGroup.position.lerp(destPos, 0.08);

          // C. Light intensity glow
          letterGroup.userData.pointLight.intensity = 3.0 + factor * 14.0;

          // D. neighbor fading (opacity)
          const opacity = 0.45 + (1.0 - Math.min(distance, 2) / 2) * 0.55;
          letterGroup.userData.materials.forEach(mat => {
            mat.opacity = opacity;
          });
        });

        // 5. Connectors Coordinates projections & direct DOM modifications
        if (activeItem && cardRef.current && svgConnectorRef.current && connectorDotRef.current) {
          const tempV = new THREE.Vector3();
          activeItem.getWorldPosition(tempV);

          // Connect to the top of the letter (offset upwards)
          tempV.y += 2.6;
          tempV.project(camera);

          const screenX = (tempV.x * 0.5 + 0.5) * window.innerWidth;
          const screenY = (tempV.y * -0.5 + 0.5) * window.innerHeight;

          if (tempV.z <= 1.0) {
            // Draw a straight line from the bottom center of the active top card to the letter top
            const cardRect = cardRef.current.getBoundingClientRect();
            const startX = window.innerWidth / 2;
            const startY = cardRect.bottom;

            cardRef.current.style.opacity = 1.0;

            // Draw glowing connector SVG path
            svgConnectorRef.current.setAttribute("d", `M ${startX} ${startY} L ${screenX} ${screenY}`);

            const activeColor = letterData[currentActive].color;
            svgConnectorRef.current.setAttribute("stroke", activeColor);

            // Position connection intersection dot
            connectorDotRef.current.setAttribute("cx", screenX);
            connectorDotRef.current.setAttribute("cy", screenY);
            connectorDotRef.current.setAttribute("fill", activeColor);
            connectorDotRef.current.style.opacity = 1.0;
          } else {
            cardRef.current.style.opacity = 0;
            svgConnectorRef.current.setAttribute("d", "");
            connectorDotRef.current.style.opacity = 0;
          }
        }

        // Project and position secondary cards in the arc
        letterGroups.forEach((letterGroup, i) => {
          const smallCard = document.getElementById(`small-card-${i}`);
          if (smallCard) {
            if (i === currentActive) {
              smallCard.style.opacity = 0;
            } else {
              const tempV = new THREE.Vector3();
              letterGroup.getWorldPosition(tempV);

              tempV.y += 3.0; // project above the letter
              tempV.project(camera);

              const sX = (tempV.x * 0.5 + 0.5) * window.innerWidth;
              const sY = (tempV.y * -0.5 + 0.5) * window.innerHeight;

              if (tempV.z <= 1.0) {
                const distToActive = Math.abs(i - targetIndex);
                const cardOpacity = Math.max(0, 0.7 - distToActive * 0.22);
                const cardScale = Math.max(0.35, 0.58 - distToActive * 0.05);

                smallCard.style.transform = `translate(-50%, -100%) translate3d(${sX}px, ${sY}px, 0px) scale(${cardScale})`;
                smallCard.style.opacity = cardOpacity;
              } else {
                smallCard.style.opacity = 0;
              }
            }
          }
        });

        // 6. Sub-Scenery animations
        // Torus rings scale
        sceneryAnims.rings.forEach(ring => {
          const scaleOffset = (elapsedTime * 0.6) % 1.2;
          ring.mesh.scale.setScalar(ring.baseScale + scaleOffset);
        });

        // Compass needle jitter
        if (sceneryAnims.compassNeedle) {
          sceneryAnims.compassNeedle.rotation.z = Math.sin(elapsedTime * 3.0) * 0.4;
        }

        // S Ripples scale and fade
        sceneryAnims.ripples.forEach(rip => {
          const scale = 1.0 + (elapsedTime % 1.5) * 1.5;
          rip.scale.setScalar(scale);
          rip.material.opacity = Math.max(0.4 - (elapsedTime % 1.5) * 0.25, 0);
        });

        // D books float and rotate
        sceneryAnims.books.forEach((book, idx) => {
          book.rotation.y += 0.008;
          book.position.y += Math.sin(elapsedTime * 1.5 + idx) * 0.008;
        });

        // E2 chat bubbles float
        sceneryAnims.bubbles.forEach((bub, idx) => {
          bub.position.y += Math.cos(elapsedTime * 1.2 + idx) * 0.006;
        });

        // N sprouts growth scale based on proximity
        sceneryAnims.sprouts.forEach((spr) => {
          const distance = Math.abs(camera.position.z - spr.parent.parent.position.z);
          const growth = Math.max(0.1, Math.min(1.0, 1.5 - distance / 20));
          spr.scale.set(growth, growth, growth);
        });

        // Global drifting particles
        const posArray = particleSystem.geometry.attributes.position.array;
        for (let i = 0; i < pCount * 3; i += 3) {
          posArray[i + 1] += Math.sin(elapsedTime + posArray[i]) * 0.008;
          posArray[i] += Math.cos(elapsedTime + posArray[i + 2]) * 0.005;
        }
        particleSystem.geometry.attributes.position.needsUpdate = true;

        // Birds flap
        sceneryAnims.birds.forEach(bird => {
          const flap = Math.sin(elapsedTime * 8 + bird.userData.offset) * 0.6;
          bird.userData.lw.rotation.z = flap;
          bird.userData.rw.rotation.z = -flap;

          bird.position.z += bird.userData.speed;
          if (bird.position.z > 0) {
            bird.position.z = -25;
          }
        });

        // 7. Dynamic Soundscape Sweep (Synthesizer pitch follows scroll depth)
        if (audioCtxRef.current && audioCtxRef.current.state === "running" && droneNodeRef.current) {
          const freq = 55 + p * 55; // sweep from 55Hz (A1) to 110Hz (A2)
          droneNodeRef.current.osc1.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
          droneNodeRef.current.osc2.frequency.setValueAtTime(freq * 2, audioCtxRef.current.currentTime);
        }

        // 8. Background atmosphere color transitions
        let targetBg = new THREE.Color(0x050706);
        let targetFog = new THREE.Color(0x050706);
        let targetFogDensity = 0.0035;

        if (letterData[currentActive]) {
          const activeItemData = letterData[currentActive];
          const col = new THREE.Color(activeItemData.color);
          targetBg.copy(col).multiplyScalar(0.035);
          targetFog.copy(col).multiplyScalar(0.025);
          targetFogDensity = 0.0055;
        }

        scene.background.lerp(targetBg, 0.04);
        scene.fog.color.lerp(targetFog, 0.04);
        scene.fog.density += (targetFogDensity - scene.fog.density) * 0.04;

        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(tick);
      };

      tick();
    };

    if (loaded && Object.keys(svgAssets).length > 0) {
      initThree();
    }

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

      // Update locations and rotations of the letters dynamically on resize
      letterGroups.forEach((letterGroup, idx) => {
        const archData = getArchPosition(idx);
        letterGroup.userData.originalPos.copy(archData.pos);
        letterGroup.userData.normal.copy(archData.normal);

        // Angle letters slightly to face the center of the arc (camera direction)
        const currentRadius = w < 768 ? 12 : 22;
        const startAngle = Math.PI * 0.94;
        const endAngle = Math.PI * 0.06;
        const angle = startAngle - (idx / 12) * (startAngle - endAngle);
        letterGroup.rotation.y = -Math.cos(angle) * 0.28;

        letterGroup.userData.originalRot.copy(letterGroup.rotation);
      });

      recreateArchLine();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (renderer) {
        renderer.dispose();
      }
    };
  }, [loaded, svgAssets]);

  return (
    <div ref={containerRef} className="relative w-full min-h-[1400vh] bg-[#050706]">
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
              </div>

              <div className="divider-vintage-ornamental text-[#A97843]/40"></div>

      

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
  className="px-8 py-3.5 bg-transparent border border-[#F6F0E4]/30 text-[#F6F0E4]/80 font-heading rounded-lg hover:border-[#F6F0E4]/60 transition-all w-64 text-sm flex items-center justify-center gap-2"
>
  <Volume2 size={16} />
  Enter with  Sound
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

          {/* ═══════════════════════════════════════════════════
             2D GLOWING CONNECTOR LINES (SVG Canvas)
             ═══════════════════════════════════════════════════ */}
          <svg className="fixed inset-0 pointer-events-none z-20 w-full h-full">
            <path
              ref={svgConnectorRef}
              fill="none"
              strokeWidth="2.5"
              strokeDasharray="5 5"
              className="transition-all duration-300 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
            />
            <circle
              ref={connectorDotRef}
              r="6.5"
              className="animate-pulse filter drop-shadow-[0_0_8px_rgba(255,255,255,0.85)]"
            />
          </svg>

          {/* ═══════════════════════════════════════════════════
             PROJECTED FLOATING EDITORIAL CARD
             ═══════════════════════════════════════════════════ */}
          {/* ═══════════════════════════════════════════════════
             FLOATING SECONDARY CARDS (PARALLAX ARC OVERLAYS)
             ═══════════════════════════════════════════════════ */}
          {letterData.map((data, idx) => (
            <div
              key={idx}
              id={`small-card-${idx}`}
              className="fixed z-20 pointer-events-none transition-all duration-300 select-none hidden md:block"
              style={{
                width: "200px",
                willChange: "transform, opacity",
                opacity: 0,
                transform: "translate(-50%, -100%) translate3d(0, 0, 0) scale(0.6)"
              }}
            >
              <div
                className="bg-[#050706]/80 border p-4 rounded-xl shadow-lg backdrop-blur-sm relative"
                style={{
                  borderColor: `${data.color}35`,
                  boxShadow: `0 0 12px ${data.color}11`
                }}
              >
                {/* Micro corner lines */}
                <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-[#A97843]/20"></div>
                <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-[#A97843]/20"></div>

                <div className="text-[7px] uppercase tracking-[0.2em] text-[#A97843]/70 font-bold block mb-1">
                  {data.symbol}
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span
                    className="text-xl font-black font-heading tracking-tighter"
                    style={{ color: data.color }}
                  >
                    {data.key}
                  </span>
                  <span className="text-[9px] font-bold text-[#F6F0E4]/90 truncate">
                    {data.theme}
                  </span>
                </div>
                <p className="text-[8px] leading-normal text-[#F6F0E4]/65 line-clamp-2">
                  {data.desc}
                </p>
              </div>
            </div>
          ))}

          {/* ═══════════════════════════════════════════════════
             PROJECTED FLOATING EDITORIAL CARD (FIXED TOP-CENTER)
             ═══════════════════════════════════════════════════ */}
          <div
            ref={cardRef}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-30 pointer-events-auto transition-opacity duration-300 w-[500px] max-w-[90vw]"
            style={{
              willChange: "opacity"
            }}
          >
            <AnimatePresence mode="wait">
              {activeIndex !== null && letterData[activeIndex] && (
                <motion.div
                  key={activeIndex}
                  initial={{ scale: 0.94, opacity: 0, y: -10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.94, opacity: 0, y: 10 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="bg-[#050706]/90 border border-[#A97843]/35 p-6 md:p-8 rounded-2xl shadow-2xl backdrop-blur-md relative border-double border-4"
                  style={{
                    boxShadow: `0 0 30px ${letterData[activeIndex].glow}15`
                  }}
                >
                  <div className="absolute top-4 right-4 text-[9px] font-heading font-black tracking-widest text-[#A97843]/60 uppercase">
                    Milestone {activeIndex + 1} / 13
                  </div>

                  <div className="text-[10px] uppercase tracking-[0.3em] text-[#A97843] font-bold block font-heading mb-2">
                    {letterData[activeIndex].symbol}
                  </div>

                  <div className="flex items-baseline gap-4 mb-4">
                    <h2
                      className="text-6xl font-black font-heading tracking-tighter"
                      style={{
                        color: letterData[activeIndex].color,
                        textShadow: `0 0 20px ${letterData[activeIndex].glow}44`
                      }}
                    >
                      {letterData[activeIndex].key}
                    </h2>
                    <h3 className="text-xl font-bold font-heading text-[#F6F0E4]">
                      {letterData[activeIndex].theme}
                    </h3>
                  </div>

                  <p className="text-sm font-serif leading-relaxed text-[#F6F0E4]/85 text-justify mb-6">
                    {letterData[activeIndex].desc}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {letterData[activeIndex].badges.map((badge, bIdx) => (
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
            </AnimatePresence>
          </div>

          {/* Scroll Indicator HUD */}
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 pointer-events-none select-none">
            <div className="w-6 h-10 border-2 border-[#A97843]/60 rounded-full flex justify-center p-1.5 relative">
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="w-1 h-2 bg-[#A97843] rounded-full"
              />
            </div>
            <span className="text-[9px] tracking-[0.3em] font-heading font-bold text-[#A97843] uppercase mt-1 animate-pulse">
              Scroll to Explore the Journey
            </span>
          </div>

          {/* Right Floating Dot Navigation Rails */}
          <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-2 pointer-events-auto bg-[#050706]/60 p-3 rounded-full border border-[#A97843]/20 backdrop-blur-md">
            {letterData.map((data, idx) => {
              const isPast = activeIndex > idx;
              const isActive = activeIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
                    const targetP = idx / 12;
                    window.scrollTo({ top: targetP * scrollHeight, behavior: "smooth" });
                  }}
                  className="group relative flex items-center justify-center h-6.5 w-6.5"
                >
                  <span className="absolute right-9 text-[10px] font-heading font-bold uppercase tracking-wider text-[#F6F0E4] bg-[#050706] border border-[#A97843]/30 px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {data.key} - {data.theme}
                  </span>

                  <div
                    className={`rounded-full transition-all duration-300 flex items-center justify-center font-heading text-[8px] font-black ${isActive
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

          {/* Bottom Malayalam Tagline Overlay */}
          <div className="fixed bottom-6 left-6 z-40 pointer-events-none hidden md:block">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#F6F0E4]/40 font-heading block">
              SSF Kozhikode South Sahithyotsav 2026
            </span>
            <span className="text-[11px] text-[#A97843] font-serif block italic">
              Different Stories. Different Voices. Hits Different.
            </span>
          </div>
        </>
      )}
    </div>
  );
}
