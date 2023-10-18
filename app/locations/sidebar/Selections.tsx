import {
  Accordion,
  Button,
  DatePicker,
  FieldLabel,
  Icon,
  Radio,
  TextInput,
  TimePicker,
  Tooltip,
  cbModal,
} from "@contentstack/venus-components";

import Locales from "@/app/components/sidebar/Locales";
import React from "react";

interface SelectionsProps {
  closeModal: () => void;
}

const actions = [
  {
    component: (
      <Tooltip content="See all references" position="top" showArrow={false}>
        <Icon icon="Reference" size="tiny" />
      </Tooltip>
    ),
    onClick: () => {
      alert("Delete triggered");
    },
    actionClassName: "ActionListItem--warning",
  },
];

const Selections = ({ closeModal }: SelectionsProps) => {
  const [now, setNow] = React.useState<boolean>(true);
  const [date, setDate] = React.useState<string>("");
  const [time, setTime] = React.useState<string>("");

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
  return (
    <div className="flex flex-col h-full justify-between">
      <Accordion title={`Country Groups`} renderExpanded actions={actions}>
        {" "}
        <Locales />
        <div className="flex flex-row pl-2 gap-2">
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

      <div className="p-4 grid grid-cols-3 items-end gap-2">
        <Button
          buttonType="primary"
          disabled={false}
          isLoading={false}
          loadingColor="#6c5ce7"
          onClick={() => {
            console.log(new Date(`${date} ${time}`));
          }}
        >
          Publish
        </Button>
        <Button
          buttonType="secondary"
          disabled={false}
          isLoading={false}
          loadingColor="#6c5ce7"
          onClick={() => {
            closeModal();
          }}
        >
          Cancel
        </Button>
        <Button
          buttonType="secondary"
          disabled={false}
          isLoading={false}
          loadingColor="#6c5ce7"
          onClick={() => {
            closeModal();
          }}
        >
          Choose References
        </Button>
      </div>
    </div>
  );
};

export default Selections;
