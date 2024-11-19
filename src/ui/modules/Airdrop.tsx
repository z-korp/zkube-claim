import React, { useCallback, useState, useEffect } from "react";
import { AlertCircle, Check, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../elements/card";
import { Button } from "../elements/button";
import { Input } from "../elements/input";
import useAccountCustom from "@/hooks/useAccountCustom";
import { useFreeMint } from "@/hooks/useFreeMint";
import { useDojo } from "@/dojo/useDojo";
import { Account } from "starknet";
import { useNftBalance } from "@/hooks/useNftBalance";
import { useContract, useSendTransaction } from "@starknet-react/core";
import { erc721ABI } from "@/utils/erc721";
import { showToast } from "@/utils/toast";
import HeaderNftBalance from "../components/HeaderNftBalance";
import { BackgroundGradient } from "../components/BackgroundGradient";
import { useAccount } from "@starknet-react/core";
import { Opacity } from "@tsparticles/engine";

const { VITE_PUBLIC_GAME_CREDITS_TOKEN_ADDRESS } = import.meta.env;

export const Airdrop = () => {
  const {
    setup: {
      systemCalls: { claimFreeMint },
    },
  } = useDojo();
  const { account } = useAccountCustom();
  const [claimStatus, setClaimStatus] = useState({
    claimed: false,
    amountClaimed: "0",
    showSuccess: false,
  });
  const [controllerAddress, setControllerAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState("");

  const { contract: erc721Contract } = useContract({
    abi: erc721ABI,
    address: VITE_PUBLIC_GAME_CREDITS_TOKEN_ADDRESS,
  });

  const { send, isPending, isError, error } = useSendTransaction({});

  const freeGames = useFreeMint({ player_id: account?.address });
  const { balance } = useNftBalance(account?.address ?? "");

  useEffect(() => {
    if (balance !== undefined && balance !== 0n) {
      setTransferAmount(balance.toString());
    }
  }, [balance]);

  const handleClaim = useCallback(async () => {
    try {
      showToast({
        message: "Claiming airdrop...",
        toastId: "airdrop-claim",
      });

      await claimFreeMint({
        account: account as Account,
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setClaimStatus((prev) => ({
        ...prev,
        claimed: true,
        showSuccess: true,
        amountClaimed: freeGames?.number.toString() ?? "0",
      }));

      showToast({
        message: `Successfully claimed ${freeGames?.number ?? 0} ZKUBE`,
        type: "success",
        toastId: "airdrop-claim",
      });
    } catch (error) {
      console.error("Error claiming:", error);
      showToast({
        message: "Failed to claim airdrop",
        type: "error",
        toastId: "airdrop-claim",
      });
    }
  }, [account, claimFreeMint, freeGames?.number]);

  const handleTransfer = useCallback(async () => {
    if (!account || !erc721Contract) return;

    try {
      showToast({
        message: "Preparing transfers...",
        toastId: "transfer-process",
      });

      const tokenIds = await Promise.all(
        Array.from({ length: parseInt(transferAmount) }, async (_, index) => {
          const ret_erc721 = await erc721Contract.call(
            "token_of_owner_by_index",
            [account.address, index],
          );
          return BigInt(ret_erc721.toString());
        }),
      );

      const calls = tokenIds.map((token_id) =>
        erc721Contract.populate("transfer_from", [
          account.address,
          controllerAddress,
          token_id,
        ]),
      );

      send(calls);

      showToast({
        message: `Transferring ${transferAmount} NFTs to controller`,
        toastId: "transfer-process",
      });
    } catch (error) {
      console.error("Transfer error:", error);
      showToast({
        message: "Failed to prepare transfers",
        type: "error",
        toastId: "transfer-process",
      });
    }
  }, [account, controllerAddress, erc721Contract, transferAmount, send]);

  return (
    <div className="flex flex-col gap-4 w-[90%] max-w-2xl mx-auto z-20">
      <Card className="bg-gray-900">
        <BackgroundGradient className="bg-slate-900">
          <CardHeader>
            <CardTitle className="text-4xl text-white mb-4">
              Airdrop Claim
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-gray-800 p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Claimable Amount</span>
                <span className="text-white font-bold">
                  {freeGames?.number ?? 0} Games
                </span>
              </div>

              {!claimStatus.claimed || !claimStatus.showSuccess ? (
                <BackgroundGradient className="bg-slate-900 p-2">
                  <Button
                    className={`w-full text-xl text-neon animate-neon `}
                    onClick={handleClaim}
                    variant={"secondary"}
                    disabled={claimStatus.claimed}
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    {claimStatus.claimed ? "Claimed" : "Claim Airdrop"}
                  </Button>
                </BackgroundGradient>
              ) : (
                <div className="flex items-center gap-2 text-green-500">
                  <Check size={20} />
                  <span>
                    Successfully claimed {claimStatus.amountClaimed} ZKUBE
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </BackgroundGradient>
      </Card>

      <Card className="bg-gray-900">
        <BackgroundGradient className="bg-slate-900">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white flex justify-between items-center">
              <div>Transfer to Controller</div>
              <HeaderNftBalance />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {balance !== 0n && balance !== undefined && (
              <div className="rounded-lg bg-gray-800 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Enter controller address"
                    value={controllerAddress}
                    onChange={(e) => setControllerAddress(e.target.value)}
                    className="bg-gray-800/50 border-gray-700 flex-grow"
                  />
                  <Input
                    type="number"
                    placeholder={`Amount`}
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    min="1"
                    max={balance.toString()}
                    className="bg-gray-800/50 border-gray-700 w-32"
                  />
                </div>
                <Button
                  className="w-full mt-2"
                  onClick={handleTransfer}
                  disabled={
                    isPending ||
                    !controllerAddress ||
                    !transferAmount ||
                    parseInt(transferAmount) <= 0
                  }
                  isLoading={isPending}
                >
                  Transfer to Controller
                </Button>
              </div>
            )}
          </CardContent>
        </BackgroundGradient>
      </Card>
    </div>
  );
};

export default Airdrop;
