import { useDojo } from "@/dojo/useDojo";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/ui/elements/button";
import { Account } from "starknet";
import { useAccount } from "@starknet-react/core";

export const AddAdmin = ({ address }: { address: string }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { account } = useAccount();
  const {
    master,
    setup: {
      systemCalls: { setAdmin },
    },
  } = useDojo();

  const handleClick = useCallback(async () => {
    setIsLoading(true);
    try {
      await setAdmin({ account: account as Account, address });
    } finally {
      setIsLoading(false);
    }
  }, [account, address, setAdmin]);

  const disabled = useMemo(() => {
    return !account || !master || account === master;
  }, [account, master]);

  if (disabled) return null;

  return (
    <Button
      isLoading={isLoading}
      disabled={isLoading}
      onClick={handleClick}
      className="text-xl"
    >
      Add Admin
    </Button>
  );
};
