import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../elements/card";
import { useDojo } from "@/dojo/useDojo";
import { getSyncEntities } from "@dojoengine/state";
import * as torii from "@dojoengine/torii-client";
import { useFreeMints } from "@/hooks/useFreeMints";

export const MintCheckPage = () => {
  const {
    setup: { toriiClient, contractComponents },
  } = useDojo();

  useEffect(() => {
    const clause: torii.KeysClause = {
      keys: [undefined],
      pattern_matching: "FixedLen",
      models: ["zkube-Mint"],
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

  const mints = useFreeMints();

  return (
    <div className="container flex flex-col gap-4 w-full max-w-6xl mx-auto overflow-y-auto h-[calc(100%-5rem)] mt-20">
      <Card className="bg-gray-900">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white text-center">
            zKube Mint check
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 overflow-y-auto">
          <div className="rounded-lg bg-gray-800 p-4 space-y-5">
            <div>
              {mints.map((mint) => (
                <div className="flex gap-3">
                  <div className="w-[600px]">{mint.player_id}</div>
                  <div className="w-[40px]">{mint.number}</div>
                  <div className="w-[140px]">{mint.expiration_timestamp}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
