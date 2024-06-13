import { useFormik } from "formik";
import { useContext, useEffect, useState } from "react";
import toastContext from "../contexts/toastContext";

function Confix() {
  const ipcRenderer = window.ipcRenderer;
  const { toast } = useContext(toastContext);
  const [recommendThreads, setRecommendThreads] = useState(0);
  const formik = useFormik({
    initialValues: {
      threads: 1,
      telegram_id: "",
    },
  });
  const handleConfig = () => {
    ipcRenderer.send("config", {
      threads: formik.values.threads,
      telegram_id: formik.values.telegram_id,
    });
  };
  useEffect(() => {
    ipcRenderer.send("recommend:threads", {});
    ipcRenderer.on("recommend:threads", (event, data) => {
      setRecommendThreads(data.threads);
    });
    ipcRenderer.on("config", (event, data) => {
      if (data.response === "OK") {
        toast("Config successfully", "success");
      }
    });
    ipcRenderer.send("stop", {});
  }, []);
  return (
    <div className="flex h-full w-full items-center justify-center bg-transparent">
      <div className="flex w-1/2 flex-col gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-300">Config</h1>
          <p className="text-sm text-gray-500">
            Recommend maximum threads: {recommendThreads}
          </p>
        </div>

        <label htmlFor="threads" className="w-full">
          <p className="font-bold text-gray-400">Threads</p>
          <input
            min="1"
            max="5"
            id="threads"
            onChange={formik.handleChange}
            type="number"
            className="w-full border-1 border-solid border-[#2f2f4d] bg-transparent p-2 text-gray-400 outline-none"
          />
        </label>
        <label htmlFor="telegram_id" className="w-full">
          <p className="font-bold text-gray-400">Telegram Id</p>
          <input
            id="telegram_id"
            onChange={formik.handleChange}
            type="text"
            className="w-full border-1 border-solid border-[#2f2f4d] bg-transparent p-2 text-gray-400 outline-none"
          />
        </label>
        <button
          onClick={() => handleConfig()}
          className="w-full border-1 border-solid border-[#35355b] bg-[#35355b] py-3 text-sm font-medium leading-none text-white no-underline transition-all duration-300 hover:bg-custom-hover3 hover:shadow-custom-inset-gray"
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default Confix;
