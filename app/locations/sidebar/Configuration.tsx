"use client";

import {
  Button,
  ModalFooter,
  ModalHeader,
  cbModal,
} from "@contentstack/venus-components";

import { CsModalProps } from "@/app/components/sidebar/models/models";
import { MarketplaceAppProvider } from "@/app/common/providers/MarketplaceAppProvider";
import React from "react";
import Selections from "./Selections";

export interface ConfigurationProps {}
const Configuration = ({}: ConfigurationProps) => {
  return (
    <div className="">
      <Button
        isFullWidth
        buttonType="secondary"
        icon={"Publish"}
        onClick={() => {
          cbModal({
            component: (props: any) => <ConfigurationModal {...props} />,
            modalProps: {
              size: "customSize",
            },
          });
        }}
      >
        Group Publishing
      </Button>
    </div>
  );
};

interface ConfigurationModalProps extends CsModalProps {}

export const ConfigurationModal = ({ closeModal }: ConfigurationModalProps) => {
  return (
    <MarketplaceAppProvider>
      <div className="h-[46vh]">
        <ModalHeader
          title={`Publishing by Country Groups`}
          closeModal={closeModal}
        />
        <div className="h-[40vh] p-4 overflow-y-scroll">
          <Selections closeModal={closeModal} />
        </div>
      </div>
    </MarketplaceAppProvider>
  );
};
export default Configuration;
