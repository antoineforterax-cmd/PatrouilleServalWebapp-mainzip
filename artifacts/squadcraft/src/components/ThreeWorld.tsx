import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

type ThreeWorldProps = {
  variant?: 'auth' | 'app';
};

const particlePositions = [
  [-4.8, 2.4, -1.8], [-3.5, -2.2, -2.4], [-2.4, 3.1, -3.2],
  [-1.2, -3.3, -2.2], [0.4, 2.9, -3.8], [1.6, -2.5, -3.1],
  [2.8, 2.1, -2.4], [3.9, -1.7, -2.7], [4.5, 3.2, -3.8],
  [5.2, -.2, -3.4], [-5.4, -.4, -3.6], [.3, -.1, -4.2],
] as const;

function GlassMaterial({ color, opacity = .32 }: { color: string; opacity?: number }) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={0.08}
      metalness={0.08}
      transmission={0.72}
      thickness={1.2}
      transparent
      opacity={opacity}
      clearcoat={1}
      clearcoatRoughness={0.08}
      side={THREE.DoubleSide}
    />
  );
}

function FloatingPanel({
  position,
  rotation,
  scale,
  color,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const phase = useMemo(() => position[0] * .73 + position[1] * .41, [position]);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    mesh.current.position.y = position[1] + Math.sin(clock.elapsedTime * .42 + phase) * .12;
    mesh.current.rotation.z = rotation[2] + Math.sin(clock.elapsedTime * .25 + phase) * .018;
  });

  return (
    <mesh ref={mesh} position={position} rotation={rotation} scale={scale}>
      <boxGeometry args={[1, 1, 1]} />
      <GlassMaterial color={color} />
    </mesh>
  );
}

function Scene({ variant }: Required<ThreeWorldProps>) {
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.Mesh>(null);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const move = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth - .5) * 2;
      pointer.current.y = (event.clientY / window.innerHeight - .5) * 2;
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, []);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, pointer.current.x * .14, .025);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -pointer.current.y * .09, .025);
      group.current.position.y = Math.sin(time * .25) * .08;
    }
    if (ring.current) {
      ring.current.rotation.x = time * .13;
      ring.current.rotation.y = time * .18;
    }
    if (core.current) {
      core.current.rotation.x = -time * .09;
      core.current.rotation.y = time * .15;
    }
  });

  const spread = variant === 'auth' ? 1 : 1.45;

  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight position={[4, 6, 5]} intensity={2.4} color="#fff4d5" />
      <pointLight position={[-4, 1, 3]} intensity={45} distance={12} color="#39d5a2" />
      <pointLight position={[4, -2, 2]} intensity={38} distance={11} color="#e7a52e" />
      <group ref={group} scale={spread}>
        <FloatingPanel position={[-2.3, 1.25, -1.5]} rotation={[.08, -.28, -.05]} scale={[2.1, 1.35, .08]} color="#4fd0a3" />
        <FloatingPanel position={[2.15, .8, -2.1]} rotation={[-.05, .34, .04]} scale={[1.65, 1.05, .07]} color="#f0b542" />
        <FloatingPanel position={[-1.35, -1.7, -2.5]} rotation={[-.08, .2, .08]} scale={[1.75, .9, .06]} color="#79c9dd" />
        <FloatingPanel position={[2.5, -1.5, -1.5]} rotation={[.09, -.25, -.07]} scale={[1.3, 1.55, .07]} color="#60c58d" />
        <mesh ref={ring} position={[.4, .1, -1]}>
          <torusKnotGeometry args={[1.08, .14, 120, 18, 2, 3]} />
          <GlassMaterial color="#e8b245" opacity={.48} />
        </mesh>
        <mesh ref={core} position={[.4, .1, -.7]}>
          <icosahedronGeometry args={[.58, 1]} />
          <meshStandardMaterial color="#d89a27" metalness={.72} roughness={.16} emissive="#6b3c00" emissiveIntensity={.16} />
        </mesh>
        {particlePositions.map((position, index) => (
          <mesh key={index} position={position as unknown as [number, number, number]}>
            <sphereGeometry args={[index % 3 === 0 ? .045 : .025, 12, 12]} />
            <meshBasicMaterial color={index % 2 ? '#f2c66b' : '#8bf0cb'} transparent opacity={.72} />
          </mesh>
        ))}
      </group>
    </>
  );
}

export default function ThreeWorld({ variant = 'app' }: ThreeWorldProps) {
  const supportsWebGL = useMemo(() => {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
      return Boolean(context);
    } catch {
      return false;
    }
  }, []);

  if (!supportsWebGL) return null;

  return (
    <div className={`three-world three-world-${variant}`} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 46 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      >
        <Scene variant={variant} />
      </Canvas>
    </div>
  );
}