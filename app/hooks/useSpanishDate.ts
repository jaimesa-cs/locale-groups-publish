import React from "react";
import { isDstObserved } from "../utils";
export const calcSpanishTime = (date?: Date) => {
  // create Date object for current location
  const d = date ? new Date(date) : new Date();
  const offset = isDstObserved(d) ? 1 : 2;

  // convert to msec
  // add local time zone offset
  // get UTC time in msec
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;

  // create new Date object for different city
  // using supplied offset
  const nd = new Date(utc + 3600000 * offset);

  // return time as a string
  return nd;
};

export const convertToSpanishDate = (
  date: string,
  time: string,
  isDst: boolean
) => {
  const [hours, minutes, seconds] = time.split(":");
  let [year, month, day] = date.split("/");

  day = day.length === 1 ? `0${day}` : `${day}`;
  month = month.length === 1 ? `0${month}` : `${month}`;

  //   console.log("date", date);
  //   console.log("time", time);
  //   console.log("isDst", isDst);
  //   console.log("hours", hours);
  //   console.log("minutes", minutes);
  //   console.log("seconds", seconds);
  //   console.log("month", month);
  //   console.log("day", day);
  //   console.log("year", year);

  //2020-04-13T00:00:00.000+08:00
  const diff = isDst ? 1 : 2;
  const dateString = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000+0${diff}:00`;

  return new Date(dateString);
};

const useSpanishDate = () => {
  const [spanishDate, setSpanishDate] = React.useState<Date>(calcSpanishTime());
  const [spanishDateString, setSpanishDateString] = React.useState<string>(
    spanishDate.toLocaleString("es-ES", { hour12: false })
  );
  const [isDst, setIsDst] = React.useState<boolean>(isDstObserved(spanishDate));

  React.useEffect(() => {
    const interval = setInterval(() => {
      const d = calcSpanishTime();
      setSpanishDate(d);
      setSpanishDateString(d.toLocaleString("es-ES", { hour12: false }));
      setIsDst(isDstObserved(d));
    }, 1000);
    return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    spanishDate,
    spanishDateString,
    isDst,
  };
};

export default useSpanishDate;