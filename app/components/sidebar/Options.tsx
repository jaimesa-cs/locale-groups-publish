"use client";

import Environments from "./Environments";
import Locales from "./Locales";

interface OptionsProps {
  loading: boolean;
}

function Options({}: OptionsProps) {
  return (
    <div className="">
      <Locales />
      {/* <Environments /> */}
    </div>
  );
}
export default Options;
