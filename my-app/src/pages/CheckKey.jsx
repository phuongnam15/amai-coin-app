
import { Link } from "react-router-dom";
import rabbit from "../assets/icons/rabbit.png";

const CheckKey = () => {
  return (
    <div className="flex h-lvh w-lvw items-center justify-center bg-[#17182c]">
      <div className="flex h-5/6 w-2/3 sm:w-1/2 xl:w-1/3 flex-col items-center justify-center rounded-lg bg-[#27273f] gap-5 p-5">
        <img src={rabbit} alt={rabbit} className="w-16 h-16"/>
        <div className="flex flex-col justify-center items-center">
          <h1 className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-3xl font-black text-transparent">
            ETH SCANNER
          </h1>
          <div className="flex gap-2 w-[90%]">
            <p className="w-1/2 rounded border-1 border-solid border-gray-700 py-0.5 text-center text-[10px] text-gray-400">
              VIETNAMESE
            </p>
            <p className="w-1/2 rounded border-1 border-solid border-gray-700 py-0.5 text-center text-[10px] text-gray-400">
              ENGLISH
            </p>
          </div>
        </div>
        <p className="text-gray-300 text-center text-sm w-5/6">
          Vui lòng gửi mã bên dưới ( mất 2 ohuts để khởi tạo mã UUID ) và ảnh
          chụp thông tin thanh toán cho Admin qua các kênh bên dưới để nhận
          license key kích hoạt Tool
        </p>
        <div className="flex gap-2">
            <a href="" className="font-bold text-green-400 text-xs">Telegram</a>
            <a href="" className="font-bold text-green-400 text-xs">Telegram Chanel</a>
        </div>
        <div className="flex w-[80%]">
          <input
            type="text"
            value="jbnnIUknIukln78Guh78ih8bihibiuhN8hiub7IIBIBuibih7ijn"
            className="flex-1 bg-transparent border-1 border-solid border-gray-700 text-gray-300 text-xs py-2 px-3 outline-none rounded-s"
          />
          <button className="text-green-400 px-4 font-bold bg-gray-700 rounded-e text-xs hover:bg-gray-600">Sao chép</button>
        </div>
        <input
          type="text"
          value="jbnnIUknIukln78Guh78ih8bihibiuhN8hiub7IIBIBuibih7ijn"
          className="w-[80%] bg-transparent border-1 border-solid border-gray-700 text-gray-300 text-xs py-2 px-3 outline-none rounded"
        />
        <div className="flex gap-3">
          <Link to="/" className="hover:bg-custom-hover hover:shadow-custom-inset relative border border-solid border-purple-500 bg-purple-500 px-7 py-2 text-xs font-bold leading-none text-white no-underline transition-all duration-300 rounded-md">Dùng thử</Link>
          <Link to="/" className="hover:bg-custom-hover2 hover:shadow-custom-inset-pink relative border border-solid border-pink-500 bg-pink-500 px-7 py-2 text-xs font-bold leading-none text-white no-underline transition-all duration-300 rounded-md">Kích hoạt</Link>
        </div>
      </div>
    </div>
  );
};

export default CheckKey;
