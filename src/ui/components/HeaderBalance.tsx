import React from "react";
import Balance from "./Balance";
import { useAccount } from "@starknet-react/core";

const { VITE_PUBLIC_GAME_TOKEN_ADDRESS, VITE_PUBLIC_GAME_TOKEN_SYMBOL } =
  import.meta.env;

const HeaderBalance = React.memo(() => {
  const { account, address } = useAccount();

  if (account) {
    return (
      <div className="rounded-lg items-center flex gap-1 bg-secondary text-secondary-foreground shadow-sm md:gap-2 px-2 md:px-3 py-1 h-[36px]">
        {address && (
          <Balance
            address={address}
            token_address={VITE_PUBLIC_GAME_TOKEN_ADDRESS}
            symbol={VITE_PUBLIC_GAME_TOKEN_SYMBOL}
          />
        )}
      </div>
    );
  }
});

HeaderBalance.displayName = "HeaderBalance";

export default HeaderBalance;
