"use client";

import { Button, Line, cbModal } from "@contentstack/venus-components";

import ActionsModal from "./modals/ActionsModal";
import React from "react";
import { useEntryChange } from "@/app/hooks/useEntryChange";
import useUserSelections from "@/app/hooks/useUserSelections";

interface ActionsProps {
  loading: boolean;
  branch: string;
}

const Actions = ({ loading, branch }: ActionsProps) => {
  const { groups } = useUserSelections();
  const { entry, contentTypeUid } = useEntryChange();

  return (
    <div>
      <div className="">
        <div className="">
          <Button
            isFullWidth
            buttonType="secondary"
            disabled={groups?.every((l: any) => !l.checked)}
            icon={"Publish"}
            onClick={() => {
              cbModal({
                component: (props: any) => (
                  <ActionsModal
                    entryUid={entry.uid}
                    contentTypeUid={contentTypeUid}
                    entryTitle={entry.title}
                    loading={loading}
                    branch={branch}
                    {...props}
                  />
                ),
                modalProps: {
                  size: "customSize",
                },
              });
            }}
          >
            Publish
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Actions;
