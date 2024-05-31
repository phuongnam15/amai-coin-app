const { useFormik } = require("formik");

const Home = () => {
  const formik = useFormik({
    initialValues: {
      listChecked: [],
    },
  });
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
    {
      name: "bitcoin",
      title: "Bitcoin",
      img: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
    },
    {
      name: "ethereum",
      title: "Ethereum",
      img: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    },
    {
      name: "ripple",
      title: "Ripple",
      img: "https://cryptologos.cc/logos/huobi-token-ht-logo.png?v=002",
    },
    {
      name: "litecoin",
      title: "Litecoin",
      img: "https://cryptologos.cc/logos/litecoin-ltc-logo.png",
    },
    {
      name: "dogecoin",
      title: "Dogecoin",
      img: "https://cryptologos.cc/logos/dogecoin-doge-logo.png",
    },
  ];
  return (
    <div className="flex grow flex-col gap-5 p-4 text-white">
      {/* <div className="flex items-center justify-between">
        <div className="relative flex items-center">
          <label className="absolute ml-2.5 mt-auto" htmlFor="">
            <i className="fa-solid fa-magnifying-glass"></i>
          </label>
          <input
            type="text"
            placeholder="MineCripto.Shop"
            className="border-b-1 border-solid border-white bg-transparent py-2 pl-10 outline-none"
          />
          <span className="border-1 border-solid border-sky-500 absolute w-full bottom-0"></span>
        </div>
        <div className="flex items-center gap-4">
          <button className="rounded-3xl hover:bg-custom-hover hover:shadow-custom-inset relative border border-solid border-[#6f41d2] bg-[#6f41d2] px-10 py-2.5 text-sm font-medium leading-none text-white no-underline transition-all duration-300">
            Search
          </button>
          <a href="">
            <i className="fa-solid fa-bell rounded-full bg-[#27273f] p-3 text-white hover:bg-[#6f41d2]"></i>
          </a>
        </div>
      </div> */}
      <div className="flex space-x-4 justify-center">
        {listItemToCheck.map((item, index) => {
          return (
            <div className="flex flex-col items-center" key={index}>
              <label
                htmlFor={item.name}
                className={`hover:shadow-custom-inset-2 flex cursor-pointer flex-col items-center rounded-md border-1 border-solid ${formik.values.listChecked.includes(item.name) ? "border-[#6f41d2]" : "border-gray-700 hover:border-gray-500"} transition-border px-8 py-4 duration-200`}
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
      <div className="flex flex-col bg-[#27273f] rounded-2xl w-full h-full p-2 gap-2">
        <div className="flex justify-around font-bold">
          <h3>Ai Minor</h3>
          <span>0</span>
          <p>Wallot Checked</p>
        </div>
        <div className="bg-[#17182c] h-[60%] rounded-xl"></div>
        <p className="w-full text-center">12 seed phrase Found:</p>
        <div className="bg-[#17182c] h-[20%] rounded-xl"></div>
        <div className="bg-[#17182c] h-[10%] rounded-xl"></div>
      </div>
    </div>
  );
};

export default Home;
