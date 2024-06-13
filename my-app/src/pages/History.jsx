import { useEffect, useState, useContext } from "react";
import dataScanContext from "../contexts/dataScanContext";

function History() {
  const { setIsRenew, isPause, setIsPause } = useContext(dataScanContext);
  const [history, setHistory] = useState([]);
  const [wallet, setWallet] = useState([]);
  const [tab, setTab] = useState(0); // [0: wallet, 1: history]
  const ipcRenderer = window.ipcRenderer;
  const activeTabStyle =
    "border-[#9e71fe] text-[#9e71fe] dark:border-[#9e71fe] dark:text-[#9e71fe]";
  const inactiveTabStyle =
    "hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300";

  const handleGetWallet = (event, data) => {
    setWallet(data.response);
  };
  const handleGetHistory = (event, data) => {
    setHistory(data.response);
  };
  useEffect(() => {
    ipcRenderer.send("get-wallet", {});
    ipcRenderer.on("get-wallet", handleGetWallet);
    ipcRenderer.send("get-history", {});
    ipcRenderer.on("get-history", handleGetHistory);
    ipcRenderer.send("stop", {});

    if (!isPause) {
      setIsPause(true);
      setIsRenew(true);
    }

    return () => {
      ipcRenderer.removeListener("get-wallet", handleGetWallet);
      ipcRenderer.removeListener("get-history", handleGetHistory);
    };
  }, []);
  return (
    <div className="flex h-full w-full flex-col gap-4 p-5">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <ul className="-mb-px flex flex-wrap text-center text-sm font-medium text-gray-500 dark:text-gray-400">
          <li onClick={() => setTab(0)} className="cursor-pointer">
            <a
              className={`group inline-flex items-center justify-center rounded-t-lg border-b-2 border-transparent p-4 ${tab === 0 ? activeTabStyle : inactiveTabStyle}`}
            >
              <i className="fa-solid fa-wallet mr-2 text-lg"></i>
              Wallet
            </a>
          </li>
          <li onClick={() => setTab(1)} className="cursor-pointer">
            <a
              className={`active group inline-flex items-center justify-center rounded-t-lg border-b-2 border-transparent p-4 ${tab === 1 ? activeTabStyle : inactiveTabStyle}`}
              aria-current="page"
            >
              <i className="fa-solid fa-landmark mr-2 text-lg"></i>
              History
            </a>
          </li>
        </ul>
      </div>
      {tab === 0 ? (
        <div className="h-full w-full overflow-scroll">
          <table className="w-full rounded-xl bg-[#27273f] bg-opacity-70 shadow-custom-inset-gray">
            <thead>
              <tr className="text-gray-200">
                <th className="px-4 py-3 text-center">Time</th>
                <th className="px-4 py-3 text-center">Private key</th>
                <th className="px-4 py-3 text-center">Address</th>
                <th className="px-4 py-3 text-center">Balance</th>
              </tr>
            </thead>
            <tbody className="text-gray-400">
              {wallet.map((row, index) => {
                return (
                  <tr
                    key={index}
                    className={`${index === wallet.length - 1 ? "" : "border-b border-gray-600"} text-sm`}
                  >
                    <td className="break-words px-4 py-3 text-center">
                      {row.time}
                    </td>
                    <td className="break-words px-4 py-3 text-center sm:max-w-[300px] xl:max-w-none">
                      {row.private_key}
                    </td>
                    <td className="break-words px-4 py-3 text-center sm:max-w-[300px] xl:max-w-none">
                      {row.address}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-green-600">
                      {row.balance}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="h-full w-full overflow-scroll">
          <table className="w-full rounded-xl bg-[#27273f] bg-opacity-70 shadow-custom-inset-gray">
            <thead>
              <tr className="text-gray-200">
                <th className="px-4 py-3 text-center">Total</th>
                <th className="px-4 py-3 text-center">Wallet</th>
                <th className="px-4 py-3 text-center">Token</th>
                <th className="px-4 py-3 text-center">Start Time</th>
                <th className="px-4 py-3 text-center">End Time</th>
              </tr>
            </thead>
            <tbody className="text-gray-400">
              {history.map((row, index) => {
                return (
                  <tr
                    key={index}
                    className={`${index === history.length - 1 ? "" : "border-b border-gray-600"} text-sm`}
                  >
                    <td className="break-words px-4 py-3 text-center">
                      {row.total}
                    </td>
                    <td className="break-words px-4 py-3 text-center font-bold text-green-500 sm:max-w-[300px] xl:max-w-none">
                      {row.wallet}
                    </td>
                    <td className="break-words px-4 py-3 text-center sm:max-w-[300px] xl:max-w-none">
                      {row.token}
                    </td>
                    <td className="px-4 py-3 text-center">{row.start_at}</td>
                    <td className="px-4 py-3 text-center">{row.end_at}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default History;
