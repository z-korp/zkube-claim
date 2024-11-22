import { Connector, useConnect } from "@starknet-react/core";
import { Dialog, DialogContent, DialogTitle } from "../elements/dialog";
import { Button } from "../elements/button";
import { BackgroundGradient } from "./BackgroundGradient";
import { motion } from "framer-motion";

interface ConnectDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConnectDialog: React.FC<ConnectDialogProps> = ({ isOpen, onClose }) => {
  const { connectors, connect } = useConnect();

  const handleConnect = (connector: Connector) => {
    connect({ connector });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex flex-col mx-auto justify-start border-none bg-none py-10 px-16">
        <DialogTitle className="text-4xl text-center mb-2">
          Connect your Wallet
        </DialogTitle>
        <div className="flex flex-col gap-2">
          {connectors.map((connector: Connector) => {
            return (
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant={"outline"}
                  key={connector.id}
                  onClick={async () => handleConnect(connector)}
                  disabled={!connector.available()}
                  className="flex flex-row items-center justify-start gap-4 px-3 w-full"
                >
                  {typeof connector.icon === "string" ? (
                    <img src={connector.icon} className="w-10 h-10 p-2" />
                  ) : (
                    <img src={connector.icon.dark} className="w-10 h-10 p-2" />
                  )}
                  <p className="">{connector.name}</p>
                </Button>
              </motion.div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectDialog;
