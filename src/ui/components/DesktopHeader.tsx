import { useAccount, useDisconnect } from "@starknet-react/core";
import Connect from "./Connect";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../elements/button";
import SettingsDropDown from "./SettingsDropDown";

const DesktopHeader = () => {
  const { address, status, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    navigate("", { replace: true });
  }, [navigate]);

  const shortenAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

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
