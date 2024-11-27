import { useEffect, useState } from "react";
import { Input } from "../elements/input";
import { Button } from "@/ui/elements/button";
import { Card, CardContent, CardHeader, CardTitle } from "../elements/card";
import { Table, TableBody, TableCell, TableRow } from "../elements/table";
import { useAdmins } from "@/hooks/useAdmins";
import { AddAdmin } from "../actions/AddAdmin";
import { FreeMintManager } from "../components/FreeMintManager";
import { useSettings } from "@/hooks/useSettings";
import { shortenAddress } from "@/utils/address";
import { useDojo } from "@/dojo/useDojo";
import { useAccount } from "@starknet-react/core";
import { Account } from "starknet";
import { getSyncEntities } from "@dojoengine/state";
import * as torii from "@dojoengine/torii-client";

export const AdminPage = () => {
  const {
    setup: {
      toriiClient,
      contractComponents,
      systemCalls: { updateZkorpAddress, updateErc721Address },
    },
  } = useDojo();

  useEffect(() => {
    const clause: torii.KeysClause = {
      keys: [undefined],
      pattern_matching: "FixedLen",
      models: [
        "zkube-Player",
        "zkube-Game",
        "zkube-Tournament",
        "zkube-Settings",
        "zkube-Admin",
      ],
    };

    const syncEntities = async () => {
      await getSyncEntities(
        toriiClient,
        contractComponents as any,
        { Keys: clause },
        [],
        30_000,
        false,
      );
    };

    syncEntities();
  }, []);

  const { account } = useAccount();
  const [zkorpAddress, setZkorpAddress] = useState("");
  const [erc721Address, setErc721Address] = useState("");
  const [gamePrice, setGamePrice] = useState<bigint>(0n);
  const [adminAddress, setAdminAddress] = useState("");
  const admins = useAdmins();
  const { settings } = useSettings();
  const [isLoading, setIsLoading] = useState({
    zkorp: false,
    erc721: false,
    gamePrice: false,
  });

  const handleUpdateZkorpAddress = async () => {
    if (!zkorpAddress || !account) return;

    setIsLoading((prev) => ({ ...prev, zkorp: true }));
    try {
      await updateZkorpAddress({
        account: account as Account,
        address: zkorpAddress,
      });
      setZkorpAddress(""); // Clear input after successful update
    } catch (error) {
      console.error("Failed to update zkorp address:", error);
      // You might want to add a toast notification here
    } finally {
      setIsLoading((prev) => ({ ...prev, zkorp: false }));
    }
  };

  const handleUpdateErc721Address = async () => {
    if (!erc721Address) return;

    setIsLoading((prev) => ({ ...prev, erc721: true }));
    try {
      await updateErc721Address({
        account: account as Account,
        address: erc721Address,
      });
      setErc721Address(""); // Clear input after successful update
    } catch (error) {
      console.error("Failed to update ERC721 address:", error);
      // You might want to add a toast notification here
    } finally {
      setIsLoading((prev) => ({ ...prev, erc721: false }));
    }
  };

  const handleUpdateGamePrice = () => {
    // Call the function to update the daily mode price
  };

  return (
    <div className="container flex flex-col gap-4 w-full max-w-6xl mx-auto overflow-y-auto h-[calc(100%-5rem)] mt-20">
      <Card className="bg-gray-900">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white text-center">
            zKube Admin
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 overflow-y-auto">
          <div className="rounded-lg bg-gray-800 p-4 space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <div>
                  {settings?.zkorp_address.toString()
                    ? shortenAddress(settings?.zkorp_address.toString())
                    : "not defined"}
                </div>
                <Button
                  onClick={() => navigator.clipboard.writeText(zkorpAddress)}
                  className="hover:bg-blue-500 mr-2"
                >
                  <img
                    src="/assets/svgs/copy.svg"
                    alt="Copy"
                    className="w-6 h-6"
                  />
                </Button>
                <Input
                  type="text"
                  value={zkorpAddress}
                  onChange={(e) => setZkorpAddress(e.target.value)}
                  placeholder="zkorp address"
                  className="bg-gray-800/50 border-gray-700 flex-grow"
                />

                <Button
                  onClick={handleUpdateZkorpAddress}
                  className="hover:bg-blue-500 w-[180px]"
                >
                  Update zkorp address
                </Button>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div>
                  {settings?.zkorp_address.toString()
                    ? shortenAddress(settings?.erc721_address.toString())
                    : "not defined"}
                </div>
                <Button
                  onClick={() => navigator.clipboard.writeText(zkorpAddress)}
                  className="ml-2 hover:bg-blue-500"
                >
                  <img
                    src="/assets/svgs/copy.svg"
                    alt="Copy"
                    className="w-6 h-6"
                  />
                </Button>
                <Input
                  type="text"
                  value={erc721Address}
                  onChange={(e) => setErc721Address(e.target.value)}
                  placeholder="ERC721 address"
                  className="bg-gray-800/50 border-gray-700 flex-grow ml-2"
                />
                <Button
                  onClick={handleUpdateErc721Address}
                  className="hover:bg-blue-500 w-[180px]"
                >
                  Update zkorp address
                </Button>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div>{settings?.game_price.toString() || "not defined"}</div>
                <Button
                  onClick={() =>
                    navigator.clipboard.writeText(gamePrice.toString())
                  }
                  className="hover:bg-blue-500"
                >
                  <img
                    src="/assets/svgs/copy.svg"
                    alt="Copy"
                    className="w-4 h-4"
                  />
                </Button>
                <Input
                  type="text"
                  value={gamePrice.toString()}
                  onChange={(e) => setGamePrice(BigInt(e.target.value))}
                  placeholder="Daily mode price"
                  className="bg-gray-800/50 border-gray-700 ml-2"
                />
                <Button
                  onClick={handleUpdateGamePrice}
                  className="hover:bg-blue-500 w-[180px]"
                >
                  Update game price
                </Button>
              </div>
            </div>

            <div>
              <h1>Admins</h1>
              <div className="flex items-center">
                <Table>
                  <TableBody>
                    {admins.map((admin, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium text-xs">
                          {shortenAddress(admin.address)}
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() =>
                              navigator.clipboard.writeText(admin.address)
                            }
                            className="ml-2 hover:bg-blue-500"
                          >
                            <img
                              src="/assets/svgs/copy.svg"
                              alt="Copy"
                              className="w-4 h-4"
                            />
                          </Button>
                        </TableCell>
                        <TableCell className="w-fit">
                          <Button
                            onClick={() =>
                              navigator.clipboard.writeText(admin.address)
                            }
                            className="ml-2 hover:bg-red-500"
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell>
                        <Input
                          type="text"
                          value={adminAddress}
                          onChange={(e) => setAdminAddress(e.target.value)}
                          placeholder="New admin address"
                          className="bg-gray-800/50 border-gray-700"
                        />
                      </TableCell>
                      <TableCell />
                      <TableCell>
                        <AddAdmin address={adminAddress} />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <FreeMintManager />
    </div>
  );
};
