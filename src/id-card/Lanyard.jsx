import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  CubicBezierCurve3,
  MathUtils,
  TorusGeometry,
  Vector3,
} from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { createFabricTexture } from './textures.js';
import {
  CARD_Y,
  EYELET_Y,
  EYELET_Z,
  LANYARD_SEGMENT_COUNT,
  LANYARD_SEGMENT_DEPTH,
  LANYARD_SEGMENT_LENGTH,
  LANYARD_SEGMENT_WIDTH,
  LANYARD_TOP_Y,
} from './constants.js';

function updateSegment(mesh, start, end, radius, direction, upAxis) {
  if (!mesh) return;

  direction.subVectors(end, start);
  const length = direction.length();
  if (!length) return;

  mesh.position.copy(start).add(end).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(upAxis, direction.normalize());
  mesh.scale.set(radius, length, radius);
}

function AnchorRing({ palette }) {
  const ringGeometry = useMemo(() => new TorusGeometry(0.16, 0.038, 18, 30), []);

  useEffect(
    () => () => {
      ringGeometry.dispose();
    },
    [ringGeometry]
  );

  return (
    <mesh geometry={ringGeometry} castShadow={false} receiveShadow={false}>
      <meshStandardMaterial color={palette.border} roughness={0.26} metalness={0.86} />
    </mesh>
  );
}

export default function Lanyard({ cardRef, motionRef, palette }) {
  const fabricTexture = useMemo(() => createFabricTexture(palette), [palette]);
  const segmentRefs = useRef([]);
  const shineRefs = useRef([]);
  const terminalRef = useRef(null);
  const curvePoints = useMemo(
    () => [new Vector3(), new Vector3(), new Vector3(), new Vector3()],
    []
  );
  const curve = useMemo(
    () =>
      new CubicBezierCurve3(
        curvePoints[0],
        curvePoints[1],
        curvePoints[2],
        curvePoints[3]
      ),
    [curvePoints]
  );
  const tempStart = useMemo(() => new Vector3(), []);
  const tempEnd = useMemo(() => new Vector3(), []);
  const attachmentOffset = useMemo(() => new Vector3(0, EYELET_Y, EYELET_Z), []);
  const worldAttachmentOffset = useMemo(() => new Vector3(), []);
  const tempDirection = useMemo(() => new Vector3(), []);
  const upAxis = useMemo(() => new Vector3(0, 1, 0), []);
  const ringGeometry = useMemo(() => new TorusGeometry(0.1, 0.024, 16, 28), []);
  const clipGeometry = useMemo(
    () => new RoundedBoxGeometry(0.24, 0.38, 0.08, 5, 0.02),
    []
  );
  const segmentGeometry = useMemo(
    () =>
      new RoundedBoxGeometry(
        LANYARD_SEGMENT_WIDTH,
        LANYARD_SEGMENT_LENGTH,
        LANYARD_SEGMENT_DEPTH,
        4,
        0.02
      ),
    []
  );
  const shineGeometry = useMemo(
    () =>
      new RoundedBoxGeometry(
        LANYARD_SEGMENT_WIDTH * 0.72,
        LANYARD_SEGMENT_LENGTH * 0.94,
        LANYARD_SEGMENT_DEPTH * 0.42,
        4,
        0.012
      ),
    []
  );

  useEffect(
    () => () => {
      fabricTexture.dispose();
      ringGeometry.dispose();
      clipGeometry.dispose();
      segmentGeometry.dispose();
      shineGeometry.dispose();
    },
    [clipGeometry, fabricTexture, ringGeometry, segmentGeometry, shineGeometry]
  );

  useFrame((state, delta) => {
    const motion = motionRef.current;
    const card = cardRef.current;

    const top = curvePoints[0];
    const control1 = curvePoints[1];
    const control2 = curvePoints[2];
    const attachment = curvePoints[3];

    top.set(0, LANYARD_TOP_Y, 0);

    if (card) {
      worldAttachmentOffset.copy(attachmentOffset).applyEuler(card.rotation);
      attachment.copy(card.position).add(worldAttachmentOffset);
    } else {
      attachment.set(0, CARD_Y + EYELET_Y, EYELET_Z);
    }

    const speed = motion.velocity.length();
    const stretch = MathUtils.clamp(speed * 0.14 + (motion.dragging ? 0.08 : 0), 0, 0.7);
    const sway = Math.sin(state.clock.elapsedTime * 0.9) * (motion.dragging ? 0.01 : 0.03);

    const control1TargetX = attachment.x * 0.18 + sway + motion.velocity.x * 0.08;
    const control1TargetY = LANYARD_TOP_Y - 0.46 - stretch * 0.14;
    const control1TargetZ = attachment.z * 0.18 + motion.velocity.z * 0.06;

    const control2TargetX = attachment.x * 0.62 + motion.velocity.x * 0.18;
    const control2TargetY = attachment.y + 0.42 + stretch * 0.16;
    const control2TargetZ = attachment.z * 0.42 + motion.velocity.z * 0.08;

    control1.x = MathUtils.damp(control1.x, control1TargetX, 6.5, delta);
    control1.y = MathUtils.damp(control1.y, control1TargetY, 6.5, delta);
    control1.z = MathUtils.damp(control1.z, control1TargetZ, 6.5, delta);

    control2.x = MathUtils.damp(control2.x, control2TargetX, 5.5, delta);
    control2.y = MathUtils.damp(control2.y, control2TargetY, 5.5, delta);
    control2.z = MathUtils.damp(control2.z, control2TargetZ, 5.5, delta);

    const segmentRadius = 0.13 + stretch * 0.03;

    for (let index = 0; index < LANYARD_SEGMENT_COUNT; index += 1) {
      const start = curve.getPoint(index / LANYARD_SEGMENT_COUNT, tempStart);
      const end = curve.getPoint((index + 1) / LANYARD_SEGMENT_COUNT, tempEnd);
      updateSegment(segmentRefs.current[index], start, end, segmentRadius, tempDirection, upAxis);

      const shine = shineRefs.current[index];
      if (shine) {
        updateSegment(
          shine,
          start,
          end,
          segmentRadius * 0.58,
          tempDirection,
          upAxis
        );
        shine.position.z += 0.004;
      }
    }

    if (terminalRef.current) {
      terminalRef.current.position.copy(attachment);
      terminalRef.current.rotation.x = MathUtils.damp(
        terminalRef.current.rotation.x,
        0.16 + motion.rotation.x * 0.2,
        6.5,
        delta
      );
      terminalRef.current.rotation.z = MathUtils.damp(
        terminalRef.current.rotation.z,
        motion.rotation.y * 0.18,
        6.5,
        delta
      );
    }
  });

  return (
    <group>
      <group position={[0, LANYARD_TOP_Y, 0]}>
        <AnchorRing palette={palette} />
      </group>

      {Array.from({ length: LANYARD_SEGMENT_COUNT }).map((_, index) => (
        <group key={`lanyard-segment-${index}`}>
          <mesh
            ref={(node) => {
              segmentRefs.current[index] = node;
            }}
            geometry={segmentGeometry}
            castShadow={false}
            receiveShadow={false}
          >
            <meshPhysicalMaterial
              map={fabricTexture}
              color={palette.accentStrong}
              roughness={0.88}
              metalness={0.02}
              clearcoat={0.1}
              clearcoatRoughness={0.18}
              envMapIntensity={0.45}
            />
          </mesh>
          <mesh
            ref={(node) => {
              shineRefs.current[index] = node;
            }}
            geometry={shineGeometry}
            castShadow={false}
            receiveShadow={false}
          >
            <meshBasicMaterial color="#ffffff" transparent opacity={0.12} />
          </mesh>
        </group>
      ))}

      <group ref={terminalRef} position={[0, CARD_Y + EYELET_Y, 0]}>
        <mesh
          geometry={ringGeometry}
          position={[0, 0.02, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow={false}
        >
          <meshStandardMaterial color={palette.surfaceStrong} roughness={0.22} metalness={0.9} />
        </mesh>

        <mesh geometry={clipGeometry} position={[0, -0.22, 0.01]} castShadow={false}>
          <meshPhysicalMaterial
            color={palette.surfaceStrong}
            roughness={0.16}
            metalness={0.96}
            clearcoat={0.22}
            clearcoatRoughness={0.08}
          />
        </mesh>
      </group>
    </group>
  );
}
