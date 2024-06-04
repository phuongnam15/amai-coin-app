import React, { useState } from 'react';

function InputKey() {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="flex h-lvh w-lvw items-center justify-center bg-[#17182c]">
      <div className="relative flex items-center">
        <label className="absolute ml-2.5 mt-auto" htmlFor="">
          <i className={`fa-solid fa-key transition-text duration-500 ${isFocused ? 'text-purple-500' : 'text-white'}`}></i>
        </label>
        <input
          type="text"
          placeholder="MineCripto.Shop"
          className="border-b-1 border-solid border-white bg-transparent py-2 pl-10 text-gray-400 outline-none"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <span
          className={`absolute bottom-0 border-solid border-purple-500 transition-width duration-500 ease-in-out ${
            isFocused ? 'w-full border-1' : 'w-[0px]'
          }`}
        ></span>
      </div>
    </div>
  );
}

export default InputKey;
