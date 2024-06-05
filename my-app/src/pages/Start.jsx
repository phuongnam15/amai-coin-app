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
  const uniqueId = useId();
  const [isPause, setIsPause] = useState(true);
  const [isRenew, setIsRenew] = useState(false);
  const formik = useFormik({
    initialValues: {
      listChecked: ["ethereum"],
    },
  });

  const handleStart = () => {
    if (formik.values.listChecked.length === 0) {
      alert("Please choose a coin to mine");
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

    if (divRef.current) {
      divRef.current.innerHTML = "";
    }
    if (divRef1.current) {
      divRef1.current.innerHTML = "";
    }

    setIsRenew(false);
    setIsPause(true);
    setTotalPrivateKeys(0)
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
      name: "ethereum",
      title: "Ethereum",
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
      cost: "0",
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
  function cssEscape(value) {
    if (value) {
      return value.replace(/([^\w-])/g, "\\$1");
    }
    return value;
  }
  useEffect(() => {
    const handleLog = (event, data) => {
      if (!divRef.current) return;
      divRef.current.insertAdjacentHTML("beforeend", `<p>${data.message}</p>`);
      divRef.current.scrollTop = divRef.current.scrollHeight;
      setTotalScan(data?.qty);

      if (data.message.includes("Success")) {
        const parts = data.message.split(" ");
        const firstThree = parts.slice(0, 3).join(" ");
        const last = parts[3];
        const escapeId = cssEscape(uniqueId);

        const html = `
          <div class="flex gap-2 items-center">
            <p>${firstThree}</p>
            <button class="rounded bg-gray-700 px-2 py-1 text-xs font-bold text-green-400 hover:bg-gray-600" id="${uniqueId}" data-last="${last}">Copy</button>
          </div>
        `;

        divRef1.current.insertAdjacentHTML("beforeend", html);
        const copyButton = divRef1.current.querySelector(`#${escapeId}`);
        if (copyButton) {
          copyButton.onclick = () => handleCopy(last);
        }
        divRef1.current.scrollTop = divRef1.current.scrollHeight;
        setTotalPrivateKeys((prev) => prev + 1);
      }
    };
    ipcRenderer.on("log", handleLog);
    ipcRenderer.on("balance", (event, data) => {
      setTotalBalance((prev) => prev + parseInt(data.balance));
    });
  }, []);

  return (
    <div className="flex w-full">
      <div className="flex flex-col items-center gap-1">
        <div className="flex grow flex-col items-center gap-3 rounded-se-2xl bg-[#27273f] p-4">
          <div className="flex grow flex-col gap-2">
            {statistics.map((statistic, index) => {
              return (
                <div className="flex gap-4" key={index}>
                  <div className="h-full">
                    <img
                      src={statistic.img}
                      alt={statistic.img}
                      className="h-10 w-10 bg-[#2d2d53] p-2"
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
                className="relative border border-solid border-pink-600 bg-pink-600 px-16 py-2 text-sm font-medium leading-none text-white no-underline transition-all duration-300 hover:bg-custom-hover2 hover:shadow-custom-inset-pink"
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
                className="hover:bg-custom-hover3 hover:shadow-custom-gray relative border border-solid border-gray-500 bg-gray-500 px-16 py-2 text-sm font-medium leading-none text-white no-underline transition-all duration-300"
              >
                Pause
              </button>
            )}
          </div>
        </div>
        <div className="w-full rounded-ee-2xl bg-[#27273f] py-2 text-center text-white">
          <h3 className="font-bold">Infinity Wallet Miner</h3>
          <p className="text-sm">v 0.0.1</p>
        </div>
      </div>
      <div className="flex grow flex-col gap-5 px-4 pt-4 text-white">
        <div className="flex justify-center space-x-4">
          {listItemToCheck.map((item, index) => {
            return (
              <div className="flex flex-col items-center" key={index}>
                <label
                  htmlFor={item.name}
                  className={`flex cursor-pointer flex-col items-center rounded-md border-1 border-solid hover:shadow-custom-inset-2 ${formik.values.listChecked.includes(item.name) ? "border-[#6f41d2]" : "border-gray-700 hover:border-gray-500"} transition-border px-8 py-4 duration-200`}
                >
                  <img
                    src={item.img}
                    alt={item.name}
                    className="mb-1 h-7 w-7"
                  />
                  <input
                    type="checkbox"
                    checked={formik.values.listChecked.includes(item.name)}
                    onChange={() => handleChecked(item.name)}
                    className="hidden h-3 w-3 text-yellow-500"
                    id={item.name}
                  ></input>
                  <span className="text-[13px] font-bold">{item.title}</span>
                </label>
              </div>
            );
          })}
        </div>
        <div className="flex h-full w-full flex-col gap-2 overflow-auto rounded-2xl bg-[#27273f] p-3">
          {/* <div className="flex justify-around font-bold">
            <h3>Ai Minor</h3>
            <span>0</span>
            <p>Wallot Checked</p>
          </div> */}
          <div
            ref={divRef}
            className="h-[60%] w-full grow overflow-y-scroll rounded-lg bg-[#17182c] p-2 text-[12.5px] text-gray-400"
          ></div>
          <p className="w-full text-center text-[13px]">
            {totalPrivateKeys} Private Keys found
          </p>
          <div
            ref={divRef1}
            className="h-[20%] overflow-y-scroll rounded-lg bg-[#17182c] p-2 text-[12.5px] text-green-500"
          ></div>
          <div className="h-[10%] rounded-lg bg-[#17182c]"></div>
        </div>
      </div>
    </div>
  );
};

export default Start;
