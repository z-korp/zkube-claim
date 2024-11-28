import React, { useState } from "react";
import { Input } from "../elements/input";
import { Button } from "../elements/button";
import { Card, CardHeader, CardTitle, CardContent } from "../elements/card";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Table,
} from "../elements/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../elements/tabs";
import { useDojo } from "@/dojo/useDojo";
import { useAccount } from "@starknet-react/core";
import { Account } from "starknet";

interface FailedAddress {
  address: string;
  amount: number;
  timestamp: number;
}

export const FreeMintManager = () => {
  const {
    setup: {
      systemCalls: { addFreeMintBatch, addFreeMint },
    },
  } = useDojo();

  const [csvContent, setCsvContent] = useState<Array<Array<string>>>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { account } = useAccount();

  // Manual input state
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [timestamp, setTimestamp] = useState("");

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
    if (isNaN(timestampNum)) return "Invalid date";
    return new Date(timestampNum * 1000).toLocaleString();
  };

  const timestampIndex = headers.indexOf("tenDaysFromNow");
  const visibleHeaders = headers.filter(
    (header) => header !== "tenDaysFromNow",
  );

  const createCsvFailContent = (failedAddresses: FailedAddress[]) => {
    const headers = ["address", "amount", "timestamp", "error_timestamp"];
    const rows = failedAddresses.map((item) => [
      item.address,
      item.amount,
      item.timestamp,
      new Date().toISOString(),
    ]);

    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  };

  const saveCsvToFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleAddFreeMintBatch = async () => {
    if (csvContent.length === 0) {
      console.log("No addresses loaded from CSV");
      return;
    }

    setIsLoading(true);
    const BATCH_SIZE = 500; // Batch size
    const failedAddresses = []; // Store failed addresses
    const successAddresses = []; // Store successful addresses

    console.log("Processing addresses from CSV:", csvContent.length);
    try {
      // Prepare all addresses
      const allAddresses = csvContent.map((row, index) => {
        console.log("Processing row:", index, row);
        const addressIndex = headers.indexOf("address");
        const timestampIndex = headers.indexOf("expiration_timestamp");
        const quantityIndex = headers.indexOf("quantity");

        if (
          addressIndex === -1 ||
          timestampIndex === -1 ||
          quantityIndex === -1
        ) {
          console.error("Missing required columns in CSV:", {
            hasAddress: addressIndex !== -1,
            hasTimestamp: timestampIndex !== -1,
            hasQuantity: quantityIndex !== -1,
          });
          throw new Error("CSV missing required columns");
        }

        const quantity = parseInt(row[quantityIndex]);
        const timestamp = parseInt(row[timestampIndex]);

        if (isNaN(quantity) || isNaN(timestamp)) {
          console.error("Invalid data in row:", index, {
            address: row[addressIndex],
            quantity: row[quantityIndex],
            timestamp: row[timestampIndex],
          });
          throw new Error("Invalid quantity or timestamp");
        }

        return {
          address: row[addressIndex],
          timestamp: timestamp,
          amount: quantity,
        };
      });

      // Process in batches
      for (let i = 0; i < allAddresses.length; i += BATCH_SIZE) {
        const batch = allAddresses.slice(i, i + BATCH_SIZE);
        console.log(
          `Processing batch ${i / BATCH_SIZE + 1}, addresses ${i + 1} to ${i + batch.length}`,
        );

        if (!account) break;

        try {
          await addFreeMintBatch({
            account: account as Account,
            freeMints: batch.map(({ address, timestamp, amount }) => ({
              to: address,
              amount: amount,
              expiration_timestamp: timestamp,
            })),
          });

          // Store successful addresses with timestamp
          successAddresses.push(
            ...batch.map((address) => ({
              ...address,
            })),
          );

          console.log(`Successfully processed batch ${i / BATCH_SIZE + 1}`);
        } catch (error) {
          console.error(`Error processing batch ${i / BATCH_SIZE + 1}:`, error);
          // Store failed addresses with error timestamp
          failedAddresses.push(
            ...batch.map((address) => ({
              ...address,
            })),
          );
        }

        // Optional delay between batches to avoid overload
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Final summary
      console.log("Processing completed:");
      console.log(
        `- Successfully processed: ${successAddresses.length} addresses`,
      );
      console.log(`- Failed addresses: ${failedAddresses.length}`);

      // Create and download CSV for failed addresses if any
      if (failedAddresses.length > 0) {
        const csvContent = createCsvFailContent(failedAddresses);
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        saveCsvToFile(csvContent, `failed_addresses_${timestamp}.csv`);
      }

      // Create and download CSV for successful addresses
      if (successAddresses.length > 0) {
        const csvContent = createCsvFailContent(successAddresses);
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        saveCsvToFile(csvContent, `successful_addresses_${timestamp}.csv`);
      }

      // Return results for further processing if needed
      return {
        success: successAddresses,
        failed: failedAddresses,
        totalProcessed: successAddresses.length + failedAddresses.length,
      };
    } catch (error) {
      console.error("Fatal error in handleAddFreeMintBatch:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Modified handleAddFreeMint function
  const handleAddFreeMint = async (params: {
    address: string;
    amount: number;
    timestamp: number;
  }) => {
    if (!account) return;

    setIsLoading(true);
    try {
      await addFreeMint({
        account: account as Account,
        to: params.address,
        amount: params.amount,
        expiration_timestamp: params.timestamp,
      });
      console.log("Successfully added free mints for:", params);
    } catch (error) {
      console.error("Error adding free mints:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update CSV button click handler
  const handleCsvFreeMint = async () => {
    if (csvContent.length === 0) return;

    const addressIndex = headers.indexOf("address");
    const numberIndex = headers.indexOf("number");
    const timestampIndex = headers.indexOf("tenDaysFromNow");

    const params = {
      address: csvContent[0][addressIndex],
      amount: numberIndex !== -1 ? parseInt(csvContent[0][numberIndex]) : 10,
      timestamp: parseInt(csvContent[0][timestampIndex]),
    };

    await handleAddFreeMint(params);
  };

  // Update manual submit handler
  const handleManualSubmit = async () => {
    const params = {
      address,
      amount: parseInt(amount) || 0,
      timestamp:
        parseInt(timestamp) ||
        Math.floor(Date.now() / 1000) + 10 * 24 * 60 * 60,
    };

    console.log("Manual submit params:", params);

    await handleAddFreeMint(params);
  };

  return (
    <Card className="bg-gray-900 h-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white text-center">
          Free Mint Manager
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="csv" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-gray-800">
            <TabsTrigger
              value="csv"
              className="data-[state=active]:bg-gray-700"
            >
              CSV Upload
            </TabsTrigger>
            <TabsTrigger
              value="manual"
              className="data-[state=active]:bg-gray-700"
            >
              Manual Input
            </TabsTrigger>
          </TabsList>

          <TabsContent value="csv" className="space-y-4">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="bg-gray-800/50 border-gray-700"
            />

            {csvContent.length > 0 && (
              <>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      handleCsvFreeMint();
                    }}
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? "Processing..." : "Simple"}
                  </Button>
                  <Button
                    onClick={() => {
                      handleAddFreeMintBatch();
                    }}
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? "Processing..." : "Batch"}
                  </Button>
                </div>

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
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="bg-gray-800 p-4 rounded-lg space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Address
                </label>
                <Input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter address"
                  className="bg-gray-800/50 border-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Amount
                </label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="bg-gray-800/50 border-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Expiration (Unix Timestamp)
                </label>
                <Input
                  type="number"
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  placeholder="Enter timestamp"
                  className="bg-gray-800/50 border-gray-700"
                />
              </div>

              <Button
                onClick={handleManualSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Add Free Mint
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
