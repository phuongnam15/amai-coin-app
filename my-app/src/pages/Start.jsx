import { useContext, useEffect, useRef, useState, useId } from "react";
import toastContext from "../contexts/toastContext";
const { useFormik } = require("formik");
const rabbit = require("../assets/icons/rabbit.png");
const thunder = require("../assets/icons/thunder.png");
const chart = require("../assets/icons/line-chart.png");
const dollar = require("../assets/icons/dollar.png");

const Start = () => {
  const ipcRenderer = window.ipcRenderer;
  const divRef = useRef(null);
  const divRef1 = useRef(null);
  const [totalPrivateKeys, setTotalPrivateKeys] = useState(0);
  const [totalScan, setTotalScan] = useState("0");
  const [totalBalance, setTotalBalance] = useState(0);
  const { toast } = useContext(toastContext);
  const [isPause, setIsPause] = useState(true);
  const [isRenew, setIsRenew] = useState(false);
  const [threads, setThreads] = useState(0);
  const [messages, setMessages] = useState([]);
  const [successMessages, setSuccessMessages] = useState([]);
  const formik = useFormik({
    initialValues: {
      listChecked: ["all_chain"],
    },
  });

  const handleStart = () => {
    if (formik.values.listChecked.length === 0) {
      toast("Please choose a coin to start", "error");
      return;
    }
    setIsPause(false);
    ipcRenderer.send("start", { listChecked: formik.values.listChecked });
  };
  const handlePause = () => {
    ipcRenderer.send("stop", {});
    setIsPause(true);
    setIsRenew(true);
  };
  const handleRenew = () => {
    ipcRenderer.send("renew", {});

    setMessages([]);
    if (divRef1.current) {
      divRef1.current.innerHTML = "";
    }

    setIsRenew(false);
    setIsPause(true);
    setTotalPrivateKeys(0);
    setTotalBalance(0);
    setTotalScan("0");
  };
  const handleChecked = (name) => {
    const { listChecked } = formik.values;
    if (listChecked.includes(name)) {
      const newListChecked = listChecked.filter((item) => item !== name);
      formik.setValues({ listChecked: newListChecked });
    } else {
      formik.setValues({ listChecked: [...listChecked, name] });
    }
  };
  const listItemToCheck = [
    // {
    //   name: "bitcoin",
    //   title: "Bitcoin",
    //   img: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
    // },
    {
      name: "all_chain",
      title: "All Chain",
      img: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    },
    // {
    //   name: "ripple",
    //   title: "Ripple",
    //   img: "https://cryptologos.cc/logos/huobi-token-ht-logo.png?v=002",
    // },
    // {
    //   name: "litecoin",
    //   title: "Litecoin",
    //   img: "https://cryptologos.cc/logos/litecoin-ltc-logo.png",
    // },
    // {
    //   name: "dogecoin",
    //   title: "Dogecoin",
    //   img: "https://cryptologos.cc/logos/dogecoin-doge-logo.png",
    // },
  ];
  const statistics = [
    {
      img: rabbit,
      title: "Runned",
      cost: totalScan,
    },
    {
      img: chart,
      title: "Private keys",
      cost: totalPrivateKeys,
    },
    {
      img: dollar,
      title: "Balance",
      cost: totalBalance,
    },
    {
      img: thunder,
      title: "Threads",
      cost: threads,
    },
  ];
  const handleCopy = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast("Copied !", "success");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };
  useEffect(() => {
    const handleLog = (event, data) => {
      setMessages(data.messages);
      setTotalScan(data.qty);

      if (data.message.privateKey !== "") {
        setSuccessMessages((prev) => [...prev, data.message]);
        setTotalPrivateKeys((prev) => prev + 1);
      }
      if (data.balance !== 0) {
        setTotalBalance((prev) => prev + data.balance);
      }
    };
    const handleThreads = (event, data) => {
      setThreads(data.threads);
    };

    ipcRenderer.on("log", handleLog);
    ipcRenderer.send("get:threads", {});
    ipcRenderer.on("get:threads", handleThreads);
    ipcRenderer.on("start", (event, data) => {
      console.log(data);
    });
  }, []);

  return (
    <div className="flex w-full">
      <div className="flex flex-col items-center gap-1">
        <div className="flex grow flex-col items-center gap-3 rounded-se-2xl bg-[#27273f] bg-opacity-70 p-4 shadow-custom-inset-gray">
          <div className="flex w-full grow flex-col gap-2">
            {statistics.map((statistic, index) => {
              return (
                <div className="flex gap-4" key={index}>
                  <div className="h-full">
                    <img
                      src={statistic.img}
                      alt={statistic.img}
                      className="h-10 w-10 p-1.5"
                    />
                  </div>
                  <div className="text-white">
                    <p className="text-sm font-extralight">{statistic.title}</p>
                    <h2 className="text-[14px] font-bold tracking-wider1">
                      {statistic.cost}
                    </h2>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex flex-1 flex-col justify-end gap-2">
            {isRenew ? (
              <button
                onClick={() => handleRenew()}
                className="hover:shadow-custom-inset-green relative border border-solid border-[#4eb84c] bg-[#4eb84c] px-16 py-2 text-sm font-medium leading-none text-white no-underline transition-all duration-300 hover:bg-custom-hover3"
              >
                Renew
              </button>
            ) : (
              <></>
            )}
            {isPause ? (
              <button
                onClick={() => handleStart()}
                className="relative border border-solid border-[#6f41d2] bg-[#6f41d2] px-16 py-2 text-sm font-medium leading-none text-white no-underline transition-all duration-300 hover:bg-custom-hover hover:shadow-custom-inset"
              >
                Start
              </button>
            ) : (
              <button
                onClick={() => handlePause()}
                className="hover:shadow-custom-gray relative border-solid border-gray-500 bg-gray-500 px-16 py-2 text-sm font-medium leading-none text-white no-underline transition-all duration-300 hover:bg-custom-hover3"
              >
                Pause
              </button>
            )}
          </div>
        </div>
        <div className="w-full rounded-ee-2xl bg-[#27273f] py-2 text-center bg-opacity-70 text-white shadow-custom-inset-gray">
          <h3 className="font-bold">Lam Software</h3>
          <p className="text-sm">v 0.0.1</p>
        </div>
      </div>
      <div className="flex grow flex-col gap-5 px-4 pt-4 text-white">
        <div className="flex space-x-4">
          {listItemToCheck.map((item, index) => {
            return (
              <div className="flex flex-col items-center" key={index}>
                <label
                  htmlFor={item.name}
                  className={`transition-border relative flex cursor-pointer flex-col items-center rounded-md border-1 border-solid border-gray-700 px-4 py-2 duration-200 hover:border-gray-500 hover:shadow-custom-inset-2`}
                >
                  {/* <img
                    src={item.img}
                    alt={item.name}
                    className="mb-1 h-7 w-7"
                  /> */}
                  <input
                    type="checkbox"
                    checked={formik.values.listChecked.includes(item.name)}
                    onChange={() => handleChecked(item.name)}
                    className="hidden h-3 w-3 text-yellow-500"
                    id={item.name}
                  ></input>
                  <span
                    className={`absolute right-0.5 top-0.5 h-2 w-2 ${formik.values.listChecked.includes(item.name) ? "border-[#6f41d2] bg-[#804cef]" : "border-gray-700"} 00 rounded-full border-1 border-solid`}
                  ></span>
                  <span className="text-[13px] font-bold">{item.title}</span>
                </label>
              </div>
            );
          })}
        </div>
        <div className="flex h-full w-full flex-col gap-2 overflow-auto rounded-2xl border-1 border-solid border-gray-700 p-3">
          <div
            ref={divRef}
            className="h-[50%] w-full grow overflow-y-scroll rounded-2xl border-1 border-solid border-[#424268] bg-[#28283d] bg-opacity-85 p-2 text-[12.5px] text-gray-500 shadow-custom-inset-gray"
          >
            {messages.map((message, index) => {
              return <p key={index}>{message}</p>;
            })}
          </div>
          <p className="w-full text-center text-[13px]">
            {totalPrivateKeys} Private Keys found
          </p>
          <div
            ref={divRef1}
            className="flex h-[30%] flex-col gap-1 overflow-y-scroll rounded-2xl border-1 border-solid border-[#424268] bg-[#17182c] bg-opacity-85 p-2 text-[12.5px] tracking-wider text-[#5edd88] shadow-custom-inset-gray"
          >
            {successMessages.map((message, index) => {
              return (
                <div className="flex items-center gap-2" key={index}>
                  <p>{message.successMessage}</p>
                  <button
                    className="rounded bg-gray-700 px-2 py-1 text-xs font-bold text-green-400 hover:bg-gray-600"
                    onClick={() => handleCopy(message.privateKey)}
                  >
                    Copy
                  </button>
                </div>
              );
            })}
          </div>
          {/* <div className="h-[10%] rounded-lg bg-[#17182c]"></div> */}
        </div>
      </div>
    </div>
  );
};

export default Start;
