import { ContractComponents } from "./contractModels";
import { Game } from "./game/models/game";
import { Chest } from "./game/models/chest";
import { Admin } from "./game/models/admin";
import { Player } from "./game/models/player";
import { Settings } from "./game/models/settings";
import { Tournament } from "./game/models/tournament";
import { Participation } from "./game/models/participation";

export type ClientModels = ReturnType<typeof models>;

export function models({
  contractComponents,
}: {
  contractComponents: ContractComponents;
}) {
  return {
    models: {
      ...contractComponents,
    },
    classes: {
      Game,
      Chest,
      Player,
      Settings,
      Tournament,
      Participation,
      Admin,
    },
  };
}
