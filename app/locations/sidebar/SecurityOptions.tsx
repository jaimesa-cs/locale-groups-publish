import { Accordion, Button } from "@contentstack/venus-components";

import AuthorizeButton from "@/app/components/AuthorizeButton";
import DefaultLoading from "@/app/components/DefaultLoading";
import React from "react";
import { SELECTIONS_STORAGE_KEY } from "@/app/components/sidebar/models/models";
import { showMessage } from "@/app/utils/notifications";
import useAppStorage from "@/app/hooks/useAppStorage";
import useAuth from "@/app/hooks/oauth/useAuth";

interface SecurityOptionsProps {
  renderExpanded?: boolean;
}
const SecurityOptions = ({ renderExpanded }: SecurityOptionsProps) => {
  const { deleteAuth } = useAuth({
    from: "SecurityOptions",
  });
  const { delete: deleteSelections } = useAppStorage(SELECTIONS_STORAGE_KEY);
  const [loading, setLoading] = React.useState<boolean>(false);
  return loading ? (
    <DefaultLoading />
  ) : (
    <Accordion
      title="Security & Storage"
      renderExpanded={renderExpanded}
      accordionLock={loading}
    >
      <div className="grid grid-cols-1 p-2 gap-2">
        <div>
          <AuthorizeButton />
        </div>
        <div>
          <Button
            buttonType="secondary"
            isFullWidth
            onClick={() => {
              setLoading(true);
              deleteAuth().then(() => {
                deleteSelections().then(() => {
                  showMessage("Data cleared successfully");
                  //wait 1 second before refreshing
                  setTimeout(() => {
                    window.location.reload();
                  }, 2000);
                });
              });
            }}
            icon="RefreshCircleThin"
          >
            Clear Data
          </Button>
        </div>
      </div>
    </Accordion>
  );
};

export default SecurityOptions;
