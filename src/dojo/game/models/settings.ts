import { ComponentValue } from "@dojoengine/recs";

export class Settings {
  zkorp_address: string;
  erc721_address: string;
  game_price: bigint;
  are_games_paused: boolean;
  are_chests_unlock: boolean;

  constructor(settings: ComponentValue) {
    this.zkorp_address = "0x" + settings.zkorp_address.toString(16);
    this.erc721_address = "0x" + settings.erc721_address.toString(16);
    this.game_price = settings.game_price;
    this.are_games_paused = settings.are_games_paused;
    this.are_chests_unlock = settings.are_chests_unlock;
  }
}
