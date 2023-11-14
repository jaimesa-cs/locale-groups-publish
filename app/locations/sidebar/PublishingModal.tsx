"use client";

import { Button, ModalHeader, cbModal } from "@contentstack/venus-components";

import { CsModalProps } from "@/app/components/sidebar/models/models";
import { MarketplaceAppProvider } from "@/app/common/providers/MarketplaceAppProvider";
import React from "react";
import Selections from "./Selections";
import SpanishDateInfo from "./SpanishDateInfo";

interface PublishingModalProps extends CsModalProps {}

export const PublishingModal = ({ closeModal }: PublishingModalProps) => {
  return (
    <MarketplaceAppProvider>
      <div className="h-full">
        <ModalHeader
          title={`Publishing by Country Groups`}
          closeModal={closeModal}
        />
        <div className="h-[75vh] w-[50vw] p-4 overflow-y-scroll">
          <Selections closeModal={closeModal} />
        </div>
      </div>
    </MarketplaceAppProvider>
  );
};
export default PublishingModal;
