import { useEffect, useRef, useState } from "react";
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
    ipcRenderer.send("start", { listChecked: formik.values.listChecked });
  };
  const handleStop = () => {
    ipcRenderer.send("stop", {});
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
      cost: "0",
    },
    {
      img: thunder,
      title: "Threads",
      cost: "0",
    },
  ];

  useEffect(() => {
    const handleLog = (event, data) => {
      if (!divRef.current) return;
      divRef.current.insertAdjacentHTML("beforeend", `<p>${data.message}</p>`);
      divRef.current.scrollTop = divRef.current.scrollHeight;
      setTotalScan(data?.message?.split(" ")[0]);
      if (
        data.message.includes("Success") ||
        data.message.includes("Private")
      ) {
        divRef1.current.insertAdjacentHTML(
          "beforeend",
          `<p>${data.message}</p>`,
        );
        divRef1.current.scrollTop = divRef1.current.scrollHeight;
        setTotalPrivateKeys((prev) => prev + 1);
      }
    };
    ipcRenderer.on("log", handleLog);
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
            <button
              onClick={() => handleStop()}
              className="relative border border-solid border-[#6f41d2] bg-[#6f41d2] px-16 py-2 text-sm font-medium leading-none text-white no-underline transition-all duration-300 hover:bg-custom-hover hover:shadow-custom-inset"
            >
              Stop
            </button>
            <button
              onClick={() => handleStart()}
              className="relative border border-solid border-[#6f41d2] bg-[#6f41d2] px-16 py-2 text-sm font-medium leading-none text-white no-underline transition-all duration-300 hover:bg-custom-hover hover:shadow-custom-inset"
            >
              Start
            </button>
          </div>
        </div>
        <div className="w-full rounded-ee-2xl bg-[#27273f] py-2 text-center text-white">
          <h3 className="font-bold">Infinity Wallet Miner</h3>
          <p className="text-sm">v 0.0.1</p>
        </div>
      </div>
      <div className="flex grow flex-col gap-5 p-4 text-white">
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
        <div className="flex h-full w-full flex-col gap-2 rounded-2xl bg-[#27273f] p-2 overflow-auto">
          {/* <div className="flex justify-around font-bold">
            <h3>Ai Minor</h3>
            <span>0</span>
            <p>Wallot Checked</p>
          </div> */}
          <div
            ref={divRef}
            className="h-[60%] w-full overflow-y-scroll rounded-lg bg-[#17182c] p-2 text-[12.5px] text-gray-400"
          >
          </div>
          <p className="w-full text-center text-[13px]">
            {totalPrivateKeys} Private Keys found
          </p>
          <div
            ref={divRef1}
            className="h-[20%] overflow-y-scroll rounded-lg bg-[#17182c] p-2 text-[12.5px] text-green-500"
          >
          </div>
          <div className="h-[10%] rounded-lg bg-[#17182c]"></div>
        </div>
      </div>
    </div>
  );
};

export default Start;
