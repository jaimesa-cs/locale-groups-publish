import "./timepicker.css";

import {
  Accordion,
  Button,
  Checkbox,
  DatePicker,
  FieldLabel,
  Icon,
  Info,
  Radio,
  TextInput,
  TimePicker2,
  ToggleSwitch,
  cbModal,
} from "@contentstack/venus-components";
import {
  CountryData,
  GroupConfiguration,
  PeriodTime,
} from "@/app/configuration/configuration";
import { showError, showMessage, showSuccess } from "@/app/utils/notifications";
import useSpanishDate, {
  convertToSpanishDate,
} from "@/app/hooks/useSpanishDate";

import CountryGroups from "@/app/components/sidebar/CountryGroups";
import DefaultLoading from "@/app/components/DefaultLoading";
import Environments from "@/app/components/sidebar/Environments";
import { IEnvironmentConfig } from "@/app/components/sidebar/models/models";
import React from "react";
import SpanishDateInfo from "./SpanishDateInfo";
import { debug } from "@/app/utils";
import { useCsOAuthApi } from "@/app/components/sidebar/ContentstackOAuthApi";
import { useEntryChange } from "@/app/hooks/useEntryChange";
import useUserSelections from "@/app/hooks/useUserSelections";

interface SelectionsProps {
  closeModal: () => void;
}

const Selections = ({}: SelectionsProps) => {
  const [publishing, setPublishing] = React.useState<boolean>(false); //TODO: use this to show a loading indicator
  const { isDst, spanishDate } = useSpanishDate();
  const [now, setNow] = React.useState<boolean>(true);
  const [withReferences, setWithReferences] = React.useState<boolean>(true);
  const [summerTime, setSummerTime] = React.useState<boolean>(isDst);

  const [date, setDate] = React.useState<string>(
    `${spanishDate.getFullYear()}/${
      spanishDate.getMonth() + 1
    }/${spanishDate.getDate()}`
  );
  const [time, setTime] = React.useState<string>(
    spanishDate.toTimeString().split(" ")[0]
  );

  const { environments, groups } = useUserSelections();
  const { publishEntry } = useCsOAuthApi();
  const { entry, contentTypeUid } = useEntryChange();

  const showDatePickerHandler = (e: any) => {
    cbModal({
      component: (props: any) => (
        <div className="grid h-full place-items-center p-10">
          <DatePicker
            initialDate={date}
            onChange={(e: any) => {
              setDate(e.replace(/-/g, "/"));
            }}
            closeModal={() => {
              props.closeModal();
            }}
          />
        </div>
      ),
      modalProps: {
        size: "customSize",
      },
    });
  };
  const showTimePickerHandler = (e: any) => {
    cbModal({
      component: (props: any) => (
        <div className="grid h-full place-items-center p-10">
          <TimePicker2
            initialDate={`${time}`}
            onDone={(e: string) => {
              setTime(e.split("-")[0]);
              props.closeModal();
            }}
            onCancel={() => {
              props.closeModal();
            }}
            inputDisabled={false}
            placeholder="Select time"
            viewType="time"
            hasVisitorTimezoneCheckBox={false}
            useVisitorTimezone={true}
            useVisitorTimezoneOnChange={(value: any) => {
              showMessage(`Visitor timezone is ${value ? "on" : "off"}`);
            }}
          />
        </div>
      ),
      modalProps: {
        size: "customSize",
      },
    });
  };
  const getSpanishScheduledDateString = React.useCallback(() => {
    const d = convertToSpanishDate(date, time, summerTime);
    return `${d.toLocaleDateString("es-ES")}, ${time}`;
  }, [date, time, summerTime]);

  const publishSelections = React.useCallback(() => {
    if (groups && environments && entry && contentTypeUid) {
      const g = groups.filter((g: GroupConfiguration) => g.checked);
      const e = environments.filter((e: IEnvironmentConfig) => e.checked);
      const userSelectedScheduleDate = convertToSpanishDate(
        date,
        time,
        summerTime
      );
      debug(
        `User selected schedule date DST[${summerTime}] >> ${userSelectedScheduleDate.toLocaleDateString()}`
      );
      const errors: any[] = [];

      for (let i = 0; i < g.length; i++) {
        const group: GroupConfiguration = groups[i];
        const countries = group.countries.filter((c: CountryData) => c.checked);
        for (let j = 0; j < countries.length; j++) {
          const country: CountryData = countries[j];

          const period: PeriodTime = summerTime
            ? country.summerTime
            : country.winterTime;
          const scheduledAt = new Date(userSelectedScheduleDate);

          if (period.dif === "-") {
            scheduledAt.setTime(
              scheduledAt.getTime() - period.hours * 60 * 60 * 1000
            );
          } else {
            scheduledAt.setTime(
              scheduledAt.getTime() + period.hours * 60 * 60 * 1000
            );
          }

          debug(
            "Country: ",
            country.name,
            ", Period: ",
            `${period.dif}${period.hours}`,
            "Actual:",
            scheduledAt.toUTCString()
          );
          publishEntry(
            entry.uid,
            contentTypeUid,
            entry._version,
            entry.locale,
            [country.locale],
            [...e.map((e: IEnvironmentConfig) => e.uid)],
            scheduledAt.toISOString(),
            withReferences,
            false,
            false
          )
            .then((response) => {
              debug("Response", response);
            })
            .catch((error) => {
              errors.push(error);
            });
        }
      }
      setPublishing(false);
      if (errors.length > 0) {
        showError("Errors while scheduling entries for publishing");
        console.log("Errors", errors);
      } else {
        showSuccess("Entries successfully scheduled for publishing");
      }
    }
  }, [
    groups,
    environments,
    entry,
    contentTypeUid,
    date,
    time,
    summerTime,
    publishEntry,
    withReferences,
  ]);

  return publishing ? (
    <DefaultLoading title="Publishing..." />
  ) : (
    <div className="flex flex-col h-full justify-between">
      <Accordion title={`Country Groups`} renderExpanded>
        <CountryGroups summerTime={summerTime} />
      </Accordion>
      <Accordion title={`Environments`} renderExpanded>
        <Environments />
      </Accordion>
      <Accordion
        title={`Publish Options`}
        renderExpanded
        noChevron
        accordionLock
      >
        <div className="flex flex-row pb-4 pl-2 gap-2">
          <div>
            <Radio
              id="checked"
              checked={now}
              label="Now"
              onClick={() => {
                setNow((p) => !p);
              }}
            />
          </div>
          <div>
            <Radio
              id="checked"
              checked={!now}
              label="Later"
              onClick={() => {
                setNow((p) => !p);
              }}
            />
          </div>
          <div className="pt-3 pl-5">
            <Checkbox
              id="checked"
              checked={withReferences}
              label="Include References"
              onClick={() => {
                setWithReferences((wr) => !wr);
              }}
            />
          </div>
          <div className="pt-3 pl-5">
            <ToggleSwitch
              id="checked"
              checked={summerTime}
              label="Summer Time"
              onClick={() => {
                setSummerTime((st) => !st);
              }}
            />
          </div>
        </div>
        {!now && (
          <div className="flex flex-row pl-2 gap-2">
            <div>
              <FieldLabel htmlFor="date">Date in Spain:</FieldLabel>
              <TextInput
                name="date"
                // disabled={true}
                placeholder=""
                value={date}
                onChange={(e: any) => {
                  console.log(e.target.value);
                }}
                className="w-1/2"
                onClick={showDatePickerHandler}
              />
            </div>
            <div>
              <FieldLabel htmlFor="time">Time in Spain:</FieldLabel>
              <TextInput
                name="time"
                placeholder=""
                value={time}
                onChange={(e: any) => {
                  console.log(e.target.value);
                }}
                className="w-1/2"
                onClick={showTimePickerHandler}
              />
            </div>
          </div>
        )}
      </Accordion>
      <div className="grid grid-cols-3 gap-2">
        {!now && (
          <>
            <div className="pb-2">
              <SpanishDateInfo />
            </div>

            <div className="pb-2">
              <Info
                content={
                  <div>
                    <p>
                      Selected Publishing Date in Spain: <br />
                      <strong>{getSpanishScheduledDateString()}</strong>
                    </p>
                  </div>
                }
                icon={<Icon icon="InfoCircleWhite" />}
              />
            </div>
            <div className="pb-2">
              <Info
                content={
                  <div>
                    <p>
                      Summer Time <br /> <strong>{isDst ? `Yes` : `No`}</strong>
                    </p>
                  </div>
                }
                icon={<Icon icon="InfoCircleWhite" />}
              />
            </div>
          </>
        )}
      </div>
      <Button
        buttonType="primary"
        isFullWidth
        disabled={
          publishing ||
          !groups ||
          !environments ||
          groups.filter((g: GroupConfiguration) => g.checked).length === 0 ||
          environments.filter((e: IEnvironmentConfig) => e.checked).length === 0
        }
        isLoading={publishing}
        loadingColor="#6c5ce7"
        onClick={() => {
          publishSelections();
        }}
      >
        Publish
      </Button>
    </div>
  );
};

export default Selections;
