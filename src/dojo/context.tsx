import { BurnerAccount, useBurnerManager } from "@dojoengine/create-burner";
import { ReactNode, createContext, useContext, useMemo } from "react";
import { Account, RpcProvider } from "starknet";
import { SetupResult } from "./setup";
import { clear, count } from "console";
import { create } from "domain";
import { get } from "http";
import { remove } from "mobx";

interface DojoContextType extends SetupResult {
  account: BurnerAccount;
  master: Account;
}

export const DojoContext = createContext<DojoContextType | null>(null);

export const DojoProvider = ({
  children,
  value,
}: {
  children: ReactNode;
  value: SetupResult;
}) => {
  const currentValue = useContext(DojoContext);
  if (currentValue) throw new Error("DojoProvider can only be used once");

  const {
    config: { rpcUrl, masterAddress, masterPrivateKey },
    burnerManager,
  } = value;

  const rpcProvider = useMemo(
    () =>
      new RpcProvider({
        nodeUrl: rpcUrl,
      }),
    [rpcUrl],
  );

  const masterAccount = useMemo(
    () => new Account(rpcProvider, masterAddress, masterPrivateKey),
    [rpcProvider, masterAddress, masterPrivateKey],
  );

  const burnerManagerData = useBurnerManager({ burnerManager });

  return (
    <DojoContext.Provider
      value={{
        ...value,
        account: {
          ...burnerManagerData,
          account: burnerManagerData.account || masterAccount,
        },
        master: masterAccount,
      }}
    >
      {children}
    </DojoContext.Provider>
  );
};
