import { useCallback, useState, useEffect } from "react";
import { Check, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../elements/card";
import { Button } from "../elements/button";
import { Input } from "../elements/input";
import { useFreeMint } from "@/hooks/useFreeMint";
import { useDojo } from "@/dojo/useDojo";
import { Account } from "starknet";
import { useNftBalance } from "@/hooks/useNftBalance";
import {
  useAccount,
  useContract,
  useSendTransaction,
} from "@starknet-react/core";
import { erc721ABI } from "@/utils/erc721";
import { toast } from "sonner";
import { shortenHex } from "@dojoengine/utils";
import HeaderNftBalance from "../components/HeaderNftBalance";
import { BackgroundGradient } from "../components/BackgroundGradient";
import { useMediaQuery } from "react-responsive";
import { showToast } from "@/utils/toast";
import { getSyncEntities } from "@dojoengine/state";
import * as torii from "@dojoengine/torii-client";

const { VITE_PUBLIC_GAME_CREDITS_TOKEN_ADDRESS, VITE_PUBLIC_DEPLOY_TYPE } =
  import.meta.env;

const TX_TRANSFER_ID = "transfer";

export const Airdrop = () => {
  const {
    setup: {
      systemCalls: { claimFreeMint },
      toriiClient,
      contractComponents,
    },
  } = useDojo();
  const { account, status, address } = useAccount();
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

  useEffect(() => {
    const clause: torii.MemberClause = {
      model: "zkube-Mint",
      member: "id",
      operator: "Eq",
      value: {
        Primitive: {
          Felt252: address,
        },
      },
    };

    const syncEntities = async () => {
      await getSyncEntities(
        toriiClient,
        contractComponents as any,
        { Member: clause },
        [],
        100,
        false,
      );
    };

    syncEntities();
  }, [address]);

  const isMdOrLarger = useMediaQuery({ query: "(min-width: 768px)" });
  const isSmallHeight = useMediaQuery({ query: "(max-height: 768px)" });

  const getToastPlacement = () => {
    if (!isMdOrLarger) {
      return isSmallHeight ? "top-center" : "bottom-right";
    }
    return "bottom-right";
  };

  const getUrl = (transaction_hash: string) => {
    if (
      VITE_PUBLIC_DEPLOY_TYPE === "sepolia" ||
      VITE_PUBLIC_DEPLOY_TYPE === "sepoliadev1" ||
      VITE_PUBLIC_DEPLOY_TYPE === "sepoliadev2"
    ) {
      return `https://sepolia.starkscan.co/tx/${transaction_hash}`;
    } else {
      return `https://worlds.dev/networks/slot/worlds/zkube-${VITE_PUBLIC_DEPLOY_TYPE}/txs/${transaction_hash}`;
    }
  };

  const getToastAction = (transaction_hash: string) => {
    return {
      label: "View",
      onClick: () => window.open(getUrl(transaction_hash), "_blank"),
    };
  };

  const { send, isPending } = useSendTransaction({
    onSuccess: async (transaction) => {
      const toastId = TX_TRANSFER_ID;

      if (isMdOrLarger) {
        toast.loading("Transaction in progress...", {
          description: shortenHex(transaction.transaction_hash),
          action: getToastAction(transaction.transaction_hash),
          id: toastId,
          position: getToastPlacement(),
        });

        try {
          const tx = await account?.waitForTransaction(
            transaction.transaction_hash,
            {
              retryInterval: 100,
            },
          );

          if (tx?.isSuccess) {
            toast.success("Transfer successful!", {
              id: toastId,
              description: shortenHex(transaction.transaction_hash),
              action: getToastAction(transaction.transaction_hash),
              position: getToastPlacement(),
            });
          } else {
            toast.error("Error", {
              id: toastId,
              position: getToastPlacement(),
            });
          }
        } catch (error) {
          toast.error("Transaction failed", {
            id: toastId,
            position: getToastPlacement(),
          });
        }
      }
    },
    onError: (error) => {
      if (isMdOrLarger) {
        toast.error(`Transfer failed: ${error.message}`, {
          id: `error-${Date.now()}`,
          position: getToastPlacement(),
        });
      }
    },
  });

  const freeGames = useFreeMint({
    player_id: address,
  });
  const { balance } = useNftBalance(address ?? "");

  useEffect(() => {
    if (balance !== undefined && balance !== 0n) {
      setTransferAmount(balance.toString());
    }
  }, [balance]);

  const handleClaim = useCallback(async () => {
    try {
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
    } catch (error) {
      console.error("Error claiming:", error);
    }
  }, [account, claimFreeMint, freeGames?.number]);

  const handleTransfer = useCallback(async () => {
    if (!account || !erc721Contract) return;

    try {
      showToast({
        message: "Claiming airdrop...",
        toastId: TX_TRANSFER_ID,
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

      await send(calls);
    } catch (error) {
      console.error("Transfer error:", error);
      if (isMdOrLarger) {
        toast.error("Failed to prepare transfers", {
          id: `error-${Date.now()}`,
          position: getToastPlacement(),
        });
      }
    }
  }, [
    account,
    controllerAddress,
    erc721Contract,
    transferAmount,
    send,
    isMdOrLarger,
  ]);

  // Rest of the component remains the same...
  return (
    <div className="flex flex-col gap-4 w-[90%] max-w-2xl mx-auto z-20">
      <Card className="bg-gray-900">
        <BackgroundGradient className="bg-slate-900">
          <CardHeader>
            <CardTitle
              className={`${isMdOrLarger ? "text-4xl" : "text-2xl"} text-white mb-4`}
            >
              Airdrop Claim
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === "connected" ? (
              <div className="rounded-lg bg-gray-800 p-4 space-y-8">
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
                      <Wallet className="mr-4 h-6 w-6" />
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
            ) : (
              <div className="rounded-lg bg-gray-800 p-4 space-y-2">
                Please connect your wallet
              </div>
            )}
          </CardContent>
        </BackgroundGradient>
      </Card>

      {balance !== 0n && balance !== undefined && (
        <Card className="bg-gray-900">
          <BackgroundGradient className="bg-slate-900">
            <CardHeader>
              <CardTitle
                className={`${isMdOrLarger ? "text-4xl" : "text-xl"} text-white flex justify-between items-center`}
              >
                <div>Transfer to Controller</div>
                <HeaderNftBalance />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </BackgroundGradient>
        </Card>
      )}
    </div>
  );
};

export default Airdrop;
