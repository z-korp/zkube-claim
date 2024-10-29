import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "../elements/drawer";
import { useAccount, useDisconnect } from "@starknet-react/core";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../elements/button";
import Connect from "./Connect";

const MobileHeader = () => {
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
    <div className="px-3 py-2 flex gap-3">
      <Drawer direction="left">
        <DrawerTrigger>
          <FontAwesomeIcon icon={faBars} size="xl" />
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-2xl">zKube</DrawerTitle>
          </DrawerHeader>
          <div className="flex flex-col gap-5 p-4">
            <div className="flex flex-col gap-2">
              {status === "connected" && (
                <>
                  <div className="flex gap-2 items-center">
                    <p>{shortenAddress(address || "")}</p>
                    <span className="text-sm text-gray-400">
                      ({connector?.id || "unknown"})
                    </span>
                  </div>
                  <Button onClick={() => disconnect()}>Disconnect</Button>
                </>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
      <div className="w-full flex justify-between items-center">
        <p className="text-2xl font-bold cursor-pointer" onClick={handleClick}>
          zKube
        </p>
        <div className="flex gap-2">
          {status !== "connected" && <Connect />}
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;
