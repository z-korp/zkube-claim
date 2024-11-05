import { useState, useEffect, useRef } from "react";
import { formatPrize } from "@/utils/wei";
import { useChest } from "@/hooks/useChest";
import { Separator } from "../elements/separator";
import { useAllChests } from "@/hooks/useAllChests";
import { useTournaments } from "@/hooks/useTournaments";
import { Progress } from "../elements/progress";
import { Card, CardContent, CardHeader, CardTitle } from "../elements/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../elements/tabs";
import { gsap } from "gsap";

const { VITE_PUBLIC_GAME_TOKEN_SYMBOL } = import.meta.env;

export const SponsoPage = () => {
  const chests = useAllChests();

  const initialChestIndex = chests.findIndex(
    (chest) => chest.points < chest.point_target,
  );

  const [currentChestIndex, setCurrentChestIndex] = useState(
    initialChestIndex !== -1 ? initialChestIndex : 0,
  );

  const currentChest = chests[currentChestIndex];
  const chestRef = useRef(null);
  const particlesRef = useRef(null);

  const startAnimation = () => {
    gsap.to(chestRef.current, {
      y: 20,
      duration: 1,
      yoyo: true,
      repeat: -1,
      ease: "power1.inOut",
    });
    if (particlesRef.current) {
      const particles = (particlesRef.current as HTMLElement).querySelectorAll(".particle");
      particles.forEach((particle) => {
        gsap.to(particle, {
          x: "random(-200, 200)",
          y: "random(-200, 200)",
          opacity: 0,
          duration: "random(2, 5)",
          repeat: -1,
          ease: "power1.inOut",
          onUpdate: () => {
            (particle as HTMLElement).style.overflow = "hidden";
          },
        });
      });
    }
  };

  useEffect(() => {
    startAnimation();
  }, []);

  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto overflow-y-auto h-full items-center">
      <Card className="bg-gray-900">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white text-center">
            ZKube Chest
          </CardTitle>
          <Tabs defaultValue="chest" className="w-[400px] md-4 border-red-500">
            <div className="flex justify-center">
              <TabsList className="">
                <TabsTrigger value="chest" className="mx-auto" onClick={startAnimation}>
                  Chest
                </TabsTrigger>
                <TabsTrigger value="tournaments" className="mx-auto">
                  Tournaments
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="chest">
              <CardContent className="space-y-6 overflow-y-auto">
                <div className="relative rounded-lg bg-gray-800 p-4 flex flex-col items-center">
                  <div ref={particlesRef} className="absolute inset-0 z-0 overflow-hidden">
                    {Array.from({ length: 100 }).map((_, index) => (
                      <div
                        key={index}
                        className="particle w-2 h-2 bg-yellow-500 rounded-full absolute"
                        style={{
                          top: "35%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                        }}
                      ></div>
                    ))}
                  </div>
                  <img
                    ref={chestRef}
                    className={`relative z-10 self-center h-[180px] ${currentChest.points === 0 && "grayscale"}`}
                    src={currentChest.getIcon()}
                  />
                  <Separator className="w-full h-10 bg-transparent" />
                  <p>{`Total Prize: ${formatPrize(currentChest.prize, VITE_PUBLIC_GAME_TOKEN_SYMBOL)}`}</p>
                  <h1>
                    {currentChest.points.toString()}/
                    {currentChest.point_target.toString()} points ({(currentChest.points / currentChest.point_target) * 100} %)
                   
                  </h1>
                  <Progress
                    value={
                      (currentChest.points / currentChest.point_target) * 100
                    }
                    className="w-full h-6 mt-6"
                  />
                </div>
              </CardContent>
            </TabsContent>
            <TabsContent value="tournaments">
              <CardContent className="space-y-6 overflow-y-auto"></CardContent>
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  );
};
