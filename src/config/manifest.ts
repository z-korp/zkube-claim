import local from "../../manifests/manifest_dev.json";
import slot from "../../manifests/manifest_slot.json";
import slotdev from "../../manifests/manifest_slotdev.json";
import sepolia from "../../manifests/manifest_sepolia.json";
import mainnet from "../../manifests/manifest_mainnet.json";
import sepoliadev1 from "../../manifests/manifest_sepoliadev1.json";
import sepoliadev2 from "../../manifests/manifest_sepoliadev2.json";

const deployType = import.meta.env.VITE_PUBLIC_DEPLOY_TYPE;

const manifests = {
  mainnet,
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
