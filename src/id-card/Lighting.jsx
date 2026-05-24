import { Environment } from '@react-three/drei';

export default function Lighting({ palette }) {
  return (
    <>
      <ambientLight intensity={1.15} color={palette.surfaceStrong} />
      <directionalLight
        position={[4.5, 6.5, 7.5]}
        intensity={1.75}
        color={palette.surfaceStrong}
      />
      <directionalLight
        position={[-5, 2.2, 5.2]}
        intensity={0.55}
        color={palette.accentSoft}
      />
      <pointLight position={[0, 3.8, 5.5]} intensity={0.7} color="#ffffff" />
      <Environment preset="studio" background={false} />
    </>
  );
}
