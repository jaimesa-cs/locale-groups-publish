import { Icon, Info } from "@contentstack/venus-components";

import React from "react";
import useLocaleDate from "@/app/hooks/useLocaleDate";

interface SpanishDateInfoProps {}

const SpanishDateInfo = ({}: SpanishDateInfoProps) => {
  const { localeDateString, isDst } = useLocaleDate({
    zone: process.env.NEXT_PUBLIC_TIMEZONE ?? "Europe/Madrid",
    fmt: process.env.NEXT_PUBLIC_DATE_FORMAT ?? "dd/MM/yyyy HH:mm:ss",
  });
  return (
    <Info
      content={
        <div>
          <p>
            The local time in Spain is: <br />
            <strong>
              {localeDateString}
              {isDst && <sup className="text-[8px]"> DST</sup>}
              <br />
            </strong>
          </p>
        </div>
      }
      icon={<Icon icon="InfoCircleWhite" />}
    />
  );
};

export default SpanishDateInfo;
