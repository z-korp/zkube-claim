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
import { Mode, ModeType } from "@/dojo/game/types/mode";

export const SponsorTournament = ({
  tournament_id,
  mode,
}: {
  tournament_id: number;
  mode: ModeType;
}) => {
  const [lordsAmount, setLordsAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false); // Changed to false
  const { account, address } = useAccount();
  const {
    setup: {
      systemCalls: { sponsorTournament },
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

  const { player } = usePlayer({ playerId: address });

  const handleClick = useCallback(async () => {
    if (amountInWei <= 0n) return;

    console.log("tournament_id", tournament_id);

    setIsLoading(true);
    try {
      await sponsorTournament({
        account: account as Account,
        tournament_id,
        mode: new Mode(mode).into(),
        amount: amountInWei,
      });
      setOpen(false);
    } finally {
      setIsLoading(false);
    }
  }, [amountInWei, tournament_id, sponsorTournament, account, mode]);

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
          Sponsor Tournament
        </Button>
      </DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        className="sm:max-w-[700px] w-[95%] flex flex-col mx-auto justify-start rounded-lg px-4 gap-4"
      >
        <DialogHeader>
          <DialogTitle>Sponsor Tournament</DialogTitle>
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
