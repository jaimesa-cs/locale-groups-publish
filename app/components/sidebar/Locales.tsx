"use client";

import {
  Accordion,
  Checkbox,
  ToggleSwitch,
} from "@contentstack/venus-components";
import {
  CountryData,
  GroupConfiguration,
} from "@/app/configuration/configuration";
import {
  ILocaleConfig,
  SELECTIONS_STORAGE_KEY,
  UserSelections,
} from "./models/models";

import React from "react";
import { useAppConfig } from "@/app/hooks/useAppConfig";
import useAppStorage from "@/app/hooks/useAppStorage";
import { useCsOAuthApi } from "./ContentstackOAuthApi";

interface LocalesProps {}

function Locales({}: LocalesProps) {
  const appConfig = useAppConfig();

  const [loadingTitle, setLoadingTitle] = React.useState<string>("");
  const { getLocales, isReady } = useCsOAuthApi();
  const [locales, setLocales] = React.useState<ILocaleConfig[]>([]);
  const [groups, setGroups] = React.useState<GroupConfiguration[]>([]);

  const { value: selections, set: setSelections } =
    useAppStorage<UserSelections>(SELECTIONS_STORAGE_KEY);

  React.useEffect(() => {
    if (!isReady) return;
    getLocales()
      .then((response) => {
        setLocales(response.data.locales);
      })
      .catch((error) => {
        console.error("Error getting locales");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  React.useEffect(() => {
    if (appConfig) {
      setGroups(appConfig.appConfiguration.groups);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appConfig]);

  const areAllGroupsChecked = React.useCallback(() => {
    let checked = true;
    groups.forEach((group) => {
      if (!group.checked) {
        checked = false;
        return;
      }
      group.countries.forEach((country) => {
        if (country.enabled && !country.checked) {
          checked = false;
          return;
        }
      });
    });

    return checked;
  }, [groups]);
  return (
    <div key="locales" className="">
      <div className="flex flex-col">
        <div key="locale_all" className="pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 pl-2">
            {groups &&
              groups.length > 0 &&
              groups.map((group: GroupConfiguration, index: number) => {
                return (
                  <div key={`group_${index}`} className="pl-2 pb-2">
                    <Checkbox
                      onClick={() => {
                        setGroups((prevGroups) => {
                          const newGroups = [...prevGroups];
                          newGroups[index].checked = !newGroups[index].checked;
                          newGroups[index].countries.map((country) => {
                            if (
                              locales.some((l) => l.code === country.locale)
                            ) {
                              country.checked = newGroups[index].checked;
                            }
                          });
                          setSelections({
                            groups: newGroups,
                          })
                            .then(() => {
                              setLoadingTitle("");
                            })
                            .catch((error) => {
                              console.error("Error setting groups");
                            });
                          return newGroups;
                        });
                      }}
                      label={group.name}
                      checked={group.checked || false}
                      isButton={false}
                      isLabelFullWidth={false}
                    />
                    <Accordion title="Countries">
                      <div className="grid grid-cols-1 sm:grid-cols-1 pl-2">
                        {group.countries.map(
                          (country: CountryData, idx: number) => {
                            const isSummerTime = true; //TODO: figure out what determines if it is summer time
                            const label = isSummerTime
                              ? `${country.name} (${country.summerTime.dif}${country.summerTime.hours})`
                              : `${country.name} (${country.winterTime.dif}${country.winterTime.hours})`;
                            return (
                              <Checkbox
                                onClick={() => {
                                  setGroups((prevGroups) => {
                                    const newGroups = [...prevGroups];
                                    const checked =
                                      !newGroups[index].countries[idx].checked;

                                    !newGroups[index].checked;

                                    newGroups[index].countries[idx].checked =
                                      checked;
                                    newGroups[index].checked = newGroups[
                                      index
                                    ].countries.some((c) => c.checked);
                                    setSelections({
                                      groups: newGroups,
                                    })
                                      .then(() => {
                                        setLoadingTitle("");
                                      })
                                      .catch((error) => {
                                        console.error("Error setting groups");
                                      });
                                    return newGroups;
                                  });
                                }}
                                label={label}
                                checked={country.checked || false}
                                isButton={false}
                                disabled={
                                  !locales.some(
                                    (l) => l.code === country.locale
                                  )
                                }
                                isLabelFullWidth={false}
                              />
                            );
                          }
                        )}
                      </div>
                    </Accordion>
                  </div>
                );
              })}
          </div>
        </div>
        <div className="flex flex-row pt-2">
          <div className="pl-2 pb-2">
            <ToggleSwitch
              onClick={() => {
                const checked = areAllGroupsChecked();
                setGroups((prevGroups) => {
                  const newGroups = [...prevGroups];
                  const groups = newGroups.map((g: any) => {
                    g.countries.map((c: any) => {
                      if (locales.some((l) => l.code === c.locale)) {
                        c.checked = !checked;
                      }
                    });
                    return {
                      ...g,
                      checked: !checked,
                    };
                  });
                  setSelections({
                    groups,
                  }).then(() => {});
                  return newGroups.map((g: any) => {
                    g.countries.map((c: any) => {
                      if (locales.some((l) => l.code === c.locale)) {
                        c.checked = !checked;
                      }
                    });
                    return {
                      ...g,
                      checked: !checked,
                    };
                  });
                });
              }}
              label={"Select All"}
              checked={areAllGroupsChecked()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
export default Locales;
