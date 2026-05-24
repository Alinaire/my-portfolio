import { Physics as RapierPhysics } from '@react-three/rapier';

export default function Physics({ children }) {
  return (
    <RapierPhysics
      gravity={[0, -9.81, 0]}
      allowedLinearError={0.0005}
      numSolverIterations={12}
      numInternalPgsIterations={2}
      maxCcdSubsteps={6}
      predictionDistance={0.003}
      contactNaturalFrequency={30}
      timeStep="vary"
      updateLoop="follow"
      colliders={false}
      interpolate
    >
      {children}
    </RapierPhysics>
  );
}
