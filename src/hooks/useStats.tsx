import { useDojo } from "@/dojo/useDojo";
import { useEffect, useState } from "react";
import { useEntityQuery } from "@dojoengine/react";
import { Has, getComponentValue } from "@dojoengine/recs";
import { Player } from "@/dojo/game/models/player";
import { Game } from "@/dojo/game/models/game";
import { Level } from "@/dojo/game/types/level";
import { ModeType } from "@/dojo/game/types/mode";
import { Chest } from "@/dojo/game/models/chest";
import { Participation } from "@/dojo/game/models/participation";

const useStats = () => {
  // Players state
  const [players, setPlayers] = useState<Player[]>([]);
  // Games state
  const [games, setGames] = useState<Game[]>([]);
  // Chests state
  const [chests, setChests] = useState<Chest[]>([]);
  // Participations state
  const [participations, setParticipations] = useState<Participation[]>([]);

  const {
    setup: {
      clientModels: {
        models: {
          Player: PlayerComponent,
          Game: GameComponent,
          Chest: ChestComponent,
          Participation: ParticipationComponent,
        },
        classes: {
          Player: PlayerClass,
          Game: GameClass,
          Chest: ChestClass,
          Participation: ParticipationClass,
        },
      },
    },
  } = useDojo();

  const playerKeys = useEntityQuery([Has(PlayerComponent)]);
  const gameKeys = useEntityQuery([Has(GameComponent)]);
  const chestKeys = useEntityQuery([Has(ChestComponent)]);
  const participationKeys = useEntityQuery([Has(ParticipationComponent)]);

  // Effect for players
  useEffect(() => {
    const components = playerKeys
      .map((entity) => {
        const component = getComponentValue(PlayerComponent, entity);
        if (!component) return undefined;
        return new PlayerClass(component);
      })
      .filter((player): player is Player => player !== undefined)
      .sort((a, b) => {
        const levelA = Level.fromPoints(a.points);
        const levelB = Level.fromPoints(b.points);
        if (levelB.value !== levelA.value) {
          return levelB.value - levelA.value;
        }
        return b.points - a.points;
      });

    setPlayers(components);
  }, [playerKeys]);

  // Effect for games
  useEffect(() => {
    const components = gameKeys
      .map((entity) => {
        const component = getComponentValue(GameComponent, entity);
        if (!component) return undefined;
        return new GameClass(component);
      })
      .filter((game): game is Game => game !== undefined)
      .sort((a, b) => b.combo - a.combo); // Sort by combo descending

    setGames(components);
  }, [gameKeys]);

  // Effect for chests
  useEffect(() => {
    const components = chestKeys
      .map((entity) => {
        const component = getComponentValue(ChestComponent, entity);
        if (!component) return undefined;
        return new ChestClass(component);
      })
      .filter((chest): chest is Chest => chest !== undefined);

    setChests(components);
  }, [chestKeys]);

  // Effect for participations
  useEffect(() => {
    const components = participationKeys
      .map((entity) => {
        const component = getComponentValue(ParticipationComponent, entity);
        if (!component) return undefined;
        return new ParticipationClass(component);
      })
      .filter(
        (participation): participation is Participation =>
          participation !== undefined,
      );

    setParticipations(components);
  }, [participationKeys]);

  // Map chest ID to total points contributed
  const chestTotalPoints = new Map<string, bigint>();

  chests.forEach((chest) => {
    const chestParticipations = participations.filter(
      (p) => p.chest_id === chest.id,
    );

    const totalPoints = chestParticipations.reduce(
      (sum, p) => sum + BigInt(p.points),
      BigInt(0),
    );

    chestTotalPoints.set(chest.id.toString(), totalPoints);
  });

  // Calculate proportional prize for each participation
  const participationsWithPrize = participations.map((participation) => {
    const chestIdStr = participation.chest_id.toString();
    const chest = chests.find((chest) => chest.id === participation.chest_id);
    if (!chest) {
      // Handle error or set default values
      return {
        ...participation,
        proportionalPrize: BigInt(0),
        percentage: 0,
      };
    }

    const totalPoints = chestTotalPoints.get(chestIdStr) || BigInt(0);

    const playerPoints = BigInt(participation.points);
    const chestPrize = chest.prize;

    // Calculate proportional prize as bigint
    const proportionalPrize =
      totalPoints !== BigInt(0)
        ? (chestPrize * playerPoints) / totalPoints
        : BigInt(0);

    // Calculate percentage contribution
    const percentage =
      totalPoints !== BigInt(0)
        ? Number((playerPoints * BigInt(10000)) / totalPoints) / 100
        : 0;

    return {
      ...participation,
      proportionalPrize,
      percentage, // Include percentage if needed
    };
  });

  // Calculate stats
  const totalScore = games.reduce((sum, game) => sum + game.score, 0);
  const maxCombo =
    games.length > 0 ? Math.max(...games.map((game) => game.combo)) : 0;

  const finishedGames = games.filter((game) => game.isOver()).length;
  const ongoingGames = games.filter((game) => !game.isOver()).length;

  // Group stats by mode
  const statsByMode = Object.values(ModeType).reduce(
    (acc, mode) => {
      if (mode === ModeType.None) return acc;

      const modeGames = games.filter((game) => game.mode.value === mode);
      acc[mode] = {
        totalGames: modeGames.length,
        finishedGames: modeGames.filter((game) => game.isOver()).length,
        ongoingGames: modeGames.filter((game) => !game.isOver()).length,
        totalScore: modeGames.reduce((sum, game) => sum + game.score, 0),
        maxCombo:
          modeGames.length > 0
            ? Math.max(...modeGames.map((game) => game.combo))
            : 0,
        bestGames: modeGames
          .filter((game) => game.isOver())
          .sort((a, b) => b.combo - a.combo)
          .slice(0, 5),
      };
      return acc;
    },
    {} as Record<ModeType, any>,
  );

  // Calculate chest contributions per player
  const playerChestStats = new Map<
    string,
    { totalContribution: bigint; totalPrizeShare: bigint }
  >();

  chests.forEach((chest) => {
    const chestParticipations = participations.filter(
      (p) => p.chest_id === chest.id,
    );

    const totalPoints = chestParticipations.reduce(
      (sum, p) => sum + BigInt(p.points),
      BigInt(0),
    );

    chestParticipations.forEach((p) => {
      const playerIdStr = p.player_id.toString();
      const userContribution = BigInt(p.points);

      // Calculate user prize share as bigint
      const userPrizeShare =
        totalPoints !== BigInt(0)
          ? (chest.prize * userContribution) / totalPoints
          : BigInt(0);

      if (!playerChestStats.has(playerIdStr)) {
        playerChestStats.set(playerIdStr, {
          totalContribution: BigInt(0),
          totalPrizeShare: BigInt(0),
        });
      }
      const stats = playerChestStats.get(playerIdStr)!;
      stats.totalContribution += userContribution;
      stats.totalPrizeShare += userPrizeShare;
    });
  });

  return {
    // Players stats
    topPlayers: players.map((player) => {
      const playerIdStr = player.id.toString();
      const chestStats = playerChestStats.get(playerIdStr) || {
        totalContribution: BigInt(0),
        totalPrizeShare: BigInt(0),
      };
      return {
        ...player,
        level: Level.fromPoints(player.points),
        nextLevelXP: Level.fromPoints(player.points).getPointsToNextLevel(),
        accountCreationDay: player.account_creation_day,
        chestContribution: chestStats.totalContribution,
        chestPrizeShare: chestStats.totalPrizeShare,
      };
    }),
    // Games stats
    totalScore,
    maxCombo,
    topGames: games,
    finishedGames,
    ongoingGames,
    statsByMode,
    chests,
    participations: participationsWithPrize,
  };
};

export default useStats;
