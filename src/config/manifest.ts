import local from "../../manifests/dev/deployment/manifest.json";
import slot from "../../manifests/slot/deployment/manifest.json";
import slotdev from "../../manifests/slotdev/deployment/manifest.json";
import sepolia from "../../manifests/sepolia/deployment/manifest.json";
import sepoliadev1 from "../../manifests/sepoliadev1/deployment/manifest.json";
import sepoliadev2 from "../../manifests/sepoliadev2/deployment/manifest.json";

const deployType = import.meta.env.VITE_PUBLIC_DEPLOY_TYPE;

const manifests = {
  sepolia,
  sepoliadev1,
  sepoliadev2,
  slot,
  slotdev,
};

// Fallback to `local` if deployType is not a key in `manifests`
export const manifest = deployType in manifests ? manifests[deployType] : local;

console.log("manifest", manifest);

export type Manifest = typeof manifest;
