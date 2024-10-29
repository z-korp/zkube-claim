import { useDojo } from "@/dojo/useDojo";
import useViewport from "@/hooks/useViewport";
import { useQuerySync } from "@dojoengine/react";
import { Schema } from "@dojoengine/recs";
import Airdrop from "../modules/Airdrop";
import ImageAssets from "../theme/ImageAssets";
import { useTheme } from "@/ui/elements/theme-provider/hooks";
export const HomePage = () => {
  const {
    setup: { toriiClient, contractComponents },
  } = useDojo();

  const { themeTemplate } = useTheme();
  const imgAssets = ImageAssets(themeTemplate);

  useViewport();

  useQuerySync<Schema>(toriiClient, Object.values(contractComponents), []);

  return (
    <div className="relative">
      {/* Background Layer */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div
          className="absolute inset-0 bg-cover bg-center animate-zoom-in-out"
          style={{ backgroundImage: `url('${imgAssets.background}')` }}
        />
      </div>

      {/* Content Layer */}
      <div className="relative z-10">
        <div className="flex justify-center items-center min-h-screen">
          <Airdrop />
        </div>
      </div>
    </div>
  );
};
