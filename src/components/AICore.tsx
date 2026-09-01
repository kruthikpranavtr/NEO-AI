import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AICoreState } from '../types';
import { soundFX } from '../services/audioFx';

interface AICoreProps {
  state?: AICoreState;
  size?: 'hero' | 'standard' | 'compact' | 'mini';
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
  showStatusLabel?: boolean;
}

interface ConstellationNode {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  size: number;
  alpha: number;
  color: string;
  orbitSpeed: number;
  orbitRadius: number;
  angle: number;
  elevation: number;
  pulseSpeed: number;
  pulsePhase: number;
  hasHalo?: boolean;
}

interface OrbitalTrack {
  tiltAngle: number; // In radians
  rotX: number;
  rotY: number;
  rotZ: number;
  rx: number;
  ry: number;
  color: string;
  glowColor: string;
  speed: number;
  satelliteAngle: number;
  satelliteCount: number;
}

interface Ripple {
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
}

export const AICore: React.FC<AICoreProps> = ({
  state = 'idle',
  size = 'hero',
  interactive = true,
  onClick,
  className = '',
  showStatusLabel = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mousePos = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });
  const ripplesRef = useRef<Ripple[]>([]);
  const animFrameId = useRef<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Size dimensions matching hero / standard / compact / mini
  const getDimensions = useCallback(() => {
    switch (size) {
      case 'hero':
        return { width: 440, height: 440, baseRadius: 65, orbitScale: 155 };
      case 'standard':
        return { width: 320, height: 320, baseRadius: 48, orbitScale: 110 };
      case 'compact':
        return { width: 200, height: 200, baseRadius: 30, orbitScale: 68 };
      case 'mini':
        return { width: 80, height: 80, baseRadius: 13, orbitScale: 28 };
    }
  }, [size]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive) return;
    const { orbitScale } = getDimensions();
    ripplesRef.current.push({
      radius: 8,
      maxRadius: orbitScale * 1.5,
      alpha: 1.0,
      speed: 4.2,
    });
    soundFX.playRipple();
    if (onClick) onClick();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const normX = (e.clientX - centerX) / (rect.width / 2);
    const normY = (e.clientY - centerY) / (rect.height / 2);
    mousePos.current.targetX = normX;
    mousePos.current.targetY = normY;
  };

  const handleMouseLeave = () => {
    mousePos.current.targetX = 0;
    mousePos.current.targetY = 0;
    setIsHovered(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const nodeCount = size === 'mini' ? 18 : size === 'compact' ? 45 : isMobile ? 80 : 120;
    const connectionDist = size === 'mini' ? 22 : size === 'compact' ? 38 : 62;

    const { width, height, baseRadius, orbitScale } = getDimensions();

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // 1. Initialize Constellation Cloud Nodes
    const nodes: ConstellationNode[] = [];
    const colors = ['#ffffff', '#38bdf8', '#22d3ee', '#67e8f9', '#7dd3fc', '#0284c7', '#93c5fd'];

    for (let i = 0; i < nodeCount; i++) {
      const radius = orbitScale * (0.35 + Math.random() * 0.85);
      const angle = Math.random() * Math.PI * 2;
      const elevation = (Math.random() - 0.5) * Math.PI * 0.9;
      const sizeRatio = Math.random();
      const nodeSize = sizeRatio > 0.85 ? 4.5 : sizeRatio > 0.5 ? 3.0 : 1.8;
      const col = colors[Math.floor(Math.random() * colors.length)];

      nodes.push({
        x: 0,
        y: 0,
        z: 0,
        baseX: 0,
        baseY: 0,
        baseZ: 0,
        size: nodeSize,
        alpha: 0.35 + Math.random() * 0.65,
        color: col,
        orbitSpeed: (0.002 + Math.random() * 0.005) * (Math.random() > 0.5 ? 1 : -1),
        orbitRadius: radius,
        angle,
        elevation,
        pulseSpeed: 0.02 + Math.random() * 0.04,
        pulsePhase: Math.random() * Math.PI * 2,
        hasHalo: sizeRatio > 0.85,
      });
    }

    // 2. Define 3 Primary Atomic Orbital Ellipses (Matching Reference Image)
    // Ring 1: Horizontal with slight tilt
    // Ring 2: Diagonal ~45° tilt
    // Ring 3: Steep ~80° tilt
    const orbitalTracks: OrbitalTrack[] = [
      {
        tiltAngle: -0.28, // ~-16°
        rotX: 0.15,
        rotY: 0.0,
        rotZ: -0.32,
        rx: orbitScale * 1.35,
        ry: orbitScale * 0.46,
        color: '#06b6d4',
        glowColor: 'rgba(34, 211, 238, 0.9)',
        speed: 0.012,
        satelliteAngle: 0.4,
        satelliteCount: 3,
      },
      {
        tiltAngle: 0.78, // ~45°
        rotX: -0.25,
        rotY: 0.35,
        rotZ: 0.72,
        rx: orbitScale * 1.38,
        ry: orbitScale * 0.44,
        color: '#38bdf8',
        glowColor: 'rgba(56, 189, 248, 0.9)',
        speed: -0.015,
        satelliteAngle: Math.PI / 2,
        satelliteCount: 2,
      },
      {
        tiltAngle: 1.48, // ~85° (almost vertical)
        rotX: 0.3,
        rotY: -0.25,
        rotZ: 1.45,
        rx: orbitScale * 1.32,
        ry: orbitScale * 0.42,
        color: '#67e8f9',
        glowColor: 'rgba(103, 232, 249, 0.9)',
        speed: 0.018,
        satelliteAngle: Math.PI,
        satelliteCount: 3,
      },
    ];

    let time = 0;

    const render = () => {
      time += 0.02;

      // Mouse parallax smooth interpolation
      mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.06;
      mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.06;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // State dynamic multipliers
      let speedMult = 1.0;
      let pulseMultiplier = 1.0;
      let coreScale = 1.0;
      let auraColor = 'rgba(6, 182, 212, 0.4)';
      let warmHaloAlpha = 0.3;

      if (state === 'listening') {
        speedMult = 1.8;
        pulseMultiplier = 1.0 + Math.sin(time * 6) * 0.16;
        coreScale = 1.22 + Math.sin(time * 8) * 0.1;
        auraColor = 'rgba(34, 211, 238, 0.8)';
        warmHaloAlpha = 0.55;
      } else if (state === 'thinking') {
        speedMult = 2.6;
        pulseMultiplier = 1.0 + Math.cos(time * 10) * 0.22;
        coreScale = 1.15 + Math.sin(time * 12) * 0.12;
        auraColor = 'rgba(56, 189, 248, 0.9)';
        warmHaloAlpha = 0.4;
      } else if (state === 'speaking') {
        speedMult = 1.5;
        const voiceWave = Math.sin(time * 7) * 0.45 + Math.sin(time * 13) * 0.25;
        pulseMultiplier = 1.0 + voiceWave * 0.2;
        coreScale = 1.2 + voiceWave * 0.15;
        auraColor = 'rgba(14, 165, 233, 0.85)';
        warmHaloAlpha = 0.5;
      } else if (state === 'error') {
        speedMult = 0.7;
        pulseMultiplier = 1.0 + Math.sin(time * 4) * 0.08;
        auraColor = 'rgba(244, 63, 94, 0.75)';
        warmHaloAlpha = 0.2;
      }

      const activeRadius = baseRadius * pulseMultiplier;
      const activeOrbitScale = orbitScale * pulseMultiplier;

      // ==========================================
      // 1. BACKGROUND GLOW & AMBIENT ENERGY AURA
      // ==========================================
      const bgAura = ctx.createRadialGradient(
        centerX,
        centerY,
        activeRadius * 0.2,
        centerX,
        centerY,
        activeOrbitScale * 1.5
      );
      bgAura.addColorStop(0, auraColor);
      bgAura.addColorStop(0.3, 'rgba(6, 182, 212, 0.15)');
      bgAura.addColorStop(0.7, 'rgba(2, 132, 199, 0.06)');
      bgAura.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = bgAura;
      ctx.beginPath();
      ctx.arc(centerX, centerY, activeOrbitScale * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // ==========================================
      // 2. COMPUTE 3D CONSTELLATION NODE POSITIONS
      // ==========================================
      const projectedNodes: {
        x: number;
        y: number;
        z: number;
        size: number;
        alpha: number;
        color: string;
        hasHalo?: boolean;
      }[] = [];

      const rotYGlobal = time * 0.18 * speedMult + mousePos.current.x * 0.4;
      const rotXGlobal = mousePos.current.y * 0.35 + Math.sin(time * 0.4) * 0.08;

      nodes.forEach((node) => {
        node.angle += node.orbitSpeed * speedMult;
        node.pulsePhase += node.pulseSpeed;

        const currentR = node.orbitRadius * pulseMultiplier;
        const px = currentR * Math.cos(node.elevation) * Math.cos(node.angle);
        const py = currentR * Math.sin(node.elevation);
        const pz = currentR * Math.cos(node.elevation) * Math.sin(node.angle);

        // 3D Rotation Y
        const cosY = Math.cos(rotYGlobal);
        const sinY = Math.sin(rotYGlobal);
        const x1 = px * cosY - pz * sinY;
        const z1 = px * sinY + pz * cosY;

        // 3D Rotation X
        const cosX = Math.cos(rotXGlobal);
        const sinX = Math.sin(rotXGlobal);
        const y2 = py * cosX - z1 * sinX;
        const z2 = py * sinX + z1 * cosX;

        // Perspective Projection
        const fov = 380;
        const scale = fov / (fov + z2);
        const screenX = centerX + x1 * scale;
        const screenY = centerY + y2 * scale;

        const depthAlpha = Math.max(0.15, (z2 + activeOrbitScale * 1.2) / (activeOrbitScale * 2.4));
        const pulse = 0.8 + Math.sin(node.pulsePhase) * 0.25;
        const finalAlpha = Math.min(1.0, node.alpha * depthAlpha * pulse);

        projectedNodes.push({
          x: screenX,
          y: screenY,
          z: z2,
          size: Math.max(1.2, node.size * scale * (size === 'hero' ? 1.0 : 0.8)),
          alpha: finalAlpha,
          color: node.color,
          hasHalo: node.hasHalo,
        });
      });

      // Sort nodes by Z depth
      projectedNodes.sort((a, b) => a.z - b.z);

      // Separate background elements (Z < 0) from foreground (Z >= 0)
      const backNodes = projectedNodes.filter((n) => n.z < 0);
      const frontNodes = projectedNodes.filter((n) => n.z >= 0);

      // ==========================================
      // 3. DRAW CONSTELLATION NETWORK LINES (Back)
      // ==========================================
      const drawNetworkLines = (nodeList: typeof projectedNodes) => {
        if (size === 'mini') return;
        ctx.lineWidth = 0.65;
        const len = nodeList.length;
        for (let i = 0; i < len; i++) {
          const n1 = nodeList[i];
          for (let j = i + 1; j < Math.min(i + 8, len); j++) {
            const n2 = nodeList[j];
            const dx = n1.x - n2.x;
            const dy = n1.y - n2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < connectionDist) {
              const lineAlpha = (1 - dist / connectionDist) * 0.22 * Math.min(n1.alpha, n2.alpha);
              ctx.beginPath();
              ctx.moveTo(n1.x, n1.y);
              ctx.lineTo(n2.x, n2.y);
              ctx.strokeStyle =
                state === 'error'
                  ? `rgba(244, 63, 94, ${lineAlpha})`
                  : `rgba(56, 189, 248, ${lineAlpha})`;
              ctx.stroke();
            }
          }
        }
      };

      drawNetworkLines(backNodes);

      // Draw Back Nodes
      backNodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.globalAlpha = n.alpha * 0.7;
        ctx.fill();
      });

      // ==========================================
      // 4. DRAW 3 ATOMIC ORBITAL RINGS (Ellipses)
      // ==========================================
      orbitalTracks.forEach((track, index) => {
        track.satelliteAngle += track.speed * speedMult;

        ctx.save();
        ctx.translate(centerX, centerY);

        // Apply mouse tilt and dynamic oscillation
        const mouseTiltX = mousePos.current.y * 0.2;
        const mouseTiltY = mousePos.current.x * 0.25;
        ctx.rotate(track.rotZ + mouseTiltY);
        ctx.scale(1, Math.cos(track.rotX + mouseTiltX));

        const ringRx = track.rx * pulseMultiplier;
        const ringRy = track.ry * pulseMultiplier;

        // Draw main orbital line
        ctx.beginPath();
        ctx.ellipse(0, 0, ringRx, ringRy, 0, 0, Math.PI * 2);
        ctx.strokeStyle = state === 'error' ? '#f43f5e' : track.color;
        ctx.lineWidth = size === 'hero' ? 1.8 : 1.2;
        ctx.globalAlpha = 0.75 + Math.sin(time * 2 + index) * 0.2;
        ctx.shadowColor = state === 'error' ? '#f43f5e' : track.glowColor;
        ctx.shadowBlur = size === 'hero' ? 14 : 8;
        ctx.stroke();

        // Draw traveling photons / orbiting electrons on each ring
        for (let s = 0; s < track.satelliteCount; s++) {
          const satAngle = track.satelliteAngle + (s * Math.PI * 2) / track.satelliteCount;
          const satX = Math.cos(satAngle) * ringRx;
          const satY = Math.sin(satAngle) * ringRy;

          // Orbiting node glow
          ctx.beginPath();
          ctx.arc(satX, satY, size === 'hero' ? 3.5 : 2.2, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = 0.95;
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 12;
          ctx.fill();
        }

        ctx.restore();
      });

      // ==========================================
      // 5. DRAW CENTRAL LUMINOUS ATOM SPHERE (CORE)
      // ==========================================
      ctx.globalAlpha = 1.0;
      const coreR = activeRadius * 0.78 * coreScale;

      // A. Outer Warm Turquoise/Gold Radiation Rim (as seen in the reference image)
      const haloR = coreR * 1.45;
      const haloGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        coreR * 0.85,
        centerX,
        centerY,
        haloR
      );
      haloGrad.addColorStop(0, `rgba(217, 119, 6, ${warmHaloAlpha})`); // soft golden/amber halo edge
      haloGrad.addColorStop(0.35, 'rgba(14, 165, 233, 0.4)');
      haloGrad.addColorStop(0.7, 'rgba(6, 182, 212, 0.15)');
      haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, haloR, 0, Math.PI * 2);
      ctx.fill();

      // B. Main Luminous Cyan/Electric Blue Sphere
      const sphereGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        coreR
      );
      if (state === 'error') {
        sphereGrad.addColorStop(0, '#ffffff');
        sphereGrad.addColorStop(0.25, '#ffe4e6');
        sphereGrad.addColorStop(0.55, '#f43f5e');
        sphereGrad.addColorStop(0.9, '#9f1239');
        sphereGrad.addColorStop(1, 'rgba(159, 18, 57, 0)');
      } else {
        sphereGrad.addColorStop(0, '#ffffff'); // Pure white nucleus
        sphereGrad.addColorStop(0.2, '#ffffff');
        sphereGrad.addColorStop(0.38, '#67e8f9'); // Bright cyan
        sphereGrad.addColorStop(0.65, '#0ea5e9'); // Vivid electric blue
        sphereGrad.addColorStop(0.92, '#0284c7'); // Deep neon blue
        sphereGrad.addColorStop(1, 'rgba(2, 132, 199, 0.1)');
      }

      ctx.fillStyle = sphereGrad;
      ctx.shadowColor = state === 'error' ? '#f43f5e' : '#0ea5e9';
      ctx.shadowBlur = size === 'hero' ? 32 : 18;
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreR, 0, Math.PI * 2);
      ctx.fill();

      // C. Intense Central White Nucleus (Sharp White Core)
      const nucleusR = coreR * 0.38;
      ctx.beginPath();
      ctx.arc(centerX, centerY, nucleusR, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = size === 'hero' ? 24 : 14;
      ctx.fill();

      // ==========================================
      // 6. DRAW FOREGROUND CONSTELLATION NETWORK
      // ==========================================
      drawNetworkLines(frontNodes);

      frontNodes.forEach((n) => {
        // Outer halo for key nodes
        if (n.hasHalo && size !== 'mini') {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.size * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.globalAlpha = n.alpha;
        ctx.shadowColor = n.color;
        ctx.shadowBlur = 8;
        ctx.fill();
      });

      // ==========================================
      // 7. ENERGY RIPPLES (On user interaction / click)
      // ==========================================
      for (let rIdx = ripplesRef.current.length - 1; rIdx >= 0; rIdx--) {
        const ripple = ripplesRef.current[rIdx];
        ripple.radius += ripple.speed;
        ripple.alpha -= 0.02;

        if (ripple.alpha <= 0 || ripple.radius >= ripple.maxRadius) {
          ripplesRef.current.splice(rIdx, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(centerX, centerY, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(103, 232, 249, ${ripple.alpha})`;
        ctx.lineWidth = 2.2;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 16;
        ctx.stroke();
      }

      ctx.restore();
      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [state, size, getDimensions]);

  const { width } = getDimensions();

  // Status Badge Label
  const getStatusInfo = () => {
    switch (state) {
      case 'listening':
        return { label: 'LISTENING...', color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40' };
      case 'thinking':
        return { label: 'THINKING...', color: 'text-blue-400 border-blue-500/40 bg-blue-950/40' };
      case 'speaking':
        return { label: 'SPEAKING...', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40' };
      case 'error':
        return { label: 'SYSTEM ALERT', color: 'text-rose-400 border-rose-500/40 bg-rose-950/40' };
      default:
        return { label: 'NEO ACTIVE', color: 'text-slate-400 border-cyan-900/30 bg-slate-900/40' };
    }
  };

  const status = getStatusInfo();

  return (
    <div
      ref={containerRef}
      id={`neo-ai-core-container-${size}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={`relative flex flex-col items-center justify-center select-none ${className}`}
      style={{ width: `${width}px` }}
    >
      <canvas
        ref={canvasRef}
        id={`neo-core-canvas-${size}`}
        onClick={handleCanvasClick}
        className={`cursor-pointer transition-transform duration-300 ${
          isHovered && interactive ? 'scale-[1.02]' : 'scale-100'
        }`}
        title="Interactive NEO Atomic AI Core - Click to pulse energy"
      />

      {showStatusLabel && (
        <div
          id="neo-core-status-pill"
          className={`mt-2 px-3.5 py-1 rounded-full text-xs font-mono tracking-widest uppercase border flex items-center gap-2 backdrop-blur-md transition-all duration-300 ${status.color}`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              state === 'listening'
                ? 'bg-cyan-400 animate-ping'
                : state === 'thinking'
                ? 'bg-blue-400 animate-pulse'
                : state === 'speaking'
                ? 'bg-emerald-400 animate-bounce'
                : state === 'error'
                ? 'bg-rose-500 animate-pulse'
                : 'bg-cyan-500/70'
            }`}
          />
          <span>{status.label}</span>
        </div>
      )}
    </div>
  );
};

