import React from "react";
import NftImage from "./ImageNFTZkube";
import { useNftBalance } from "@/hooks/useNftBalance";
import { useAccount } from "@starknet-react/core";

const HeaderNftBalance = React.memo(() => {
  const { account, address } = useAccount();

  const { balance } = useNftBalance(address ? address : "");

  if (account) {
    return (
      <span className="text-xs font-semibold md:font-normal flex items-center ">
        {`${balance}`} <NftImage />
      </span>
    );
  }
});

HeaderNftBalance.displayName = "HeaderNftBalance";

export default HeaderNftBalance;
