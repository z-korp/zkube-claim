import { useDojo } from "@/dojo/useDojo";
import { useMemo } from "react";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useComponentValue, useEntityQuery } from "@dojoengine/react";
import { Entity, Has } from "@dojoengine/recs";

export const useFreeMint = ({
  player_id,
}: {
  player_id: string | undefined;
}) => {
  const {
    setup: {
      clientModels: {
        models: { Mint },
        classes: { Mint: MintClass },
      },
    },
  } = useDojo();

  const key = useMemo(
    () => getEntityIdFromKeys([BigInt(player_id ? player_id : -1)]) as Entity,
    [player_id],
  );

  console.log("key", key);

  const component = useComponentValue(Mint, key);
  console.log("component", component);
  const mint = useMemo(() => {
    return component ? new MintClass(component) : null;
  }, [MintClass, component]);

  return mint;
};
