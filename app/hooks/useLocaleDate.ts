import { DateTime, Settings, Zone } from "luxon";

import React from "react";

interface UseLocaleDateProps {
  zone: string;
  fmt: string;
}
Settings.defaultLocale = "es";

const useLocaleDate = ({ zone, fmt }: UseLocaleDateProps) => {
  const [date, setDate] = React.useState<DateTime>(
    DateTime.fromISO(new Date().toISOString(), { zone: zone })
  );
  const [localeDateString, setLocaleDateString] = React.useState<string>(
    date.toFormat(fmt)
  );

  const [isDst, setIsDst] = React.useState<boolean>(date.isInDST);

  const setDateData = React.useCallback(() => {
    let d = DateTime.fromISO(new Date().toISOString(), {
      zone: zone,
    });

    setDate(d);
    setIsDst(d.isInDST);
    setLocaleDateString(d.toFormat(fmt));
  }, [fmt, zone]);

  React.useEffect(() => {
    setDateData();
    const interval = setInterval(() => {
      setDateData();
    }, 1000);
    return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    zone,
    fmt,
    date,
    localeDateString,
    isDst,
    convertToLocaleDate: (date: string, time: string) => {
      const [hours, minutes, seconds] = time.split(":");
      let [year, month, day] = date.split("/");
      const d = DateTime.fromISO(
        `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000`,
        { zone: zone }
      );
      return d.toJSDate();
    },
  };
};

export default useLocaleDate;
