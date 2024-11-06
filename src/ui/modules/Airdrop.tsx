import React, { useCallback, useState } from "react";
import { AlertCircle, Check, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../elements/card";
import { Button } from "../elements/button";
import { Input } from "../elements/input";
import { useFreeMint } from "@/hooks/useFreeMint";
import { useDojo } from "@/dojo/useDojo";
import { Account } from "starknet";
import { useAccount } from "@starknet-react/core";

const Airdrop = () => {
  const {
    setup: {
      systemCalls: { claimFreeMint },
    },
  } = useDojo();

  const { account } = useAccount();
  const freeGames = useFreeMint({ player_id: account?.address });
  const [controllerAddress, setControllerAddress] = useState("");
  // const [claimStatus, setClaimStatus] = useState({
  //   claimed: false,
  //   amountClaimed: "0",
  //   transferredToController: false,
  // });
  const [isLoading, setIsLoading] = useState(false);

  const handleClaim = useCallback(async () => {
    console.log("Starting claim process...");
    setIsLoading(true);
    try {
      console.log("account", account);
      if (account) {
        console.log("Account found, attempting to claim free mint...");
        await claimFreeMint({ account: account as Account });
        console.log("Successfully claimed free mint");
      } else {
        console.log("No account found");
      }
    } catch (error) {
      console.error("Error claiming:", error);
    } finally {
      console.log("Claim process completed");
      setIsLoading(false);
    }
  }, [account]);
  console.log("account", account);
  if (!freeGames) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-gray-900">
        <CardContent className="text-center p-6">
          <AlertCircle className="mx-auto mb-4 text-gray-400" size={32} />
          <p className="text-gray-300">
            You are not eligible for the ZKube airdrop.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
      <Card className="bg-gray-900">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">
            ZKube Airdrop Claim
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-gray-800 p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Claimable Amount</span>
              <span className="text-white font-bold">
                {freeGames?.number} Games
              </span>
            </div>
            <div className="space-y-1">
              {/* <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300">
                  Claimed Games: {mockUserData.claimedGames} /{" "}
                  {mockUserData.totalGames}
                </span>
              </div> */}
            </div>
            {/* <div className="space-y-1">
              <span className="text-sm text-gray-400">Eligible for:</span>
              {mockUserData.collections.map((collection, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check size={16} className="text-green-500" />
                  <span className="text-sm text-gray-300">
                    {collection.name}: {collection.amount} points
                  </span>
                </div>
              ))}
            </div> */}
          </div>
          <div className="mb-2">
            <Input
              placeholder="Enter controller address"
              value={controllerAddress}
              onChange={(e) => setControllerAddress(e.target.value)}
              className="bg-gray-800/50 border-gray-700"
            />
          </div>
          <Button
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={handleClaim}
            disabled={isLoading || !controllerAddress}
          >
            Transfer to Controller
          </Button>
          {/* SUCCESS
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-500">
              <Check size={20} />
              <span>
                Successfully claimed {claimStatus.amountClaimed} ZKUBE
              </span>
            </div>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
};

export default Airdrop;
