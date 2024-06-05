import { useEffect, useState } from "react";

function History() {
  const [history, setHistory] = useState([]);
  const [wallet, setWallet] = useState([]);
  const ipcRenderer = window.ipcRenderer;
  useEffect(() => {
    ipcRenderer.send("get-wallet", {});
    ipcRenderer.on("get-wallet", (event, data) => {
      setWallet(data.response);
    });
    ipcRenderer.send("get-history", {});
    ipcRenderer.on("get-history", (event, data) => {
      setHistory(data.response);
    });
  }, []);
  return (
    <div class="flex flex-col h-full w-full items-center justify-center p-5">
      <div class="max-h-[80%] max-w-full overflow-scroll">
        <h1 className="text-lg font-bold text-gray-300 ml-2">Wallet</h1>
        <table class="w-full rounded-xl bg-[#27273f]">
          <thead>
            <tr class="text-gray-500">
              <th class="px-4 py-3 text-left">Time</th>
              <th class="px-4 py-3 text-left">Private key</th>
              <th class="px-4 py-3 text-left">Address</th>
              <th class="px-4 py-3 text-left">Balance</th>
            </tr>
          </thead>
          <tbody class="text-gray-400">
            {wallet.map((row, index) => {
              return (
                <tr
                  key={index}
                  className={`${index === wallet.length - 1 ? "" : "border-b border-gray-600"}`}
                >
                  <td class="break-words px-4 py-3">{row.time}</td>
                  <td class="break-words px-4 py-3 sm:max-w-[300px] xl:max-w-none">
                    {row.private_key}
                  </td>
                  <td class="break-words px-4 py-3 sm:max-w-[300px] xl:max-w-none">
                    {row.address}
                  </td>
                  <td class="px-4 py-3 font-bold text-green-600">
                    {row.balance}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div class="max-h-[80%] max-w-full overflow-scroll">
        <h1 className="text-lg font-bold text-gray-300 ml-2">History</h1>
        <table class="w-full rounded-xl bg-[#27273f]">
          <thead>
            <tr class="text-gray-500">
              <th class="px-4 py-3 text-left">Total</th>
              <th class="px-4 py-3 text-left">Wallet</th>
              <th class="px-4 py-3 text-left">Token</th>
              <th class="px-4 py-3 text-left">Start At</th>
              <th class="px-4 py-3 text-left">End At</th>
            </tr>
          </thead>
          <tbody class="text-gray-400">
            {history.map((row, index) => {
              return (
                <tr
                  key={index}
                  className={`${index === history.length - 1 ? "" : "border-b border-gray-600"}`}
                >
                  <td class="break-words px-4 py-3">{row.total}</td>
                  <td class="break-words px-4 py-3 sm:max-w-[300px] xl:max-w-none font-bold text-green-500">
                    {row.wallet}
                  </td>
                  <td class="break-words px-4 py-3 sm:max-w-[300px] xl:max-w-none">
                    {row.token}
                  </td>
                  <td class="px-4 py-3">
                    {row.start_at}
                  </td>
                  <td class="px-4 py-3">
                    {row.end_at}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default History;
