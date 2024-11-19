import { useAccount, useDisconnect } from "@starknet-react/core";
import Connect from "./Connect";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../elements/button";
import SettingsDropDown from "./SettingsDropDown";
import { shortenAddress } from "@/utils/address";
import { BackgroundGradient } from "./BackgroundGradient";

const DesktopHeader = () => {
  const { address, status, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    navigate("", { replace: true });
  }, [navigate]);

  return (
    <div className="flex justify-center items-center p-4 flex-wrap md:justify-between bg-slate-900 border-2">
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
            <BackgroundGradient className="bg-slate-900">
              <button className="p-2" onClick={() => disconnect()}>
                Disconnect
              </button>
            </BackgroundGradient>
          </div>
        )}

        <SettingsDropDown />
      </div>
    </div>
  );
};

export default DesktopHeader;
