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

import DefaultLoading from "../DefaultLoading";
import React from "react";
import { sum } from "lodash";
import { useAppConfig } from "@/app/hooks/useAppConfig";
import useAppStorage from "@/app/hooks/useAppStorage";
import { useCsOAuthApi } from "./ContentstackOAuthApi";
import useSpanishDate from "@/app/hooks/useSpanishDate";
import useUserSelections from "@/app/hooks/useUserSelections";

interface CountryGroupsProps {
  summerTime: boolean;
}

function CountryGroups({ summerTime }: CountryGroupsProps) {
  const appConfig = useAppConfig();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [, setLoadingTitle] = React.useState<string>("");
  const { getLocales, isReady } = useCsOAuthApi();
  const [locales, setLocales] = React.useState<ILocaleConfig[]>([]);
  const [groups, setGroups] = React.useState<GroupConfiguration[]>([]);

  const {
    groups: selections,
    setSelections,
    loaded: valueRead,
  } = useUserSelections();

  React.useEffect(() => {
    if (!isReady) return;
    setLoading(true);
    getLocales()
      .then((response) => {
        setLocales(response.data.locales);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error getting locales");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  React.useEffect(() => {
    if (!valueRead) return;

    if (selections) {
      setGroups(selections);
    } else if (appConfig) {
      setGroups(appConfig.appConfiguration.groups);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appConfig, selections, valueRead]);

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

  const getPeriodLabel = React.useCallback(
    (country: CountryData) => {
      return summerTime
        ? `${country.name} (${country.summerTime.dif}${country.summerTime.hours})`
        : `${country.name} (${country.winterTime.dif}${country.winterTime.hours})`;
    },
    [summerTime]
  );

  React.useEffect(() => {
    console.log("CountryGroups: ST", summerTime);
  }, [summerTime]);
  return loading ? (
    <DefaultLoading />
  ) : (
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
                            const label = getPeriodLabel(country);
                            return (
                              <Checkbox
                                key={`country_${idx}`}
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
export default CountryGroups;
