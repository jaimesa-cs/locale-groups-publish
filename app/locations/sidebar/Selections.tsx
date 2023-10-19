import {
  Accordion,
  Button,
  Checkbox,
  DatePicker,
  FieldLabel,
  Radio,
  TextInput,
  TimePicker,
  cbModal,
} from "@contentstack/venus-components";
import {
  CountryData,
  GroupConfiguration,
  PeriodTime,
} from "@/app/configuration/configuration";
import {
  IEnvironmentConfig,
  SELECTIONS_STORAGE_KEY,
} from "@/app/components/sidebar/models/models";

import ContentstackAppSDK from "@contentstack/app-sdk";
import CountryGroups from "@/app/components/sidebar/Locales";
import DefaultLoading from "@/app/components/DefaultLoading";
import Environments from "@/app/components/sidebar/Environments";
import React from "react";
import { set } from "lodash";
import { showSuccess } from "@/app/utils/notifications";
import { useCsOAuthApi } from "@/app/components/sidebar/ContentstackOAuthApi";
import { useEntryChange } from "@/app/hooks/useEntryChange";

interface SelectionsProps {
  closeModal: () => void;
}

const Selections = ({ closeModal }: SelectionsProps) => {
  const [publishing, setPublishing] = React.useState<boolean>(false); //TODO: use this to show a loading indicator

  const [now, setNow] = React.useState<boolean>(true);
  const [withReferences, setWithReferences] = React.useState<boolean>(false);
  const [date, setDate] = React.useState<string>("");
  const [time, setTime] = React.useState<string>("");
  const { publishEntry } = useCsOAuthApi();
  const { entry, contentTypeUid } = useEntryChange();

  React.useEffect(() => {
    const offset = new Date().getTimezoneOffset();
    //in minutes and negative for positive
    const hours = Math.abs(offset / 60);
    setTime(
      `00:00:00${offset <= 0 ? "+" : "-"}${hours < 10 ? `0${hours}` : hours}00`
    );
    setDate(new Date().toISOString().split("T")[0]);
  }, []);

  const showDatePickerHandler = (e: any) => {
    cbModal({
      component: (props: any) => (
        <div className="grid h-full place-items-center p-10">
          <DatePicker
            initialDate={date}
            onChange={(e: any) => {
              setDate(e);
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
          <TimePicker
            initialDate=""
            onDone={(e: any) => {
              setTime(e);
            }}
            closeModal={() => {
              props.closeModal();
            }}
          ></TimePicker>
        </div>
      ),
      modalProps: {
        size: "customSize",
      },
    });
  };
  return publishing ? (
    <>
      <DefaultLoading title="Publishing" />
    </>
  ) : (
    <div className="flex flex-col h-full justify-between">
      <Accordion title={`Country Groups`} renderExpanded>
        <CountryGroups />
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
        </div>
        {!now && (
          <div className="flex flex-row pl-2 gap-2">
            <FieldLabel htmlFor="date">Date:</FieldLabel>
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
            <FieldLabel htmlFor="time">Time:</FieldLabel>
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
        )}
      </Accordion>
      <div className="p-4 grid grid-cols-1 items-end gap-2 mx-[40%]">
        <Button
          buttonType="primary"
          disabled={false}
          isLoading={false}
          loadingColor="#6c5ce7"
          onClick={() => {
            setPublishing(true);
            const isSummerTime = true; //TODO: figure out what determines if it is summer time

            console.log(new Date(`${date} ${time}`).toISOString());
            //"scheduled_at":"2016-10-07T12:34:36.000Z"
            console.log("Entry", entry);

            ContentstackAppSDK.init().then((appSdk) => {
              appSdk.store.get(SELECTIONS_STORAGE_KEY).then((selections) => {
                if (selections) {
                  // if (process.env.NEXT_PUBLIC_NEXTJS_LOGS === "true") {
                  //   console.log("Value retrieved successfully: ", key, v);
                  // }
                  console.log("Groups", selections.groups);
                  const groups = selections.groups.filter(
                    (g: GroupConfiguration) => g.checked
                  );
                  const environments = selections.environments.filter(
                    (e: IEnvironmentConfig) => e.checked
                  );

                  for (let i = 0; i < groups.length; i++) {
                    const group: GroupConfiguration = groups[i];
                    const countries = group.countries.filter(
                      (c: CountryData) => c.checked
                    );
                    for (let j = 0; j < countries.length; j++) {
                      const country: CountryData = countries[j];
                      console.log("Country", country);
                      const userSelectedScheduleDate = new Date(
                        `${date} ${time}`
                      );
                      const period: PeriodTime = isSummerTime
                        ? country.summerTime
                        : country.winterTime;

                      console.log(
                        "Period",
                        period,
                        userSelectedScheduleDate.getHours() + period.hours
                      );
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

                      console.log(
                        "Scheduled At: ",
                        userSelectedScheduleDate.toISOString(),
                        "Actual:",
                        scheduledAt.toISOString()
                      );
                      publishEntry(
                        entry.uid,
                        contentTypeUid,
                        entry._version,
                        entry.locale,
                        [country.locale],
                        [...environments.map((e: IEnvironmentConfig) => e.uid)],
                        scheduledAt.toISOString(),
                        withReferences,
                        false,
                        false
                      )
                        .then((response) => {
                          console.log("Response", response);
                        })
                        .catch((error) => {
                          console.error("Error", error);
                        });
                    }
                  }
                  setPublishing(false);
                  showSuccess("Entries successfully scheduled for publishing");
                }
              });
            });
          }}
        >
          Publish
        </Button>
      </div>
    </div>
  );
};

export default Selections;
