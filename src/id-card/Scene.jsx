import { Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { ACESFilmicToneMapping, MathUtils, Plane, Vector3 } from 'three';
import IDCard from './IDCard.jsx';
import Lanyard from './Lanyard.jsx';
import Lighting from './Lighting.jsx';
import { CARD_Y } from './constants.js';
import { useProjectPalette } from './palette.js';

function CameraRig() {
  const { camera, pointer } = useThree();

  useFrame((state, delta) => {
    const swayX = pointer.x * 0.32;
    const swayY = 0.14 + pointer.y * 0.14;
    const swayZ = 10.7 + Math.abs(pointer.x) * 0.08 + Math.abs(pointer.y) * 0.06;

    camera.position.x = MathUtils.damp(camera.position.x, swayX, 2, delta);
    camera.position.y = MathUtils.damp(camera.position.y, swayY, 2, delta);
    camera.position.z = MathUtils.damp(camera.position.z, swayZ, 1.6, delta);
    camera.lookAt(0, 0.1, 0);
  });

  return null;
}

function LoadingBadge() {
  return (
    <Html center>
      <div className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[var(--muted)] shadow-[var(--shadow)] backdrop-blur-xl">
        Loading ID card...
      </div>
    </Html>
  );
}

function SceneContent({ palette }) {
  const cardRef = useRef(null);
  const motionRef = useRef({
    position: new Vector3(0, CARD_Y, 0),
    rotation: new Vector3(0.05, 0, 0.04),
    velocity: new Vector3(),
    angularVelocity: new Vector3(),
    targetPosition: new Vector3(0, CARD_Y, 0),
    targetRotation: new Vector3(0.05, 0, 0.04),
    dragging: false,
    pointerId: null,
    plane: new Plane(),
    hitPoint: new Vector3(),
    grabOffset: new Vector3(),
  });

  return (
    <>
      <CameraRig />
      <Lighting palette={palette} />
      <Lanyard cardRef={cardRef} motionRef={motionRef} palette={palette} />
      <IDCard cardRef={cardRef} motionRef={motionRef} palette={palette} />
    </>
  );
}

export default function Scene() {
  const palette = useProjectPalette();

  return (
    <div className="relative mx-auto w-full max-w-[480px] lg:justify-self-end">
      <div className="h-[600px] w-full sm:h-[660px] lg:h-[720px]">
        <Canvas
          camera={{ position: [0, 0.14, 10.7], fov: 36, near: 0.1, far: 45 }}
          dpr={[1, 1.4]}
          gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
          style={{ touchAction: 'none' }}
          onCreated={({ gl }) => {
            gl.toneMapping = ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.02;
          }}
        >
          <Suspense fallback={<LoadingBadge />}>
            <SceneContent palette={palette} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}
