import { useAccount } from "@starknet-react/core";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import ConnectDialog from "./ConnectDialog";
import { BackgroundGradient } from "./BackgroundGradient";

const Connect = () => {
  const { address, status } = useAccount();

  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (status === "connected" && address) {
      setIsOpen(false);
    }
  }, [status, address]);

  if (status === "connected" && address) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <BackgroundGradient className="bg-slate-900">
        <button
          className="p-2"
          onClick={() => {
            setIsOpen(true);
          }}
        >
          Connect
        </button>
        <ConnectDialog isOpen={isOpen} onClose={handleClose} />
      </BackgroundGradient>
    </div>
  );
};

export default Connect;
