import { createContext } from "react";

const toastContext = createContext();

export const ToastContextProvider = ({ children }) => {
  const Toastify = window.Toastify;
  const styleAlert = {
    position: "fixed",
    padding: "2px 20px",
    // maxWidth: "10%",
    color: "white",
    textAlign: "center",
    fontSize: "0.85rem",
    right: "0px",
    zIndex: 999999,
  };
  const toast = (message, color) => {
    Toastify.toast({
      text: message,
      duration: 2000,
      style: {
        ...styleAlert,
        backgroundColor: color === "success" ? "#4ad477" : "#f7502a",
      },
    });
  };
  return (
    <toastContext.Provider value={{ toast }}>{children}</toastContext.Provider>
  );
};
export default toastContext;
