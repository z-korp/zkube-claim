import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { setup, SetupResult } from "./dojo/setup.ts";
import { DojoProvider } from "./dojo/context.tsx";
import { dojoConfig } from "../dojo.config.ts";
import { Loading } from "@/ui/screens/Loading";
import { MusicPlayerProvider } from "./contexts/music.tsx";
import { SoundPlayerProvider } from "./contexts/sound.tsx";
import { ThemeProvider } from "./ui/elements/theme-provider/index.tsx";
import {
  StarknetConfig,
  argent,
  braavos,
  jsonRpcProvider,
  starkscan,
} from "@starknet-react/core";
import { mainnet, sepolia } from "@starknet-react/chains";

import "./index.css";

const { VITE_PUBLIC_DEPLOY_TYPE } = import.meta.env;

function rpc() {
  return {
    nodeUrl: import.meta.env.VITE_PUBLIC_NODE_URL,
  };
}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

export function Main() {
  const connectors = [argent(), braavos()];

  const [setupResult, setSetupResult] = useState<SetupResult | null>(null);
  const [ready, setReady] = useState(false);
  const [enter, setEnter] = useState(false);

  const loading = useMemo(
    () => !enter || !setupResult || !ready,
    [enter, setupResult, ready],
  );

  useEffect(() => {
    if (!enter) return;
    setTimeout(() => setReady(true), 2000);
  }, [enter]);

  useEffect(() => {
    async function initialize() {
      const result = await setup(dojoConfig());
      setSetupResult(result);
    }
    initialize();
  }, [enter]);

  return (
    <React.StrictMode>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <StarknetConfig
          autoConnect
          chains={[VITE_PUBLIC_DEPLOY_TYPE === "mainnet" ? mainnet : sepolia]}
          connectors={connectors}
          explorer={starkscan}
          provider={jsonRpcProvider({ rpc })}
        >
          <MusicPlayerProvider>
            {!loading && setupResult ? (
              <DojoProvider value={setupResult}>
                <SoundPlayerProvider>
                  <App />
                </SoundPlayerProvider>
              </DojoProvider>
            ) : (
              <Loading enter={enter} setEnter={setEnter} />
            )}
          </MusicPlayerProvider>
        </StarknetConfig>
      </ThemeProvider>
    </React.StrictMode>
  );
}

root.render(<Main />);
