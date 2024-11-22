import { useAccount } from "@starknet-react/core";
import { KATANA_ETH_CONTRACT_ADDRESS } from "@dojoengine/core";
import Balance from "./Balance";
import DisconnectButton from "./DisconnectButton";
import { FaucetButton } from "./FaucetButton";
import { useMediaQuery } from "react-responsive";

const { VITE_PUBLIC_GAME_TOKEN_ADDRESS, VITE_PUBLIC_GAME_TOKEN_SYMBOL } =
  import.meta.env;

const shortAddress = (address: string, size = 4) => {
  return `${address.slice(0, size)}...${address.slice(-size)}`;
};

const AccountDetails = () => {
  const { status, address } = useAccount();
  const isMdOrLarger = useMediaQuery({ query: "(min-width: 768px)" });

  if (status === "connected" && address) {
    return (
      <div className="flex gap-3 items-center flex-col w-full">
        <div className="flex items-center gap-3 w-full">
          <div className="flex items-center gap-1 md:gap-2 rounded-lg bg-secondary text-secondary-foreground shadow-sm px-2 md:px-3 py-1 justify-between h-[36px] w-full">
            <p className="text-sm">
              {shortAddress(address, isMdOrLarger ? 5 : 6)}
            </p>
          </div>
          <DisconnectButton />
        </div>
        <div className="flex w-full gap-3">
          <div className="rounded-lg px-2 md:px-3 py-1 bg-secondary text-secondary-foreground shadow-sm h-[36px] w-full flex justify-center items-center">
            <Balance
              address={address}
              token_address={KATANA_ETH_CONTRACT_ADDRESS}
              symbol="ETH"
            />
          </div>
          <div className="rounded-lg px-2 md:px-3 py-1 bg-secondary text-secondary-foreground shadow-sm h-[36px] w-full flex justify-center items-center">
            <Balance
              address={address}
              token_address={VITE_PUBLIC_GAME_TOKEN_ADDRESS}
              symbol={VITE_PUBLIC_GAME_TOKEN_SYMBOL}
            />
          </div>
        </div>
        <FaucetButton />
      </div>
    );
  }
};

export default AccountDetails;
