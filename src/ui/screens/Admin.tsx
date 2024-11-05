import { useState } from "react";
import { Input } from "../elements/input";
import { Button } from "@/ui/elements/button";
import { Card, CardContent, CardHeader, CardTitle } from "../elements/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../elements/table";
import { useAdmins } from "@/hooks/useAdmins";
import { AddAdmin } from "../actions/AddAdmin";

export const AdminPage = () => {
  const [zkorpAddress, setZkorpAddress] = useState("");
  const [dailyModePrice, setDailyModePrice] = useState(0);
  const [normalModePrice, setNormalModePrice] = useState(0);
  const [adminAddress, setAdminAddress] = useState("");

  const admins = useAdmins();

  const handleUpdateZkorpAddress = () => {
    // Call the function to update the zkorp address
  };

  const handleUpdateDailyModePrice = () => {
    // Call the function to update the daily mode price
  };

  const handleUpdateNormalModePrice = () => {
    // Call the function to update the normal mode price
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto overflow-y-auto h-full">
      <Card className="bg-gray-900">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white text-center">
            ZKube Airdrop Admin
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 overflow-y-auto">
          <div className="rounded-lg bg-gray-800 p-4 space-y-10">
            <div>
              <div className="flex items-center">
                <Input
                  type="text"
                  value={zkorpAddress}
                  onChange={(e) => setZkorpAddress(e.target.value)}
                  placeholder="Zkorp address"
                  className="bg-gray-800/50 border-gray-700 flex-grow"
                />
                <Button
                  onClick={() => navigator.clipboard.writeText(zkorpAddress)}
                  className="ml-2 hover:bg-blue-500"
                >
                  <img
                    src="/assets/svgs/copy.svg"
                    alt="Copy"
                    className="w-4 h-4"
                  />
                </Button>
              </div>
              <div className="mt-4">
                <Button
                  onClick={handleUpdateZkorpAddress}
                  className="hover:bg-blue-500"
                >
                  Update zkorp address
                </Button>
              </div>
            </div>
            <div>
              <div className="flex items-center">
                <Input
                  type="text"
                  value={dailyModePrice}
                  onChange={(e) => setDailyModePrice(Number(e.target.value))}
                  placeholder="Daily mode price"
                  className="bg-gray-800/50 border-gray-700"
                />
                <Button
                  onClick={() =>
                    navigator.clipboard.writeText(dailyModePrice.toString())
                  }
                  className="ml-2 hover:bg-blue-500"
                >
                  <img
                    src="/assets/svgs/copy.svg"
                    alt="Copy"
                    className="w-4 h-4"
                  />
                </Button>
              </div>
              <div className="mt-4">
                <Button
                  onClick={handleUpdateDailyModePrice}
                  className="hover:bg-blue-500"
                >
                  Update daily mode price
                </Button>
              </div>
            </div>
            <div>
              <div className="flex items-center">
                <Input
                  type="text"
                  value={normalModePrice}
                  onChange={(e) => setNormalModePrice(Number(e.target.value))}
                  placeholder="Normal mode price"
                  className="bg-gray-800/50 border-gray-700"
                />
                <Button
                  onClick={() =>
                    navigator.clipboard.writeText(normalModePrice.toString())
                  }
                  className="ml-2 hover:bg-blue-500"
                >
                  <img
                    src="/assets/svgs/copy.svg"
                    alt="Copy"
                    className="w-4 h-4"
                  />
                </Button>
              </div>
              <div className="mt-4 mb-10">
                <Button
                  onClick={handleUpdateNormalModePrice}
                  className="hover:bg-blue-500"
                >
                  Update normal mode price
                </Button>
              </div>
              <div>
                <div className="flex items-center">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Copy</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {admins.map((admin, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium text-xs">
                            {admin.address}
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
                          <TableCell>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
