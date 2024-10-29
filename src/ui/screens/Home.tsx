import { useDojo } from "@/dojo/useDojo";
import useViewport from "@/hooks/useViewport";
import { useQuerySync } from "@dojoengine/react";
import { Schema } from "@dojoengine/recs";

export const HomePage = () => {
  const {
    setup: { toriiClient, contractComponents },
  } = useDojo();

  useViewport();

  useQuerySync<Schema>(toriiClient, Object.values(contractComponents), []);

  return <div>Main</div>;
};
