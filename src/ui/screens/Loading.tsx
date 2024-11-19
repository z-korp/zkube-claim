import ImageAssets from "@/ui/theme/ImageAssets";
import { useTheme } from "@/ui/elements/theme-provider/hooks";
import { Boxes } from "../components/BackgroundBoxes";
import { cn } from "@/lib/utils";
import { BackgroundGradient } from "../components/BackgroundGradient";
import ConfettiExplosion from "../components/ConfettiExplosion";

export const Loading = ({
  enter,
  setEnter,
}: {
  enter: boolean;
  setEnter: (state: boolean) => void;
}) => {
  const { themeTemplate } = useTheme();
  const imgAssets = ImageAssets(themeTemplate);

  return (
    <div
      className={cn(
        "h-screen-viewport relative overflow-hidden bg-slate-900 flex flex-col items-center justify-center rounded-lg gap-8",
      )}
    >
      <div
        className={cn(
          "absolute inset-0 w-full h-full bg-slate-900 z-20 [mask-image:radial-gradient(transparent,white)] pointer-events-none",
        )}
      />

      <Boxes />

      <h1 className="md:text-8xl text-4xl text-neon animate-neon my-10 z-20">
        zKube AirDrop
      </h1>

      <br></br>

      <div className={`relative ${enter && "animate-load"}`}>
        <img
          src={imgAssets.logo}
          alt="logo"
          className={`h-32 md:h-40 z-20 relative`}
        />
        <div className="absolute inset-0 rounded-full bg-[#66D4F6] blur-xl opacity-60 animate-pulseOpacity z-10"></div>
      </div>

      <br></br>

      <div className="my-10 z-20">
        <BackgroundGradient className="bg-slate-900">
          <button className="p-4 text-4xl" onClick={() => setEnter(true)}>
            <ConfettiExplosion enter={enter}>
              {enter ? "Loading ..." : "Enter"}{" "}
            </ConfettiExplosion>
          </button>
        </BackgroundGradient>
      </div>
      {/* Logo and Enter Button */}
    </div>
  );
};
