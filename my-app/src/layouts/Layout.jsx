import { Link, Outlet } from "react-router-dom";
import dragon from "../assets/icons/japan.png";

const menuItems = [
  {
    icon: "fa-solid fa-house",
    href: "/start",
  },
  {
    icon: "fa-solid fa-file-pen",
    href: "/key",
  },
  {
    icon: "fa-solid fa-compass",
    href: "/history",
  },
  {
    icon: "fa-solid fa-gear",
    href: "/config",
  },
];

const Layout = ({ children }) => {
  return (
    <div className="h-lvh w-lvw overflow-hidden bg-[#17182c]">
      <div className="m-auto flex h-full w-full gap-1 p-2">
        <div className="flex flex-col items-center rounded-s-2xl border-1 border-solid border-[#2f2f4d] p-3 backdrop-opacity-10">
          <img src={dragon} alt={dragon} className="mt-2 h-12 w-12 flex-none" />
          <ul className="flex flex-1 flex-col justify-center gap-4 py-10">
            {menuItems.map((item, index) => {
              return (
                <li key={index} className="transition-border rounded-full border-1 border-solid border-[#27273f] text-white duration-500 hover:border-[#6f41d2]">
                  <Link to={item.href}>
                    <i className={item.icon + " p-3"}></i>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="flex h-72 flex-col items-center justify-end">
            <Link to="/">
              <i className="fa-solid fa-circle-user fa-2xl pb-5 cursor-pointer hover:text-[#6f41d2] text-white transition-text duration-300"></i>
            </Link>
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
