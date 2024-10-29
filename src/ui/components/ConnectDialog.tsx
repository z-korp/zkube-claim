import { Connector, useConnect } from "@starknet-react/core";
import { Dialog, DialogContent, DialogTitle } from "../elements/dialog";
import { Button } from "../elements/button";

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
      <DialogContent className="flex flex-col mx-auto justify-start rounded-lg px-4">
        <DialogTitle className="text-4xl text-center mb-2">
          Connect your Wallet
        </DialogTitle>
        <div className="flex flex-col gap-2">
          {connectors.map((connector: Connector) => {
            return (
              <Button
                key={connector.id}
                onClick={async () => handleConnect(connector)}
                disabled={!connector.available()}
                className="flex flex-row items-center justify-start gap-4"
              >
                {connector.icon.light && (
                  <img src={connector.icon.dark} className="w-10 h-10 p-2" />
                )}
                <p className="">Connect {connector.name}</p>
              </Button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectDialog;
