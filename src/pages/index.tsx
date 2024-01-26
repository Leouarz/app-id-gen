import { MouseEventHandler, useState } from "react";
import { ApiPromise, initialize, signedExtensions, types } from "avail-js-sdk";
import { isNumber } from "@polkadot/util";
import { SignerOptions } from "@polkadot/api/types";
import Head from "next/head";

export default function Home() {
  const [foundExtensions, setFoundExtensions] = useState<{
    [extensionName: string]: { version: string; enable: Function };
  }>({});
  const [extensionsInitialized, setExtensionsInitialized] = useState<
    Record<string, boolean>
  >({});
  const [extension, setExtension] = useState<string | undefined>(undefined);
  const [accounts, setAccounts] = useState<string[] | undefined>(undefined);
  const [account, setAccount] = useState<string | undefined>(undefined);
  const [appName, setAppName] = useState("");
  const [availApi, setAvailApi] = useState<ApiPromise | undefined>();
  const [logs, setLogs] = useState<
    { message: string; severity: "info" | "error" }[]
  >([]);

  const [appToSearch, setAppToSearch] = useState("");
  const [searchRes, setSearchRes] = useState<string | undefined>();

  const findExtension = async () => {
    // Init Extension
    const { web3Enable } = await import("@polkadot/extension-dapp");
    await web3Enable("Example with extension");

    const web3Window = window as any;
    if (web3Window.injectedWeb3 as any) {
      setFoundExtensions(web3Window.injectedWeb3);
    }
  };

  const getInjectorMetadata = (api: ApiPromise) => {
    return {
      chain: api.runtimeChain.toString(),
      specVersion: api.runtimeVersion.specVersion.toNumber(),
      tokenDecimals: api.registry.chainDecimals[0] || 18,
      tokenSymbol: api.registry.chainTokens[0] || "AVL",
      genesisHash: api.genesisHash.toHex(),
      ss58Format: isNumber(api.registry.chainSS58) ? api.registry.chainSS58 : 0,
      chainType: "substrate" as "substrate",
      icon: "substrate",
      types: types as any,

      /** !! IMPORTANT !!
       * This is the important part, we tell the extension how to handle our signedExtension (even if it seems it's already there)
       **/
      userExtensions: signedExtensions,
    };
  };

  const setAccountAndExtension = async (extension: string) => {
    try {
      // Import extension utils
      const { web3Accounts, web3FromSource } = await import(
        "@polkadot/extension-dapp"
      );

      setExtension(extension);

      // Get correct extension account / injector
      const accounts = await web3Accounts();
      const filteredAccounts = accounts.filter(
        (x) => x.meta.source === extension
      );

      if (filteredAccounts.length === 0)
        throw new Error("No account found, please refresh the page");

      setAccounts(filteredAccounts.map((x) => x.address));
    } catch (err: any) {
      addLogs(err.message ? err.message : err, "error");
    }
  };

  const sendTx = async (appName: string) => {
    try {
      if (!extension) throw new Error("Extension not initialized");
      if (!account) throw new Error("Selected address not found");

      // Import extension utils
      const { web3Accounts, web3FromSource } = await import(
        "@polkadot/extension-dapp"
      );

      // Get correct extension account / injector
      const accounts = await web3Accounts();
      const filteredAccounts = accounts.filter(
        (x) => x.meta.source === extension
      );
      if (filteredAccounts.length === 0) throw new Error("No account found");
      const accountObject =
        filteredAccounts.find((x) => x.address === account) ||
        filteredAccounts[0];
      const injector = await web3FromSource(accountObject.meta.source);

      // Init API
      let api = availApi;
      if (!(api && api.isConnected)) {
        api = await initialize();
        setAvailApi(api);
      }

      // Inject our specific metadata once
      if (injector.metadata) {
        if (!extensionsInitialized[extension]) {
          const metadata = getInjectorMetadata(api);
          await injector.metadata.provide(metadata);
          // It would be wise to put this in a persistent storage to not ask everytime
          setExtensionsInitialized({
            ...extensionsInitialized,
            [injector.name]: true,
          });
        }
      }

      // Send the transaction
      const tx = api.tx.dataAvailability.createApplicationKey(appName);
      addLogs(
        `Sending tx with account ${accountObject.address} and wallet ${extension}. Create app id with name ${appName}`,
        "info"
      );
      const unsub = await tx.signAndSend(
        accountObject.address,
        { signer: injector.signer, app_id: 0 } as Partial<SignerOptions>,
        ({ status, isError, events }) => {
          if (isError) {
            addLogs(
              "An error has occured, open console (F12) to view logs",
              "error"
            );
            console.log(events);
          }
          if (status.isInBlock) {
            addLogs(
              `Transaction included in block: ${status.asInBlock}`,
              "info"
            );
            const failed = events.find((x) =>
              `${x.event.section}_${x.event.method}`.includes("Failed")
            );
            if (failed) {
              addLogs(
                `Transaction failed, please check your funds and chose a unique name, more details here: https://goldberg.avail.tools/#/explorer/query/${status.asInBlock}`,
                "error"
              );
            }

            const success = events.find((x) =>
              `${x.event.section}_${x.event.method}`.includes(
                "ApplicationKeyCreated"
              )
            );
            if (success) {
              addLogs(
                `Transaction success. Your info is ${JSON.stringify(
                  success.event.data.toHuman(),
                  undefined,
                  2
                )}`,
                "info"
              );
            }
            unsub();
          }
        }
      );
    } catch (err: any) {
      addLogs(err.message ? err.message : err, "error");
    }
  };

  const addLogs = (message: string, severity: "info" | "error") => {
    setLogs((prevLogs) => [...prevLogs, { message, severity }]);
  };

  const searchAppId = async (appToSearch: string) => {
    try {
      // Init API
      let api = availApi;
      if (!(api && api.isConnected)) {
        api = await initialize();
        setAvailApi(api);
      }

      const data = await api.query.dataAvailability.appKeys(appToSearch);
      if (data) {
        const res = data.toHuman() as any;
        if (res) {
          setSearchRes(`App found - AppId: ${res.id}, Owner: ${res.owner}`);
        } else {
          setSearchRes(`App not found, probably not existing`);
        }
      } else {
        setSearchRes(`App not found, probably not existing`);
      }
    } catch {
      setSearchRes(
        "An error has occured, please try again after refreshing the page"
      );
    }
  };

  const LogsDisplay = () => {
    return (
      <div
        style={{ marginTop: "24px", display: "flex", justifyContent: "center" }}
      >
        <table style={{ width: "80%" }}>
          <tbody>
            {logs.map((log, index) => (
              <tr key={index}>
                <td
                  style={{
                    border: "1px solid black",
                    padding: "8px",
                    color: log.severity === "error" ? "red" : "white",
                  }}
                >
                  {log.message}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const Button = ({
    onClick,
    label,
    disabled,
  }: {
    label: string;
    onClick: MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
  }) => {
    return (
      <button
        style={{
          marginTop: "12px",
          border: "1px solid white",
          padding: "6px",
          borderRadius: "8px",
          width: "280px",
          backgroundColor: disabled ? "grey" : undefined,
        }}
        disabled={disabled}
        onClick={onClick}
      >
        {label}
      </button>
    );
  };

  return (
    <>
      <Head>
        <title>Avail App id generator</title>
        <meta
          name="description"
          content="A simple app to create an app id in avail goldberg network"
        />
      </Head>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <h1 style={{ fontSize: "32px" }}>Create an App Id</h1>

        {Object.keys(foundExtensions).length === 0 && (
          <Button onClick={() => findExtension()} label={"Detect extensions"} />
        )}

        {(!accounts || accounts.length === 0) &&
          Object.keys(foundExtensions).map((extension, i) => {
            return (
              <Button
                key={i}
                onClick={() => setAccountAndExtension(extension)}
                label={`Chose account from ${extension}`}
              />
            );
          })}

        {!account &&
          accounts &&
          accounts.length > 0 &&
          accounts.map((x, i) => {
            return (
              <Button
                key={i}
                onClick={() => setAccount(x)}
                label={`${x.substring(0, 10)}...${x.substring(
                  x.length - 10,
                  x.length
                )}`}
              />
            );
          })}

        {account && (
          <>
            <h2 style={{ fontSize: "24px" }}>Chose your unique app name</h2>
            <input
              type="text"
              required
              minLength={1}
              maxLength={20}
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              style={{
                backgroundColor: "black",
                border: "1px solid",
                borderRadius: "4px",
                marginTop: "16px",
                marginBottom: "12px",
                width: "280px",
              }}
            />
            <Button
              onClick={() => sendTx(appName)}
              label={"Send tx and create app id"}
              disabled={appName.length < 1 || appName.length > 20}
            />
            <p style={{ fontSize: "12px" }}>Between 1 and 20 characters</p>
          </>
        )}
        {logs.length > 0 && <LogsDisplay />}

        <hr
          style={{ width: "100%", marginTop: "24px", marginBottom: "24px" }}
        />

        <h1 style={{ fontSize: "32px" }}>Find an App Id</h1>
        <h2 style={{ fontSize: "20px" }}>Type a name to get the app id</h2>
        <input
          type="text"
          required
          minLength={1}
          maxLength={20}
          value={appToSearch}
          onChange={(e) => setAppToSearch(e.target.value)}
          style={{
            backgroundColor: "black",
            border: "1px solid",
            borderRadius: "4px",
            marginTop: "16px",
            marginBottom: "12px",
            width: "280px",
          }}
        />
        <Button
          onClick={() => searchAppId(appToSearch)}
          label={"Search App Id"}
          disabled={appToSearch.length < 1}
        />
        {searchRes && (
          <p style={{ marginTop: "24px", fontSize: "24px" }}>{searchRes}</p>
        )}
      </div>
    </>
  );
}
