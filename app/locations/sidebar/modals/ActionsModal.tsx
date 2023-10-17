"use client";

import {
  Button,
  ButtonGroup,
  ModalHeader,
} from "@contentstack/venus-components";

import { CsModalProps } from "@/app/components/sidebar/models/models";
import { MarketplaceAppProvider } from "@/app/common/providers/MarketplaceAppProvider";
import React from "react";
import References from "../References";

interface ActionsModalProps extends CsModalProps {
  entryUid: string;
  contentTypeUid: string;
}
const ActionsModal = ({
  contentTypeUid,
  entryUid,
  closeModal,
}: ActionsModalProps) => {
  return (
    <MarketplaceAppProvider>
      <div>
        <div className="w-[50vw]">
          <div className="flex-row">
            <ModalHeader title={`Release Management`} closeModal={closeModal} />
          </div>
          <div className="h-[49vh] overflow-y-scroll">
            <References contentTypeUid={contentTypeUid} entryUid={entryUid} />
          </div>
        </div>
      </div>
    </MarketplaceAppProvider>
  );
};
export default ActionsModal;
