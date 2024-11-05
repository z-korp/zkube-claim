import { Connector } from "@starknet-react/core";
import CartridgeConnector from "@cartridge/connector";
import { getContractByName } from "@dojoengine/core";
import { ControllerOptions, PaymasterOptions } from "@cartridge/controller";
import { shortString } from "starknet";
import { manifest } from "./config/manifest";

const { VITE_PUBLIC_GAME_TOKEN_ADDRESS, VITE_PUBLIC_NODE_URL } = import.meta
  .env;

export type Manifest = typeof manifest;

const account_contract_address = getContractByName(
  manifest,
  "zkube",
  "account",
)?.address;

const play_contract_address = getContractByName(
  manifest,
  "zkube",
  "play",
)?.address;

const chest_contract_address = getContractByName(
  manifest,
  "zkube",
  "chest",
)?.address;

const tournament_contract_address = getContractByName(
  manifest,
  "zkube",
  "tournament",
)?.address;

const settings_contract_address = getContractByName(
  manifest,
  "zkube",
  "settings",
)?.address;

console.log("account_contract_address", account_contract_address);
console.log("play_contract_address", play_contract_address);
console.log("chest_contract_address", chest_contract_address);
console.log("tournament_contract_address", tournament_contract_address);
console.log("settings_contract_address", settings_contract_address);

const policies = [
  {
    target: VITE_PUBLIC_GAME_TOKEN_ADDRESS,
    method: "approve",
  },
  {
    target: VITE_PUBLIC_GAME_TOKEN_ADDRESS,
    method: "faucet",
  },
  // account
  {
    target: account_contract_address,
    method: "create",
  },
  {
    target: account_contract_address,
    method: "rename",
  },
  // play
  {
    target: play_contract_address,
    method: "create",
  },
  {
    target: play_contract_address,
    method: "surrender",
  },
  {
    target: play_contract_address,
    method: "move",
  },
  {
    target: play_contract_address,
    method: "apply_bonus",
  },
  // chest
  {
    target: chest_contract_address,
    method: "claim",
  },
  // tournament
  {
    target: tournament_contract_address,
    method: "claim",
  },
];

const paymaster: PaymasterOptions = {
  caller: shortString.encodeShortString("ANY_CALLER"),
};

const options: ControllerOptions = {
  rpc: VITE_PUBLIC_NODE_URL,
  policies,
  paymaster,
};

const cartridgeConnector = new CartridgeConnector(
  options,
) as never as Connector;

export default cartridgeConnector;
