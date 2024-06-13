import { createContext, useMemo, useState } from "react";

const dataScanContext = createContext();

export const DataScanContextProvider = ({ children }) => {
  const [threads, setThreads] = useState(0);
  const [messages, setMessages] = useState([]);
  const [successMessages, setSuccessMessages] = useState([]);
  const [totalPrivateKeys, setTotalPrivateKeys] = useState(0);
  const [totalScan, setTotalScan] = useState("0");
  const [totalBalance, setTotalBalance] = useState(0);
  const [isPause, setIsPause] = useState(true);
  const [isRenew, setIsRenew] = useState(false);

  const value = useMemo(
    () => ({
      threads,
      setThreads,
      messages,
      setMessages,
      successMessages,
      setSuccessMessages,
      totalPrivateKeys,
      setTotalPrivateKeys,
      totalScan,
      setTotalScan,
      totalBalance,
      setTotalBalance,
      isPause,
      setIsPause,
      isRenew,
      setIsRenew
    }),
    [
      threads,
      messages,
      successMessages,
      totalPrivateKeys,
      totalScan,
      totalBalance,
      isPause,
      isRenew
    ],
  );

  return (
    <dataScanContext.Provider value={value}>
      {children}
    </dataScanContext.Provider>
  );
};
export default dataScanContext;
