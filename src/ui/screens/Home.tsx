import { useDojo } from "@/dojo/useDojo";
import useViewport from "@/hooks/useViewport";
import { useQuerySync } from "@dojoengine/react";
import { Schema } from "@dojoengine/recs";
import Airdrop from "../modules/Airdrop";
import { Boxes } from "../components/BackgroundBoxes";
import ImageAssets from "../theme/ImageAssets";
import useTemplateTheme from "@/hooks/useTemplateTheme";
import { useMediaQuery } from "react-responsive";
import ConfettiExplosion from "../components/ConfettiExplosion";
export const HomePage = () => {
  const {
    setup: { toriiClient, contractComponents },
  } = useDojo();

  useViewport();

  useQuerySync<Schema>(toriiClient, Object.values(contractComponents), []);
  const { themeTemplate } = useTemplateTheme();
  const imgAssets = ImageAssets(themeTemplate);
  const isMdOrLarger = useMediaQuery({ query: "(min-width: 768px)" });

  return (
    <div
      className={`relative ${!isMdOrLarger && "overflow-y-auto overflow-x-hidden"}`}
    >
      {/* Background Layer */}
      <div className="absolute inset-0 w-full h-full bg-slate-900 z-10 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
      <ConfettiExplosion enter={false}>
        <Boxes />

        <div className="flex flex-col gap-8 justify-center items-center min-h-screen">
          <h1 className="text-8xl mb-8 text-neon animate-neon z-20">zKube</h1>
          <div
            className={`flex justify-center w-[95%] items-center ${isMdOrLarger ? "px-24" : ""}`}
          >
            {isMdOrLarger && (
              <div className={`relative animate-load z-20`}>
                <img
                  src={imgAssets.logo}
                  alt="logo"
                  className={`h-32 md:h-40 z-20 relative`}
                />
                <div className="absolute inset-0 rounded-full bg-[#66D4F6] blur-xl opacity-60 animate-pulseOpacity z-10"></div>
              </div>
            )}
            <Airdrop />
            {isMdOrLarger && (
              <div className={`relative animate-load z-20`}>
                <img
                  src={imgAssets.logo}
                  alt="logo"
                  className={`h-32 md:h-40 z-20 relative`}
                />
                <div className="absolute inset-0 rounded-full bg-[#66D4F6] blur-xl opacity-60 animate-pulseOpacity z-10"></div>
              </div>
            )}
          </div>
          <br></br>
          <div className={`relative animate-load z-20`}>
            <img
              src={imgAssets.logo}
              alt="logo"
              className={`h-32 md:h-40 z-20 relative`}
            />
            <div className="absolute inset-0 rounded-full bg-[#66D4F6] blur-xl opacity-60 animate-pulseOpacity z-10"></div>
          </div>
        </div>
      </ConfettiExplosion>

      {/* Content Layer */}
    </div>
  );
};
