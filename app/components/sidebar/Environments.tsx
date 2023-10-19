"use client";

import { Checkbox, Field, ToggleSwitch } from "@contentstack/venus-components";
import {
  IEnvironmentConfig,
  SELECTIONS_STORAGE_KEY,
  UserSelections,
} from "./models/models";

import DefaultLoading from "../DefaultLoading";
import React from "react";
import useAppStorage from "@/app/hooks/useAppStorage";
import { useCsOAuthApi } from "./ContentstackOAuthApi";

interface EnvironmentsProps {}
function Environments({}: EnvironmentsProps) {
  const [loading, setLoading] = React.useState<boolean>(false);
  const { isReady, getEnvironments } = useCsOAuthApi();
  const [environments, setEnvironments] = React.useState<IEnvironmentConfig[]>(
    []
  );
  const { value: selections, store: setSelections } =
    useAppStorage<UserSelections>(SELECTIONS_STORAGE_KEY);

  React.useEffect(() => {
    if (!isReady) return;
    setLoading(true);
    getEnvironments()
      .then((response) => {
        const configuredEnvironments = response.data.environments.map(
          (env: IEnvironmentConfig) => {
            return {
              ...env,
              checked:
                selections?.environments?.find(
                  (e: IEnvironmentConfig) => e.name === env.name && e.checked
                ) || false,
            };
          }
        );
        setEnvironments(configuredEnvironments);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error getting environments");
        setLoading(false);
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);
  return loading ? (
    <DefaultLoading />
  ) : (
    <div key="environments" className="">
      <div className="flex flex-col">
        <div key="environment_all" className="pt-2">
          <div className="grid grid-cols-3 pl-2">
            {environments &&
              environments.length > 0 &&
              environments.map((env: IEnvironmentConfig, index: number) => {
                return (
                  <div key={env.name} className="pl-2 pb-2">
                    <Checkbox
                      onClick={() => {
                        setEnvironments((prevEnv) => {
                          const newEnvironments = [...prevEnv];
                          newEnvironments[index].checked =
                            !newEnvironments[index].checked;
                          setSelections({
                            environments: newEnvironments,
                          });
                          return newEnvironments;
                        });
                      }}
                      label={env.name}
                      checked={env.checked || false}
                      disabled={loading}
                      isButton={false}
                      isLabelFullWidth={false}
                    />
                  </div>
                );
              })}
          </div>
        </div>
        <div className="flex flex-row pt-2">
          <div className="pl-2 pb-2">
            <ToggleSwitch
              onClick={() => {
                const checked = environments?.every((l: any) => l.checked);
                setEnvironments((prevEnv) => {
                  const newEnvironments = [...prevEnv];
                  newEnvironments.forEach((e) => (e.checked = !checked));
                  setSelections({ environments: newEnvironments });
                  return newEnvironments;
                });
              }}
              label={"Select All"}
              checked={environments?.every((l: any) => l.checked)}
              disabled={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Environments;
