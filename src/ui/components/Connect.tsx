import { useAccount } from "@starknet-react/core";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import ConnectDialog from "./ConnectDialog";

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
      <span>
        <motion.div
          animate={{
            scale: [1, 1.2, 1, 1.2, 1, 1, 1.2, 1, 1.2, 1],
            backgroundColor: [
              "#FFFFFF",
              "#47D1D9",
              "#8BA3BC",
              "#1974D1",
              "#44A4D9",
              "#FFFFFF",
            ],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 1,
          }}
          onClick={() => {
            setIsOpen(true);
          }}
          className="cursor-pointer p-2 text-black bg-blue-500 rounded-lg font-bold"
        >
          Connect
        </motion.div>
      </span>
      <ConnectDialog isOpen={isOpen} onClose={handleClose} />
    </div>
  );
};

export default Connect;
