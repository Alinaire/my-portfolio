import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import {
  MathUtils,
  Plane,
  PlaneGeometry,
  TorusGeometry,
  Vector3,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { useIdCardTextures } from './textures.js';
import {
  BACK_PLANE_Z,
  CARD_DEPTH,
  CARD_HEIGHT,
  CARD_WIDTH,
  CARD_Y,
  EYELET_Y,
  EYELET_Z,
  FRONT_PLANE_Z,
  PHOTO_PATH,
} from './constants.js';

function warpCardGeometry(geometry) {
  const position = geometry.attributes.position;
  const point = new Vector3();

  for (let index = 0; index < position.count; index += 1) {
    point.fromBufferAttribute(position, index);

    const normalizedX = point.x / (CARD_WIDTH / 2);
    const normalizedY = point.y / (CARD_HEIGHT / 2);
    const bow =
      Math.sin(normalizedX * Math.PI * 0.92) *
      Math.sin(normalizedY * Math.PI * 0.68) *
      0.018;

    point.z += bow;
    position.setXYZ(index, point.x, point.y, point.z);
  }

  position.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function useBadgeDrag(cardRef, motionRef) {
  const { camera, raycaster, pointer, gl } = useThree();
  const tempNormal = useRef(new Vector3());
  const releaseCapture = useRef(null);

  useEffect(() => {
    releaseCapture.current = (pointerId) => {
      if (pointerId == null) return;
      try {
        gl.domElement.releasePointerCapture?.(pointerId);
      } catch {
        // Ignore capture release issues.
      }
    };
  }, [gl]);

  const beginDrag = (event) => {
    if (event.button != null && event.button !== 0) return;

    event.stopPropagation();

    const card = cardRef.current;
    if (!card) return;

    const motion = motionRef.current;
    motion.dragging = true;
    motion.pointerId = event.pointerId;
    motion.position.copy(card.position);
    motion.rotation.set(card.rotation.x, card.rotation.y, card.rotation.z);
    motion.targetPosition.copy(motion.position);
    motion.targetRotation.copy(motion.rotation);
    motion.grabOffset.copy(event.point).sub(card.position);
    camera.getWorldDirection(tempNormal.current);
    motion.plane.setFromNormalAndCoplanarPoint(tempNormal.current, motion.position);
    gl.domElement.setPointerCapture?.(event.pointerId);
  };

  const endDrag = (event) => {
    const motion = motionRef.current;
    const activePointerId = motion.pointerId;
    if (event?.pointerId != null && activePointerId !== event.pointerId) return;

    motion.dragging = false;
    motion.pointerId = null;
    releaseCapture.current?.(activePointerId);
  };

  useFrame((state, delta) => {
    const card = cardRef.current;
    if (!card) return;

    const motion = motionRef.current;

    if (motion.dragging) {
      camera.getWorldDirection(tempNormal.current);
      motion.plane.setFromNormalAndCoplanarPoint(tempNormal.current, motion.position);

      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.ray.intersectPlane(motion.plane, motion.hitPoint);
      if (hit) {
        motion.targetPosition.copy(motion.hitPoint).sub(motion.grabOffset);
        motion.targetPosition.x = MathUtils.clamp(motion.targetPosition.x, -1.05, 1.05);
        motion.targetPosition.y = MathUtils.clamp(motion.targetPosition.y, -1.35, 0.5);
        motion.targetPosition.z = MathUtils.clamp(motion.targetPosition.z, -0.08, 0.25);

        motion.targetRotation.x = MathUtils.clamp(
          0.06 - (motion.targetPosition.y - CARD_Y) * 0.12,
          -0.28,
          0.24
        );
        motion.targetRotation.y = MathUtils.clamp(motion.targetPosition.x * 0.2, -0.34, 0.34);
        motion.targetRotation.z = MathUtils.clamp(-motion.targetPosition.x * 0.12, -0.22, 0.22);
      }
    } else {
      const idle = Math.sin(state.clock.elapsedTime * 0.8) * 0.008;
      motion.targetPosition.set(0, CARD_Y + idle, 0);
      motion.targetRotation.x = MathUtils.damp(motion.targetRotation.x, 0.04, 2.5, delta);
      motion.targetRotation.y = MathUtils.damp(motion.targetRotation.y, 0, 2.5, delta);
      motion.targetRotation.z = MathUtils.damp(motion.targetRotation.z, 0.03, 2.5, delta);
    }

    const positionSpring = motion.dragging ? 48 : 9;
    const positionDamping = motion.dragging ? 9.5 : 5.2;
    motion.velocity.x += (motion.targetPosition.x - motion.position.x) * positionSpring * delta;
    motion.velocity.y += (motion.targetPosition.y - motion.position.y) * positionSpring * delta;
    motion.velocity.z += (motion.targetPosition.z - motion.position.z) * positionSpring * delta;
    motion.velocity.multiplyScalar(Math.exp(-positionDamping * delta));
    motion.position.addScaledVector(motion.velocity, delta);
    motion.position.x = MathUtils.clamp(motion.position.x, -1.2, 1.2);
    motion.position.y = MathUtils.clamp(motion.position.y, -1.45, 0.55);
    motion.position.z = MathUtils.clamp(motion.position.z, -0.16, 0.26);

    const rotationSpring = motion.dragging ? 32 : 8;
    const rotationDamping = motion.dragging ? 7 : 5;
    motion.angularVelocity.x +=
      (motion.targetRotation.x - motion.rotation.x) * rotationSpring * delta;
    motion.angularVelocity.y +=
      (motion.targetRotation.y - motion.rotation.y) * rotationSpring * delta;
    motion.angularVelocity.z +=
      (motion.targetRotation.z - motion.rotation.z) * rotationSpring * delta;
    motion.angularVelocity.multiplyScalar(Math.exp(-rotationDamping * delta));
    motion.rotation.addScaledVector(motion.angularVelocity, delta);

    card.position.copy(motion.position);
    card.rotation.set(motion.rotation.x, motion.rotation.y, motion.rotation.z);
  });

  return { beginDrag, endDrag };
}

export default function IDCard({ cardRef, motionRef, palette }) {
  const portraitTexture = useTexture(PHOTO_PATH);
  const textures = useIdCardTextures(portraitTexture.image, palette);
  const { beginDrag, endDrag } = useBadgeDrag(cardRef, motionRef);

  const baseGeometry = useMemo(
    () => warpCardGeometry(new RoundedBoxGeometry(CARD_WIDTH, CARD_HEIGHT, CARD_DEPTH, 12, 0.08)),
    []
  );
  const faceGeometry = useMemo(
    () => new PlaneGeometry(CARD_WIDTH * 0.96, CARD_HEIGHT * 0.96),
    []
  );
  const filmGeometry = useMemo(
    () => new PlaneGeometry(CARD_WIDTH * 0.985, CARD_HEIGHT * 0.985),
    []
  );
  const headerClipGeometry = useMemo(
    () => new RoundedBoxGeometry(CARD_WIDTH * 0.74, 0.34, 0.09, 8, 0.05),
    []
  );
  const interactionGeometry = useMemo(
    () => new PlaneGeometry(CARD_WIDTH * 0.98, CARD_HEIGHT * 0.98),
    []
  );
  const eyeletGeometry = useMemo(() => new TorusGeometry(0.1, 0.024, 18, 30), []);

  useEffect(
    () => () => {
      baseGeometry.dispose();
      faceGeometry.dispose();
      filmGeometry.dispose();
      headerClipGeometry.dispose();
      interactionGeometry.dispose();
      eyeletGeometry.dispose();
    },
    [baseGeometry, faceGeometry, filmGeometry, headerClipGeometry, interactionGeometry, eyeletGeometry]
  );

  return (
    <group
      ref={cardRef}
      position={[0, CARD_Y, 0]}
      rotation={[0.05, 0, 0.04]}
    >
      <mesh geometry={baseGeometry} castShadow={false} receiveShadow={false}>
        <meshPhysicalMaterial
          color={palette.surfaceStrong}
          roughness={0.2}
          metalness={0.02}
          clearcoat={0.98}
          clearcoatRoughness={0.08}
          roughnessMap={textures?.imperfections ?? null}
          envMapIntensity={1.05}
        />
      </mesh>

      {textures?.back && (
        <mesh geometry={faceGeometry} position={[0, 0, BACK_PLANE_Z]} rotation={[0, Math.PI, 0]}>
          <meshBasicMaterial map={textures.back} toneMapped={false} depthWrite={false} />
        </mesh>
      )}

      {textures?.front && (
        <mesh geometry={faceGeometry} position={[0, 0, FRONT_PLANE_Z]}>
          <meshBasicMaterial map={textures.front} toneMapped={false} depthWrite={false} />
        </mesh>
      )}

      {textures?.imperfections && (
        <mesh geometry={faceGeometry} position={[0, 0, FRONT_PLANE_Z + 0.01]}>
          <meshPhysicalMaterial
            map={textures.imperfections}
            alphaMap={textures.imperfections}
            color="#ffffff"
            transparent
            opacity={0.08}
            roughness={0.08}
            metalness={0}
            clearcoat={1}
            clearcoatRoughness={0.03}
            iridescence={1}
            iridescenceIOR={1.38}
            iridescenceThicknessRange={[120, 420]}
            depthWrite={false}
          />
        </mesh>
      )}

      {textures?.imperfections && (
        <mesh
          geometry={faceGeometry}
          position={[0, 0, BACK_PLANE_Z - 0.01]}
          rotation={[0, Math.PI, 0]}
        >
          <meshPhysicalMaterial
            map={textures.imperfections}
            alphaMap={textures.imperfections}
            color="#ffffff"
            transparent
            opacity={0.045}
            roughness={0.1}
            metalness={0}
            clearcoat={1}
            clearcoatRoughness={0.04}
            iridescence={0.65}
            iridescenceIOR={1.34}
            iridescenceThicknessRange={[80, 320]}
            depthWrite={false}
          />
        </mesh>
      )}

      <mesh geometry={filmGeometry} position={[0, 0, FRONT_PLANE_Z + 0.018]}>
        <meshPhysicalMaterial
          color={palette.accentSoft}
          transparent
          opacity={0.05}
          roughness={0.08}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.02}
          iridescence={1}
          iridescenceIOR={1.3}
          iridescenceThicknessRange={[100, 520]}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh
        geometry={filmGeometry}
        position={[0, 0, BACK_PLANE_Z - 0.018]}
        rotation={[0, Math.PI, 0]}
      >
        <meshPhysicalMaterial
          color={palette.accentSoft}
          transparent
          opacity={0.03}
          roughness={0.1}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.03}
          iridescence={0.7}
          iridescenceIOR={1.28}
          iridescenceThicknessRange={[80, 420]}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh geometry={eyeletGeometry} position={[0, EYELET_Y, EYELET_Z]} castShadow={false}>
        <meshStandardMaterial color={palette.border} roughness={0.18} metalness={0.92} />
      </mesh>

      <mesh
        geometry={headerClipGeometry}
        position={[0, CARD_HEIGHT / 2 + 0.18, CARD_DEPTH / 2 + 0.028]}
        renderOrder={10}
      >
        <meshPhysicalMaterial
          color={palette.accentStrong}
          roughness={0.16}
          metalness={0.08}
          clearcoat={0.18}
          clearcoatRoughness={0.08}
          envMapIntensity={0.65}
        />
      </mesh>

      <mesh
        geometry={headerClipGeometry}
        position={[0, CARD_HEIGHT / 2 + 0.03, CARD_DEPTH / 2 + 0.031]}
        scale={[1, 0.1, 0.98]}
        renderOrder={11}
      >
        <meshPhysicalMaterial
          color={palette.accent}
          roughness={0.12}
          metalness={0.02}
          clearcoat={0.12}
          clearcoatRoughness={0.06}
          envMapIntensity={0.55}
        />
      </mesh>

      <mesh
        geometry={interactionGeometry}
        position={[0, 0, FRONT_PLANE_Z + 0.06]}
        onPointerDown={beginDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
      >
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <mesh
        geometry={interactionGeometry}
        position={[0, 0, BACK_PLANE_Z - 0.06]}
        rotation={[0, Math.PI, 0]}
        onPointerDown={beginDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
      >
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}
