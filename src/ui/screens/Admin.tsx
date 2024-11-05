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
  const [csvContent, setCsvContent] = useState<Array<Array<string>>>([]);
  const [headers, setHeaders] = useState<string[]>([]);

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const rows = text.split("\n").map((row) => row.split(","));
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
        console.log(processedRows);
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
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
