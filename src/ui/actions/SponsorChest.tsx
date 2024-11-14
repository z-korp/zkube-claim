import { useDojo } from "@/dojo/useDojo";
import { useCallback, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from "@/ui/elements/dialog";
import { Button } from "@/ui/elements/button";
import { Input } from "@/ui/elements/input";
import { usePlayer } from "@/hooks/usePlayer";
import { Account } from "starknet";
import { useAccount } from "@starknet-react/core";

export const SponsorChest = ({ chest_id }: { chest_id: number }) => {
  const [lordsAmount, setLordsAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false); // Changed to false
  const { account } = useAccount();
  const {
    setup: {
      systemCalls: { sponsorChest },
    },
  } = useDojo();

  const amountInWei = useMemo(() => {
    if (!lordsAmount || isNaN(Number(lordsAmount))) return 0n;
    try {
      return BigInt(Math.floor(Number(lordsAmount) * 10 ** 18));
    } catch {
      return 0n;
    }
  }, [lordsAmount]);

  const { player } = usePlayer({ playerId: account?.address });

  const handleClick = useCallback(async () => {
    if (amountInWei <= 0n) return;

    console.log("chest_id", chest_id);

    setIsLoading(true);
    try {
      await sponsorChest({
        account: account as Account,
        chest_id,
        amount: amountInWei,
      });
      setOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, [account, amountInWei, chest_id, sponsorChest]);

  const disabled = useMemo(() => {
    return !account || !!player;
  }, [account, player]);

  const isValidAmount = useMemo(() => {
    const num = Number(lordsAmount);
    return !isNaN(num) && num > 0;
  }, [lordsAmount]);

  if (disabled) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button isLoading={isLoading} disabled={isLoading} className="text-xl">
          Sponsor Chest
        </Button>
      </DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        className="sm:max-w-[700px] w-[95%] flex flex-col mx-auto justify-start rounded-lg px-4 gap-4"
      >
        <DialogHeader>
          <DialogTitle>Sponsor Chest</DialogTitle>
          <DialogDescription>
            Enter the amount of LORDS to sponsor this chest
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Input
            className="w-full"
            placeholder="Amount in LORDS"
            type="number"
            min="0"
            step="0.000000000000000001"
            value={lordsAmount}
            onChange={(e) => setLordsAmount(e.target.value)}
          />
          <p className="text-sm text-gray-500">
            Amount in wei: {amountInWei.toString()}
          </p>
        </div>

        <DialogClose asChild>
          <Button
            disabled={!isValidAmount || isLoading}
            isLoading={isLoading}
            onClick={handleClick}
          >
            Sponsor Chest
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};
