import { useDojo } from "@/dojo/useDojo";
import { useMemo } from "react";
import { useComponentValue } from "@dojoengine/react";
import { Entity } from "@dojoengine/recs";
import { getEntityIdFromKeys } from "@dojoengine/utils";

export const useAdmin = ({ adminId }: { adminId: number }) => {
  const {
    setup: {
      clientModels: {
        models: { Admin },
        classes: { Admin: AdminClass },
      },
    },
  } = useDojo();

  const key = useMemo(() => getEntityIdFromKeys([BigInt(adminId)]) as Entity, [adminId],);

  const component = useComponentValue(Admin, key);
  const admin = useMemo(() => {
    return component ? new AdminClass(component) : null;
  }, [component]);

  return { admins: key };
};