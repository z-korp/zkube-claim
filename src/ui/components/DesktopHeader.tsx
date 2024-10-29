import { useAccount, useDisconnect } from "@starknet-react/core";
import Connect from "./Connect";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../elements/button";

const DesktopHeader = () => {
  const { address, status } = useAccount();
  console.log("address", address);
  console.log("status", status);
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
            <p>{address}</p>
            <Button onClick={() => disconnect()}>Disconnect</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesktopHeader;
