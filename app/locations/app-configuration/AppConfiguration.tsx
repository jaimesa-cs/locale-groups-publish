"use client";

import {
  Accordion,
  Button,
  FieldLabel,
  InstructionText,
} from "@contentstack/venus-components";
import { showError, showSuccess } from "../../utils/notifications";

import { CONFIGURATION_NAME } from "@/app/configuration/configuration";
import CodeEditor from "@uiw/react-textarea-code-editor/esm/index";
import { IAppConfiguration } from "../../components/sidebar/models/models";
import { MarketplaceAppProvider } from "@/app/common/providers/MarketplaceAppProvider";
import React from "react";
import { TypeAppSdkConfigState } from "../../types";
import { useAppSdk } from "../../hooks/useAppSdk";
import utils from "../../utils";

const isValidJson = (json: any) => {
  try {
    JSON.parse(json);
  } catch (e) {
    return false;
  }
  return true;
};

type AppConfiguration = TypeAppSdkConfigState & {
  appConfiguration?: IAppConfiguration;
};

const AppConfiguration = () => {
  const sdk = useAppSdk();
  const [state, setState] = React.useState<AppConfiguration>({
    installationData: {
      configuration: {},
      serverConfiguration: {},
    },
    setInstallationData: async (): Promise<any> => {},
    appSdkInitialized: false,
  });

  /** updateConfig - Function where you should update the state variable
   * Call this function whenever any field value is changed in the DOM
   * */
  const updateConfig = React.useCallback((): void => {
    setLoading(true);
    let updatedConfig: any = undefined;
    let updatedServerConfig: any = undefined;

    updatedConfig = state?.installationData?.configuration || {};
    updatedConfig.appConfiguration = state.appConfiguration;
    updatedServerConfig = state.installationData.serverConfiguration;
    updatedServerConfig.appConfiguration = state.appConfiguration;

    if (typeof state.setInstallationData !== "undefined") {
      const installationData = {
        ...state.installationData,
        configuration: updatedConfig,
        serverConfiguration: updatedServerConfig,
      };

      state
        .setInstallationData(installationData)
        .then(() => {
          showSuccess("Configuration saved successfully");
        })
        .catch((error: any) => {
          showError(error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  React.useEffect(() => {
    const sdkConfigData = sdk?.location.AppConfigWidget?.installation;

    if (sdkConfigData) {
      sdkConfigData
        .getInstallationData()
        .then((installationDataFromSDK: any) => {
          const setInstallationDataOfSDK = sdkConfigData.setInstallationData;

          setState(() => {
            const newState = {
              ...state,
              installationData: utils.mergeObjects(
                state.installationData,
                installationDataFromSDK
              ),
              setInstallationData: setInstallationDataOfSDK,
              appSdkInitialized: true,
              appConfiguration:
                installationDataFromSDK.configuration.appConfiguration,
            };
            setLoading(false);
            return {
              ...newState,
            };
          });
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdk]);

  const [loading, setLoading] = React.useState<boolean>(false);
  const [isValid, setIsValid] = React.useState<boolean>(true);
  return (
    <MarketplaceAppProvider>
      <div className="p-10 ">
        <Accordion title={CONFIGURATION_NAME} renderExpanded noChevron>
          <div className="app-config ">
            <div className="app-config-container h-96">
              <div className="app-component-content p-4">
                <FieldLabel
                  required
                  htmlFor="advancedPublishingConfig"
                  error={!isValid}
                >
                  {CONFIGURATION_NAME}
                </FieldLabel>

                {loading ? (
                  <>Loading...</>
                ) : (
                  <>
                    {!isValid && (
                      <InstructionText style={{ color: "red" }}>
                        Invalid JSON
                      </InstructionText>
                    )}
                    <div
                      style={{
                        border: !isValid ? "1px solid red" : "",
                      }}
                      className="overflow-auto"
                    >
                      <CodeEditor
                        key="advancedPublishingConfig"
                        value={
                          state.appSdkInitialized
                            ? JSON.stringify(state.appConfiguration, null, 2)
                            : "Loading..."
                        }
                        language="json"
                        placeholder="Please enter JSON content."
                        onChange={(e: any) => {
                          const valid = isValidJson(e.target.value);
                          setIsValid(valid);
                          if (valid) {
                            setState((s) => {
                              return {
                                ...s,
                                appConfiguration: JSON.parse(e.target.value),
                              };
                            });
                          }
                        }}
                        padding={15}
                        style={{
                          fontSize: 12,
                          width: "100%",

                          backgroundColor: "#f5f5f5",
                          fontFamily:
                            "ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
                        }}
                      />
                    </div>
                  </>
                )}
                <br />
              </div>

              <div className="flex justify-center pb-20">
                <Button
                  isLoading={loading}
                  buttonType="secondary"
                  disabled={!isValid}
                  onClick={() => {
                    updateConfig();
                  }}
                >
                  Update Configuration
                </Button>
              </div>
            </div>
          </div>
        </Accordion>
      </div>
    </MarketplaceAppProvider>
  );
};

export default AppConfiguration;
