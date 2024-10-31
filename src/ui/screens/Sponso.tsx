import { useState } from "react";
import { formatPrize } from "@/utils/wei";
import { useChest } from "@/hooks/useChest";
import { Separator } from "../elements/separator";
import { useAllChests } from "@/hooks/useAllChests";
import { useTournaments } from "@/hooks/useTournaments";
import { Progress } from "../elements/progress";
import { Card, CardContent, CardHeader, CardTitle } from "../elements/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../elements/tabs";

const { VITE_PUBLIC_GAME_TOKEN_SYMBOL } = import.meta.env;

export const SponsoPage = () => {
  const { chest } = useChest({ id: 1 });
  const chests = useAllChests();

  const initialChestIndex = chests.findIndex(
    (chest) => chest.points < chest.point_target,
  );

  const [currentChestIndex, setCurrentChestIndex] = useState(
    initialChestIndex !== -1 ? initialChestIndex : 0,
  );

  const currentChest = chests[currentChestIndex];

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
                <TabsTrigger value="chest" className="mx-auto">
                  Chest
                </TabsTrigger>
                <TabsTrigger value="tournaments" className="mx-auto">
                  Tournaments
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="chest">
              <CardContent className="space-y-6 overflow-y-auto">
                <div className="rounded-lg bg-gray-800 p-4 flex flex-col items-center">
                  <img
                    className={`self-center h-[180px] ${currentChest.points === 0 && "grayscale"}`}
                    src={currentChest.getIcon()}
                  />
                  <Separator className="w-full h-10" />
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
