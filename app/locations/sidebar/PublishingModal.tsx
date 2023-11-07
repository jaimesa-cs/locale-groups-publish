"use client";

import { Button, ModalHeader, cbModal } from "@contentstack/venus-components";

import { CsModalProps } from "@/app/components/sidebar/models/models";
import { MarketplaceAppProvider } from "@/app/common/providers/MarketplaceAppProvider";
import React from "react";
import Selections from "./Selections";
import SpanishDateInfo from "./SpanishDateInfo";

export interface ConfigurationProps {}
const Configuration = ({}: ConfigurationProps) => {
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

interface ConfigurationModalProps extends CsModalProps {}

export const PublishingModal = ({ closeModal }: ConfigurationModalProps) => {
  return (
    <MarketplaceAppProvider>
      <div className="h-full">
        <ModalHeader
          title={`Publishing by Country Groups`}
          closeModal={closeModal}
        />
        <div className="h-[65vh] w-[50vw] p-4 overflow-y-scroll">
          <Selections closeModal={closeModal} />
        </div>
      </div>
    </MarketplaceAppProvider>
  );
};
export default Configuration;
