import { useDojo } from "@/dojo/useDojo";
import useViewport from "@/hooks/useViewport";
import { useQuerySync } from "@dojoengine/react";
import { Schema } from "@dojoengine/recs";
import Airdrop from "../modules/Airdrop";
import { Boxes } from "../components/BackgroundBoxes";
export const HomePage = () => {
  const {
    setup: { toriiClient, contractComponents },
  } = useDojo();

  useViewport();

  useQuerySync<Schema>(toriiClient, Object.values(contractComponents), []);

  return (
    <div className="relative">
      {/* Background Layer */}
      <div className="absolute inset-0 w-full h-full bg-slate-900 z-20 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
      <Boxes />
      <div className="flex justify-center items-center min-h-screen">
        <Airdrop />
      </div>

      {/* Content Layer */}
    </div>
  );
};
