"use client";

import { Checkbox, ToggleSwitch } from "@contentstack/venus-components";

import DefaultLoading from "../DefaultLoading";
import { IEnvironmentConfig } from "./models/models";
import React from "react";
import { useCsOAuthApi } from "./ContentstackOAuthApi";
import useUserSelections from "@/app/hooks/useUserSelections";

interface EnvironmentsProps {}
function Environments({}: EnvironmentsProps) {
  const [loading, setLoading] = React.useState<boolean>(false);
  const { isReady, getEnvironments } = useCsOAuthApi();
  const [environments, setEnvironments] = React.useState<IEnvironmentConfig[]>(
    []
  );
  const {
    environments: selections,
    setSelections,
    loaded,
  } = useUserSelections();

  React.useEffect(() => {
    console.log("Environments: ", { isReady, loaded });
    if (!isReady || !loaded) return;

    if (selections && selections.length > 0) {
      console.log(
        "Setting Environments from Selections",
        selections.map((s) => `${s.name} :: ${s.checked || false}`)
      );
      setEnvironments(selections);
    } else if (environments.length === 0) {
      setLoading(true);
      getEnvironments()
        .then((response) => {
          setEnvironments(response.data.environments);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error getting environments");
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, selections, loaded]);

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
                          const checked = prevEnv[index].checked || false;
                          const newEnvironments = [...prevEnv];
                          newEnvironments[index].checked = !checked;
                          setSelections({ environments: newEnvironments })
                            .then(() => {
                              setLoading(false);
                            })
                            .catch((error) => {
                              console.error("Error setting environments");
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
                const checked = environments?.every(
                  (l: any) => l.checked || false
                );
                setEnvironments((prevEnv) => {
                  const newEnvironments = [...prevEnv];
                  newEnvironments.forEach((e) => (e.checked = !checked));
                  setSelections({ environments: newEnvironments })
                    .then(() => {
                      setLoading(false);
                    })
                    .catch((error) => {
                      console.error("Error setting environments");
                    });
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
