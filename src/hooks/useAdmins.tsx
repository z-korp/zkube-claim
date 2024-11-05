import { useDojo } from "@/dojo/useDojo";
import { useEffect, useState } from "react";
import { useEntityQuery } from "@dojoengine/react";
import { ComponentValue, getComponentValue, Has } from "@dojoengine/recs";
export const useAdmins = () => {
  const {
    setup: {
      clientModels: {
        models: { Admin },
        classes: { Admin: AdminClass },
      },
    },
  } = useDojo();

  type AdminInstance = InstanceType<typeof AdminClass>;
  const [admins, setAdmins] = useState<AdminInstance[]>([]);

  const adminKeys = useEntityQuery([Has(Admin)]);

  useEffect(() => {
    const components = adminKeys.map((entity) => {
      const component = getComponentValue(Admin, entity);
      if (!component) {
        return undefined;
      }
      return new AdminClass(component);
    });

    setAdmins(
      components.map(
        (component) => new AdminClass(component as ComponentValue),
      ),
    );
  }, [adminKeys]);

  return admins;
};
