import { useAccount, useDisconnect } from "@starknet-react/core";
import Connect from "./Connect";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../elements/button";
import SettingsDropDown from "./SettingsDropDown";
import { shortenAddress } from "@/utils/address";
import HeaderNftBalance from "./HeaderNftBalance";

const DesktopHeader = () => {
  const { address, status, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    navigate("", { replace: true });
  }, [navigate]);

  return (
    <div className="flex justify-center items-center p-4 flex-wrap md:justify-between">
      <div
        className="cursor-pointer flex gap-8 items-center justify-end w-full"
        onClick={handleClick}
      >
        {status !== "connected" ? (
          <Connect />
        ) : (
          <div className="flex gap-4 items-center">
            <HeaderNftBalance />
            <div className="flex gap-2 items-center">
              <p>{shortenAddress(address || "")}</p>
              <span className="text-sm text-gray-400">
                ({connector?.id || "unknown"})
              </span>
            </div>
            <Button onClick={() => disconnect()}>Disconnect</Button>
          </div>
        )}

        <SettingsDropDown />
      </div>
    </div>
  );
};

export default DesktopHeader;
