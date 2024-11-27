import useStats from "@/hooks/useStats";
import { convertToCSV } from "@/utils/csv";
import { saveAs } from "file-saver"; // Install with `npm install file-saver`
import { Button } from "../elements/button";
import { formatPrize } from "@/utils/wei";
import { getSyncEntities } from "@dojoengine/state";
import { useEffect } from "react";
import { useDojo } from "@/dojo/useDojo";
import * as torii from "@dojoengine/torii-client";

export const StatsPage = () => {
  const {
    setup: { toriiClient, contractComponents },
  } = useDojo();

  useEffect(() => {
    const clause: torii.KeysClause = {
      keys: [undefined],
      pattern_matching: "FixedLen",
      models: [
        "zkube-Player",
        "zkube-Game",
        "zkube-Participation",
        "zkube-Tournament",
      ],
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

  const {
    topPlayers,
    totalScore,
    topGames,
    finishedGames,
    ongoingGames,
    statsByMode,
    chests,
    participations,
  } = useStats();

  // Create a mapping of player IDs to player names
  const playerIdToName = new Map();

  topPlayers.forEach((player) => {
    // Convert player.id to a string to ensure consistent key types
    playerIdToName.set("0x" + BigInt(player.id).toString(16), player.name);
  });

  const exportDataToCSV = () => {
    // Prepare data

    // Create a mapping of player IDs to player names
    const playerIdToName = new Map();

    topPlayers.forEach((player) => {
      // Ensure the ID is a string for consistent mapping
      playerIdToName.set("0x" + BigInt(player.id).toString(16), player.name);
    });

    // Export players data
    const playerHeaders = [
      "id",
      "name",
      "points",
      "level",
      "chest_contribution",
      "chest_prize_share",
    ];
    const playerData = topPlayers.map((player) => ({
      id: "0x" + BigInt(player.id).toString(16),
      name: player.name,
      points: player.points.toString(),
      level: player.level.value,
      chest_contribution: player.chestContribution.toString(),
      chest_prize_share: formatPrize(
        player.chestPrizeShare.toString(),
        "LORDS",
      ),
    }));

    const playerCSV = convertToCSV(playerData, playerHeaders);

    // Export games data
    const gameHeaders = [
      "id",
      "player_id",
      "player_name",
      "mode",
      "score",
      "combo",
      "max_combo",
      "score_in_tournament",
      "combo_in_tournament",
      "max_combo_in_tournament",
      "status",
    ];
    const gameData = topGames.map((game) => ({
      id: game.id,
      player_id: game.player_id.toString(),
      player_name: playerIdToName.get(game.player_id.toString()) || "Unknown",
      mode: game.mode.value,
      score: game.score,
      combo: game.combo,
      max_combo: game.max_combo,
      score_in_tournament: game.score_in_tournament,
      combo_in_tournament: game.combo_counter_in_tournament,
      max_combo_in_tournament: game.max_combo_in_tournament,
      status: game.isOver() ? "Finished" : "Ongoing",
    }));

    const gameCSV = convertToCSV(gameData, gameHeaders);

    // Export chests data
    const chestHeaders = [
      "id",
      "name",
      "points",
      "point_target",
      "prize",
      "status",
    ];
    const chestData = chests.map((chest) => ({
      id: chest.id.toString(),
      name: `Chest ${chest.id}`,
      points: chest.points.toString(),
      point_target: chest.point_target.toString(),
      prize: formatPrize(chest.prize, "LORDS"),
      status: chest.isCompleted() ? "Open" : "Closed",
    }));

    const chestCSV = convertToCSV(chestData, chestHeaders);

    // Export participations data
    const participationHeaders = [
      "chest_id",
      "player_id",
      "player_name",
      "points",
      "proportional_prize", // Include the new field
      "percentage", // Include percentage if needed
    ];
    const participationData = participations.map((participation) => ({
      chest_id: participation.chest_id.toString(),
      player_id: "0x" + BigInt(participation.player_id).toString(16),
      player_name:
        playerIdToName.get(
          "0x" + BigInt(participation.player_id).toString(16),
        ) || "Unknown",
      points: participation.points.toString(),
      proportional_prize: formatPrize(
        participation.proportionalPrize.toString(),
        "LORDS",
      ), // Format prize if included
      percentage: participation.percentage.toFixed(2) + "%", // Format percentage if included
    }));

    const participationCSV = convertToCSV(
      participationData,
      participationHeaders,
    );

    // Save players CSV
    const blobPlayers = new Blob([playerCSV], {
      type: "text/csv;charset=utf-8;",
    });
    saveAs(blobPlayers, "players.csv");

    // Save games CSV
    const blobGames = new Blob([gameCSV], {
      type: "text/csv;charset=utf-8;",
    });
    saveAs(blobGames, "games.csv");

    // Save chests CSV
    const blobChests = new Blob([chestCSV], {
      type: "text/csv;charset=utf-8;",
    });
    saveAs(blobChests, "chests.csv");

    // Save participations CSV
    const blobParticipations = new Blob([participationCSV], {
      type: "text/csv;charset=utf-8;",
    });
    saveAs(blobParticipations, "participations.csv");
  };

  return (
    <main className="container mx-auto px-4 py-8 mt-20">
      <h1 className="text-4xl font-bold mb-10">Game Statistics</h1>

      {/* Grid pour les stats globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className=" rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Global Stats</h2>
          <div className="flex gap-4">
            <div className="p-2 rounded-lg">
              <div className="text-gray-600">Games</div>
              <div className="text-2xl font-bold">
                {finishedGames + ongoingGames}
              </div>
            </div>
            <div className=" p-2 rounded-lg">
              <div className="text-gray-600">Total Score</div>
              <div className="text-2xl font-bold">
                {totalScore.toLocaleString()}
              </div>
            </div>
            <div className="p-2 rounded-lg">
              <div className="text-gray-600">Number of Players</div>
              <div className="text-2xl font-bold">{topPlayers.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats par mode */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {Object.entries(statsByMode).map(([mode, stats]) => (
          <div key={mode} className="rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">{mode}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 mb-16">
                <div className="p-2">
                  <div className="text-gray-600">Games</div>
                  <div className="text-xl font-bold">{stats.totalGames}</div>
                </div>
                <div className="p-2">
                  <div className="text-gray-600">Score</div>
                  <div className="text-xl font-bold">
                    {stats.totalScore.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button onClick={exportDataToCSV}>Export to CSV</Button>

      {/* Grid pour les tops */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        {/* Level Leaders */}
        <div className="rounded-lg shadow p-6 w-full">
          <h2 className="text-xl font-semibold mb-4 ml-48">Level Leaders</h2>
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 2 }).map((_, colIndex) => (
              <div key={colIndex} className="space-y-3">
                {topPlayers
                  .filter(
                    (player) =>
                      player.name !== "Matthias" && player.name !== "Cosmos",
                  )
                  .slice(colIndex * 5, colIndex * 5 + 5) // 5 players per column
                  .map((player, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 rounded-lg transition-colors"
                    >
                      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-cyan-500 text-white rounded-full">
                        {colIndex * 5 + index + 1}
                      </div>
                      <div className="flex-grow">
                        <div className="font-medium">{player.name}</div>
                        <div className="text-sm text-gray-600">
                          Level {player.level.value} -{" "}
                          {player.points.toLocaleString()} XP
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};
