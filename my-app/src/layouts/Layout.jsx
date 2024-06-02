import { Link, Outlet } from "react-router-dom";
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

const menuItems = [
  {
    icon: "fa-solid fa-house",
    href: "/",
  },
  {
    icon: "fa-solid fa-file-pen",
    href: "/check-key",
  },
  {
    icon: "fa-solid fa-compass",
    href: "/check-key",
  },
  {
    icon: "fa-solid fa-gear",
    href: "/check-key",
  },
];

const Layout = ({ children }) => {
  return (
    <div className="h-lvh w-lvw overflow-hidden bg-[#17182c]">
      <div className="m-auto flex h-full w-full gap-1 p-2">
        <div className="flex flex-col items-center overflow-auto rounded-s-2xl bg-[#27273f] p-3">
          <img src={dragon} alt={dragon} className="mt-2 h-12 w-12 flex-none" />
          <ul className="flex flex-1 flex-col justify-center gap-4 py-10">
            {menuItems.map((item, index) => {
              return (
                <li className="transition-border rounded-full border-1 border-solid border-[#27273f] text-white duration-500 hover:border-[#6f41d2]">
                  <Link to={item.href}>
                    <i className={item.icon + " p-3"}></i>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="flex h-72 flex-col items-center justify-end gap-2">
            {/* <div className="transition-border rounded-full border-1 border-solid border-[#27273f] text-white duration-500 hover:border-[#6f41d2]">
              <a href="">
                <i className="fa-solid fa-bell p-3"></i>
              </a>
            </div> */}
            <img
              src={userImage}
              alt={userImage}
              className="h-8 w-8 cursor-pointer"
            />
          </div>
        </div>
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
                      <p className="text-sm font-extralight">
                        {statistic.title}
                      </p>
                      <h2 className="tracking-wider1 text-[14px] font-bold">
                        {statistic.cost}
                      </h2>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-1 flex-col justify-end gap-2">
              <button className="hover:bg-custom-hover hover:shadow-custom-inset relative border border-solid border-[#6f41d2] bg-[#6f41d2] px-16 py-2 text-sm font-medium leading-none text-white no-underline transition-all duration-300">
                Stop
              </button>
              <button className="hover:bg-custom-hover hover:shadow-custom-inset relative border border-solid border-[#6f41d2] bg-[#6f41d2] px-16 py-2 text-sm font-medium leading-none text-white no-underline transition-all duration-300">
                Run
              </button>
            </div>
          </div>
          <div className="w-full rounded-ee-2xl bg-[#27273f] py-2 text-center text-white">
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
