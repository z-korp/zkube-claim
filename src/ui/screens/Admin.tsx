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
import { useDojo } from "@/dojo/useDojo";
import useAccountCustom from "@/hooks/useAccountCustom";

export const AdminPage = () => {
  const {
    setup: {
      systemCalls: { addFreeMintBatch, addFreeMint },
    },
  } = useDojo();
  const [zkorpAddress, setZkorpAddress] = useState("");
  const [erc721Address, setErc721Address] = useState("");
  const [gamePrice, setGamePrice] = useState<bigint>(0n);
  const [adminAddress, setAdminAddress] = useState("");
  const [csvContent, setCsvContent] = useState<Array<Array<string>>>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { account } = useAccountCustom();
  const admins = useAdmins();

  const handleAddFreeMintBatch = async () => {
    if (csvContent.length === 0) {
      console.log("No addresses loaded from CSV");
      return;
    }

    setIsLoading(true);
    try {
      const addresses = csvContent.slice(0, 3).map((row) => {
        const addressIndex = headers.indexOf("address");
        const timestampIndex = headers.indexOf("tenDaysFromNow");
        const numberIndex = headers.indexOf("number");

        // Get the number from CSV or default to 10 if not found
        const amount = numberIndex !== -1 ? parseInt(row[numberIndex]) : 10;

        return {
          address: row[addressIndex],
          timestamp: parseInt(row[timestampIndex]),
          amount: amount,
        };
      });

      console.log("Processing free mints for addresses:", addresses);

      if (!account) return;

      try {
        await addFreeMintBatch({
          account: account,
          freeMints: addresses.map(({ address, timestamp, amount }) => ({
            to: address,
            amount: amount, // Use the amount from CSV
            expiration_timestamp: timestamp,
          })),
        });

        console.log("Successfully added free mints for:", addresses);
      } catch (error) {
        console.error(
          "Error adding free mints for addresses:",
          addresses,
          ":",
          error,
        );
      }
    } catch (error) {
      console.error("Error in handleAddFreeMint:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFreeMint = async () => {
    if (csvContent.length === 0) {
      console.log("No addresses loaded from CSV");
      return;
    }

    setIsLoading(true);
    try {
      const addresses = csvContent.map((row) => {
        const addressIndex = headers.indexOf("address");
        const numberIndex = headers.indexOf("number");
        const timestampIndex = headers.indexOf("tenDaysFromNow");

        // Get the number from CSV or default to 10 if not found
        const amount = numberIndex !== -1 ? parseInt(row[numberIndex]) : 10;

        return {
          address: row[addressIndex],
          timestamp: parseInt(row[timestampIndex]),
          amount: amount,
        };
      });

      if (!account) return;

      try {
        await addFreeMint({
          to: addresses[0].address,
          amount: addresses[0].amount, // Use the amount from CSV
          expiration_timestamp: addresses[0].timestamp,
          account: account,
        });
        console.log("Successfully added free mints for:", addresses[0]);
      } catch (error) {
        console.error(
          "Error adding free mints for address:",
          addresses[0],
          ":",
          error,
        );
      }
    } catch (error) {
      console.error("Error in handleAddFreeMint:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateZkorpAddress = () => {
    // Call the function to update the zkorp address
  };

  const handleUpdateGamePrice = () => {
    // Call the function to update the daily mode price
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const rows = text
          .split("\n")
          .map((row) =>
            row.split(",").map((cell) => cell.trim().replace(/\r$/, "")),
          );
        const headers = rows[0];
        headers.push("tenDaysFromNow");

        // Log column names
        console.log("CSV Column Names:", headers);

        // Add timestamp 10 days from now to each row
        const tenDaysFromNow =
          Math.floor(Date.now() / 1000) + 10 * 24 * 60 * 60;
        const processedRows = rows
          .slice(1)
          .map((row) => [...row, tenDaysFromNow.toString()]);
        setCsvContent(processedRows);
        setHeaders(headers);
      };
      reader.readAsText(file);
    }
  };

  const formatAddress = (address: string) => {
    if (address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (timestamp: string) => {
    const timestampNum = parseInt(timestamp);
    if (isNaN(timestampNum)) {
      return "Invalid date";
    }
    const date = new Date(timestampNum * 1000);
    return date.toLocaleString();
  };

  // Get the index of tenDaysFromNow column
  const timestampIndex = headers.indexOf("tenDaysFromNow");

  // Filter visible headers (excluding tenDaysFromNow)
  const visibleHeaders = headers.filter(
    (header) => header !== "tenDaysFromNow",
  );

  return (
    <div className="flex gap-4 w-full max-w-6xl mx-auto overflow-y-auto h-full">
      <div className="flex-1">
        <Card className="bg-gray-900">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white text-center">
              zKube Admin
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
                    placeholder="zkorp address"
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
                    value={erc721Address}
                    onChange={(e) => setErc721Address(e.target.value)}
                    placeholder="ERC721 address"
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
                    value={gamePrice.toString()}
                    onChange={(e) => setGamePrice(BigInt(e.target.value))}
                    placeholder="Daily mode price"
                    className="bg-gray-800/50 border-gray-700"
                  />
                  <Button
                    onClick={() =>
                      navigator.clipboard.writeText(gamePrice.toString())
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
                    onClick={handleUpdateGamePrice}
                    className="hover:bg-blue-500"
                  >
                    Update game price
                  </Button>
                </div>
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
                            {formatAddress(admin.address)}
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
          </CardContent>
        </Card>
      </div>

      <div className="w-[40rem]">
        <Card className="bg-gray-900 h-full">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white text-center">
              CSV Loader
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="bg-gray-800/50 border-gray-700"
              />
              {headers.length > 0 && (
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-white font-semibold mb-2">
                    Detected Columns:
                  </h3>
                  <ul className="list-disc list-inside">
                    {visibleHeaders.map((header, index) => (
                      <li key={index} className="text-gray-300">
                        {header}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {csvContent.length > 0 && (
                <>
                  <Button
                    onClick={handleAddFreeMint}
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 mb-4"
                  >
                    {isLoading ? "Processing..." : "Simple"}
                  </Button>
                  <Button
                    onClick={handleAddFreeMintBatch}
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 mb-4"
                  >
                    {isLoading ? "Processing..." : "Batch"}
                  </Button>
                  <div className="bg-gray-800 p-4 rounded-lg overflow-auto max-h-96">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {visibleHeaders.map((header, index) => (
                            <TableHead key={index}>{header}</TableHead>
                          ))}
                          <TableHead>Formatted Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {csvContent.slice(0, 5).map((row, rowIndex) => (
                          <TableRow key={rowIndex}>
                            {row.map((cell, cellIndex) => {
                              // Skip rendering the tenDaysFromNow cell
                              if (cellIndex === timestampIndex) return null;
                              return (
                                <TableCell key={cellIndex}>
                                  {headers[cellIndex] === "address"
                                    ? formatAddress(cell)
                                    : cell}
                                </TableCell>
                              );
                            })}
                            <TableCell>
                              {formatTimestamp(row[timestampIndex])}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {csvContent.length > 5 && (
                      <div className="text-gray-400 text-center mt-4">
                        Showing first 5 rows of {csvContent.length} total rows
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
