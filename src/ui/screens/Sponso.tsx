import { useState, useEffect, useRef } from "react";
import { formatPrize } from "@/utils/wei";
import { Separator } from "../elements/separator";
import { useAllChests } from "@/hooks/useAllChests";
import { Progress } from "../elements/progress";
import { Card, CardContent, CardHeader, CardTitle } from "../elements/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../elements/tabs";
import { gsap } from "gsap";
import { SponsorChest } from "../actions/SponsorChest";
import { ModeType } from "@/dojo/game/types/mode";
import useTournament from "@/hooks/useTournament";
import { Trophy } from "lucide-react";
import { Tournament } from "@/dojo/game/models/tournament";
import { SponsorTournament } from "../actions/SponsorTournament";
import TournamentTimer from "../components/TournamentTimer";
import { getSyncEntities } from "@dojoengine/state";
import { useDojo } from "@/dojo/useDojo";
import * as torii from "@dojoengine/torii-client";

const { VITE_PUBLIC_GAME_TOKEN_SYMBOL } = import.meta.env;

interface TournamentCardProps {
  title: string;
  tournament: Tournament | null;
  endTimestamp: number | null;
  tournamentId: number;
  mode: ModeType;
}

const TournamentCard: React.FC<TournamentCardProps> = ({
  title,
  tournament,
  endTimestamp,
  tournamentId,
  mode,
}) => {
  return (
    <div className="rounded-lg bg-gray-800 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h3 className="text-md font-semibold">{title}</h3>
        </div>
        {endTimestamp && (
          <div className="text-sm text-gray-400">
            <TournamentTimer mode={mode} endTimestamp={endTimestamp} />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Current Prize Pool:</span>
          <span className="font-medium">
            {formatPrize(
              tournament?.prize || 0n,
              VITE_PUBLIC_GAME_TOKEN_SYMBOL,
            )}
          </span>
        </div>
      </div>

      <SponsorTournament tournament_id={tournamentId} mode={mode} />
    </div>
  );
};

export const SponsoPage = () => {
  const {
    setup: { toriiClient, contractComponents },
  } = useDojo();

  useEffect(() => {
    const clause: torii.KeysClause = {
      keys: [undefined],
      pattern_matching: "FixedLen",
      models: ["zkube-Participation", "zkube-Tournament"],
    };

    const syncEntities = async () => {
      await getSyncEntities(
        toriiClient,
        contractComponents as any,
        { Keys: clause },
        [],
        30_000,
        false,
      );
    };

    syncEntities();
  }, []);

  const chests = useAllChests();

  const {
    endTimestamp: dailyEndTimestamp,
    tournament: dailyTournament,
    id: dailyTournamentId,
  } = useTournament(ModeType.Daily);

  const {
    endTimestamp: normalEndTimestamp,
    tournament: normalTournament,
    id: normalTournamentId,
  } = useTournament(ModeType.Normal);

  const initialChestIndex = chests.findIndex(
    (chest) => chest.points < chest.point_target,
  );

  const [currentChestIndex, setCurrentChestIndex] = useState(
    initialChestIndex !== -1 ? initialChestIndex : 0,
  );

  const currentChest = chests[currentChestIndex];
  const chestRef = useRef<HTMLImageElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  const startAnimation = () => {
    if (chestRef.current) {
      gsap.to(chestRef.current, {
        y: 20,
        duration: 1,
        yoyo: true,
        repeat: -1,
        ease: "power1.inOut",
      });
    }
    if (particlesRef.current) {
      const particles =
        particlesRef.current.querySelectorAll<HTMLElement>(".particle");
      particles.forEach((particle) => {
        gsap.to(particle, {
          x: "random(-200, 200)",
          y: "random(-200, 200)",
          opacity: 0,
          duration: "random(2, 5)",
          repeat: -1,
          ease: "power1.inOut",
          onUpdate: () => {
            particle.style.overflow = "hidden";
          },
        });
      });
    }
  };

  useEffect(() => {
    startAnimation();
  }, []);

  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto overflow-y-auto h-full items-center mt-20">
      <Card className="bg-gray-900">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white text-center">
            zKube Sponso
          </CardTitle>
          <Tabs defaultValue="chest" className="w-[400px] md-4 border-red-500">
            <div className="flex justify-center">
              <TabsList className="">
                <TabsTrigger
                  value="chest"
                  className="mx-auto"
                  onClick={startAnimation}
                >
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
                  <div
                    ref={particlesRef}
                    className="absolute inset-0 z-0 overflow-hidden"
                  >
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
                    {currentChest.point_target.toString()} points (
                    {(
                      (currentChest.points / currentChest.point_target) *
                      100
                    ).toFixed(2)}{" "}
                    %)
                  </h1>
                  <Progress
                    value={
                      (currentChest.points / currentChest.point_target) * 100
                    }
                    className="w-full h-6 mt-6"
                  />
                </div>
                {currentChest && <SponsorChest chest_id={currentChest.id} />}
              </CardContent>
            </TabsContent>
            <TabsContent value="tournaments">
              <CardContent className="space-y-6 overflow-y-auto">
                <TournamentCard
                  title="Daily Tournament"
                  tournament={dailyTournament}
                  endTimestamp={dailyEndTimestamp}
                  tournamentId={dailyTournamentId}
                  mode={ModeType.Daily}
                />
                <TournamentCard
                  title="Normal Tournament"
                  tournament={normalTournament}
                  endTimestamp={normalEndTimestamp}
                  tournamentId={normalTournamentId}
                  mode={ModeType.Normal}
                />
              </CardContent>
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  );
};
