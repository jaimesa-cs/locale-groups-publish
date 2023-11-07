import { Icon, Info } from "@contentstack/venus-components";

import useSpanishDate from "@/app/hooks/useSpanishDate";

interface SpanishDateInfoProps {
  showDst?: boolean;
  showUtc?: boolean;
  forceDst?: boolean;
}
const SpanishDateInfo = ({
  showDst,
  showUtc,
  forceDst,
}: SpanishDateInfoProps) => {
  const { spanishDate, spanishDateString, isDst } = useSpanishDate(forceDst);
  return (
    <Info
      content={
        <div>
          <p>
            The local time in Spain is: <br />
            <strong>
              {spanishDateString} <br />
              {showDst ? `${isDst ? `Summer Time` : `No Summer Time`}` : ""}
            </strong>
          </p>
          {showUtc && (
            <>
              <br />
              <p>{spanishDate.toUTCString()}</p>
            </>
          )}
        </div>
      }
      icon={<Icon icon="InfoCircleWhite" />}
    />
  );
};

export default SpanishDateInfo;
