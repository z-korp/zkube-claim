import { useDojo } from "@/dojo/useDojo";
import { useEffect, useState } from "react";
import { useEntityQuery } from "@dojoengine/react";
import { getComponentValue, Has } from "@dojoengine/recs";

export const useFreeMints = () => {
  const {
    setup: {
      clientModels: {
        models: { Mint },
        classes: { Mint: MintClass },
      },
    },
  } = useDojo();

  type MintInstance = InstanceType<typeof MintClass>;
  const [mints, setMints] = useState<MintInstance[]>([]);

  const mintKeys = useEntityQuery([Has(Mint)]);

  useEffect(() => {
    const components = mintKeys
      .map((entity) => {
        const component = getComponentValue(Mint, entity);
        if (!component) {
          return undefined;
        }
        return new MintClass(component);
      })
      .filter((component) => component !== undefined);

    setMints(components);
  }, [mintKeys]);

  return mints;
};
