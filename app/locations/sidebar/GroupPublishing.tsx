import { Button, ToggleSwitch, cbModal } from "@contentstack/venus-components";

import PublishingModal from "./PublishingModal";
import React from "react";
import SpanishDateInfo from "./SpanishDateInfo";

export interface GroupPublishingProps {}
const GroupPublishing = ({}: GroupPublishingProps) => {
  return (
    <div className="grid grid-cols-1 p-2 gap-2">
      <div>
        <Button
          isFullWidth
          buttonType="secondary"
          icon={"Publish"}
          onClick={() => {
            cbModal({
              component: (props: any) => <PublishingModal {...props} />,
              modalProps: {
                size: "customSize",
              },
            });
          }}
        >
          Group Publishing
        </Button>
      </div>
      <div>
        <SpanishDateInfo />
      </div>
    </div>
  );
};
export default GroupPublishing;
