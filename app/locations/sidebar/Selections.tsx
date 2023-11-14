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
  Tooltip,
  cbModal,
} from "@contentstack/venus-components";
import {
  CountryData,
  GroupConfiguration,
  PeriodTime,
} from "@/app/configuration/configuration";
import { debug, debugEnabled } from "@/app/utils";
import { showError, showMessage, showSuccess } from "@/app/utils/notifications";

import CountryGroups from "@/app/components/sidebar/CountryGroups";
import { DateTime } from "luxon";
import DefaultLoading from "@/app/components/DefaultLoading";
import Environments from "@/app/components/sidebar/Environments";
import { IEnvironmentConfig } from "@/app/components/sidebar/models/models";
import React from "react";
import SpanishDateInfo from "./SpanishDateInfo";
import { useCsOAuthApi } from "@/app/components/sidebar/ContentstackOAuthApi";
import { useEntryChange } from "@/app/hooks/useEntryChange";
import useLocaleDate from "@/app/hooks/useLocaleDate";
import useUserSelections from "@/app/hooks/useUserSelections";

interface SelectionsProps {
  closeModal: () => void;
}

interface DateInfo {
  date: string;
  time: string;
  summerTime: boolean;
}

const Selections = ({}: SelectionsProps) => {
  const [publishing, setPublishing] = React.useState<boolean>(false); //TODO: use this to show a loading indicator
  const { isDst, date, convertToLocaleDate, zone, fmt } = useLocaleDate({
    zone: process.env.NEXT_PUBLIC_TIMEZONE ?? "Europe/Madrid",
    fmt: process.env.NEXT_PUBLIC_DATE_FORMAT ?? "dd/MM/yyyy HH:mm:ss",
  });
  const [now, setNow] = React.useState<boolean>(true);
  const [withReferences, setWithReferences] = React.useState<boolean>(true);

  const [dateInfo, setDateInfo] = React.useState<DateInfo>({
    date: date.toFormat("yyyy/MM/dd"),
    time: date.toFormat("HH:mm:ss"),
    summerTime: isDst,
  } as DateInfo);

  const { environments, groups } = useUserSelections();
  const { publishEntry } = useCsOAuthApi();
  const { entry, contentTypeUid } = useEntryChange();

  const showDatePickerHandler = (e: any) => {
    cbModal({
      component: (props: any) => (
        <div className="grid h-full place-items-center p-10">
          <DatePicker
            initialDate={dateInfo.date}
            onChange={(e: any) => {
              setDateInfo((di) => {
                return {
                  ...di,
                  date: e.replace(/-/g, "/"),
                };
              });
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
            initialDate={`${dateInfo.time}`}
            onDone={(e: string) => {
              setDateInfo((di) => {
                return {
                  ...di,
                  time: e.split("-")[0],
                };
              });

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

  const publishSelections = React.useCallback(() => {
    if (groups && environments && entry && contentTypeUid) {
      const g = groups.filter((g: GroupConfiguration) => g.checked);
      const e = environments.filter((e: IEnvironmentConfig) => e.checked);
      const userSelectedScheduleDate = convertToLocaleDate(
        dateInfo.date,
        dateInfo.time
      );

      const errors: any[] = [];

      for (let i = 0; i < g.length; i++) {
        const group: GroupConfiguration = groups[i];
        const countries = group.countries.filter((c: CountryData) => c.checked);
        for (let j = 0; j < countries.length; j++) {
          const country: CountryData = countries[j];
          let scheduledAtString = "";
          if (!now) {
            const period: PeriodTime = dateInfo.summerTime
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
              "Selected (ISO)",
              userSelectedScheduleDate.toISOString(),
              "Actual (ISO):",
              scheduledAt.toISOString()
            );

            scheduledAtString = scheduledAt.toISOString();
          }

          publishEntry(
            entry.uid,
            contentTypeUid,
            entry._version,
            entry.locale,
            [country.locale],
            [...e.map((e: IEnvironmentConfig) => e.uid)],
            scheduledAtString,
            withReferences,
            false,
            false
          )
            .then((response) => {
              debug("Response", response);
            })
            .catch((error) => {
              errors.push(error);
            })
            .finally(() => {
              setPublishing(false);
            });
        }
      }

      if (errors.length > 0) {
        showError("Errors while scheduling entries for publishing");
        console.log("Errors", errors);
      } else {
        showSuccess("Entries successfully scheduled for publishing");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    groups,
    environments,
    entry,
    contentTypeUid,
    dateInfo.date,
    dateInfo.time,
    dateInfo.summerTime,
    now,
    publishEntry,
    withReferences,
  ]);

  return publishing ? (
    <DefaultLoading title="Publishing..." />
  ) : (
    <div className="flex flex-col h-full justify-between">
      <Accordion title={`Country Groups`} renderExpanded>
        <CountryGroups summerTime={dateInfo.summerTime} />
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
              checked={dateInfo.summerTime}
              label="Use Summer Time"
              onClick={() => {
                setDateInfo((di) => {
                  return {
                    ...di,
                    summerTime: !di.summerTime,
                  };
                });
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
                value={dateInfo.date}
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
                value={dateInfo.time}
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

      {!now && (
        <Accordion title="Schedule Details">
          {groups
            ?.filter((g: GroupConfiguration) => g.checked)
            .map((group, idx) => {
              const userSelectedScheduleDate = convertToLocaleDate(
                dateInfo.date,
                dateInfo.time
              );
              return (
                <Accordion title={group.name} key={`group_${idx}`}>
                  <div>
                    {group.countries
                      .filter((c) => c.checked)
                      .map((country) => {
                        const period: PeriodTime = dateInfo.summerTime
                          ? country.summerTime
                          : country.winterTime;

                        const scheduledAt = new Date(userSelectedScheduleDate);

                        if (period.dif === "-") {
                          scheduledAt.setTime(
                            scheduledAt.getTime() -
                              period.hours * 60 * 60 * 1000
                          );
                        } else {
                          scheduledAt.setTime(
                            scheduledAt.getTime() +
                              period.hours * 60 * 60 * 1000
                          );
                        }

                        let scheduledAtString = scheduledAt.toISOString();
                        return (
                          <div
                            className="p-2"
                            key={`country_${country.locale}`}
                          >
                            <Tooltip
                              content={
                                <>
                                  <strong>UTC: &nbsp;</strong>

                                  {DateTime.fromISO(scheduledAtString, {
                                    zone: zone,
                                  })
                                    .toJSDate()
                                    .toUTCString()}
                                </>
                              }
                              showArrow={true}
                              position="right"
                              variantType="dark"
                              type="secondary"
                            >
                              <>
                                <strong>{country.name}</strong>:{" "}
                                {DateTime.fromISO(scheduledAtString, {
                                  zone: zone,
                                }).toFormat(fmt)}
                              </>
                            </Tooltip>
                          </div>
                        );
                      })}
                  </div>
                </Accordion>
              );
            })}
        </Accordion>
      )}

      <div className="grid grid-cols-2 gap-2">
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
                      <strong>
                        {dateInfo.date} {dateInfo.time}
                      </strong>
                    </p>
                  </div>
                }
                icon={<Icon icon="InfoCircleWhite" />}
              />
            </div>
          </>
        )}
      </div>
      <div className="pb-4">
        <Button
          buttonType="primary"
          isFullWidth
          disabled={
            publishing ||
            !groups ||
            !environments ||
            groups.filter((g: GroupConfiguration) => g.checked).length === 0 ||
            environments.filter((e: IEnvironmentConfig) => e.checked).length ===
              0
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
    </div>
  );
};

export default Selections;
