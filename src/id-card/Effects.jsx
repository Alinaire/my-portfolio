import { EffectComposer, Bloom, DepthOfField, Noise, Vignette } from '@react-three/postprocessing';

export default function Effects() {
  return (
    <EffectComposer multisampling={4} depthBuffer>
      <DepthOfField
        target={[0, 0.1, 0]}
        focusDistance={0.02}
        focalLength={0.028}
        bokehScale={2.2}
        resolutionScale={0.85}
      />
      <Bloom
        intensity={0.28}
        luminanceThreshold={0.7}
        luminanceSmoothing={0.16}
      />
      <Noise opacity={0.02} />
      <Vignette offset={0.14} darkness={0.72} />
    </EffectComposer>
  );
}
