import { Outlet } from "react-router-dom";
import dragon from "../assets/icons/japan.png";
import userImage from "../assets/icons/user.png";
import rabbit from "../assets/icons/rabbit.png";
import thunder from "../assets/icons/thunder.png";
import chart from "../assets/icons/line-chart.png";
import dollar from "../assets/icons/dollar.png";

const statistics = [
  {
    img: rabbit,
    title: "Total for All Goals",
    cost: "$6600.00",
  },
  {
    img: chart,
    title: "Total Monthly",
    cost: "$13255.36",
  },
  {
    img: dollar,
    title: "Total Daily",
    cost: "$568.75",
  },
  {
    img: thunder,
    title: "Net Losses",
    cost: "$0.00",
  },
];
const Layout = ({ children }) => {
  return (
    <div className="h-lvh w-lvw overflow-hidden bg-[#17182c]">
      <div className="m-auto flex h-full w-full gap-1 p-2">
        <div className="flex flex-col items-center bg-[#27273f] p-3 overflow-auto rounded-s-2xl">
          <img src={dragon} alt={dragon} className="mt-2 h-12 w-12 flex-none" />
          <ul className="flex flex-1 flex-col justify-center gap-4 py-10">
            <li className="rounded-full hover:bg-[#17182c]">
              <a href="">
                <i className="fa-solid fa-house p-3 text-white"></i>
              </a>
            </li>
            <li className="rounded-full hover:bg-[#17182c]">
              <a href="">
                <i className="fa-solid fa-file-pen p-3 text-white"></i>
              </a>
            </li>
            <li className="rounded-full hover:bg-[#17182c]">
              <a href="">
                <i className="fa-solid fa-compass p-3 text-white"></i>
              </a>
            </li>
            <li className="rounded-full hover:bg-[#17182c]">
              <a href="">
                <i className="fa-solid fa-gear p-3 text-white"></i>
              </a>
            </li>
          </ul>
          <div className="flex h-72 flex-col items-center gap-2 justify-end">
            <a href="">
              <i className="fa-solid fa-bell rounded-full p-3 text-white hover:bg-[#17182c]"></i>
            </a>
            <img src={userImage} alt={userImage} className="h-8 w-8" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="flex flex-col items-center gap-3 bg-[#27273f] p-4 grow rounded-se-2xl">
            <div className="flex flex-col grow gap-2">
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
                      <p className="font-popi text-sm">{statistic.title}</p>
                      <h2 className="font-bold">{statistic.cost}</h2>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <button className="font-bold text-md rounded-md bg-red-600 hover:bg-red-500 px-12 py-2 text-white">
                Stop
              </button>
              <button className="font-bold text-md rounded-md bg-green-600 hover:bg-green-500 px-12 py-2 text-white">
                Run
              </button>
            </div>
          </div>
          <div className="text-white text-center bg-[#27273f] w-full py-2 rounded-ee-2xl">
              <h3 className="font-bold">Infinity Wallet Miner</h3>
              <p className="text-sm">v 0.0.1</p>
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
