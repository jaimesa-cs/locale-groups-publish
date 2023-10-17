"use client";

import {
  Accordion,
  Checkbox,
  Icon,
  Line,
  Select,
  Tooltip,
} from "@contentstack/venus-components";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ILocaleConfig,
  ReferenceDetailLite,
  ReferenceLocaleData,
} from "@/app/components/sidebar/models/models";
import MarketplaceAppContextType, {
  MarketplaceAppContext,
} from "@/app/common/contexts/marketplaceContext";
import React, { useContext } from "react";
import {
  calculateProgress,
  genericFlatten,
  getUniqueReferenceKeys,
} from "@/app/utils";

import Configuration from "./Configuration";
import DefaultLoading from "@/app/components/DefaultLoading";
import { ReleaseOptions } from "./ReleaseOptions";
import { useCsOAuthApi } from "@/app/components/sidebar/ContentstackOAuthApi";
import useUserSelections from "@/app/hooks/useUserSelections";

// import { theData } from "@/app/utils/data";

interface ReferencesProps {
  contentTypeUid: string;
  entryUid: string;
}

const References = ({ contentTypeUid, entryUid }: ReferencesProps) => {
  const { getReferencesByLocale, isReady } = useCsOAuthApi();
  const [progress, setProgress] = React.useState(0);
  const [loading, setLoading] = React.useState<boolean>(false);
  // const [value, updateValue] = React.useState<any>(null);
  const [depthValue, updateDepthValue] = React.useState<any>({
    label: "5",
    value: 5,
  });

  const {
    data,
    setData,
    locales,
    checkedLocales,
    checkedReferences,
    openReferences,
    totalReferenceCount,
    setCheckedReferences,
    setOpenReferences,
  } = useContext(MarketplaceAppContext) as MarketplaceAppContextType;

  const searchReference = React.useCallback(
    (
      reference: ReferenceDetailLite,
      uniqueKey: string
    ): ReferenceDetailLite | null => {
      if (reference.uniqueKey == uniqueKey) {
        return reference;
      } else if (
        reference.references !== null &&
        reference.references.length > 0
      ) {
        var i;
        var result = null;
        for (i = 0; result == null && i < reference.references.length; i++) {
          result = searchReference(reference.references[i], uniqueKey);
        }
        return result;
      }
      return null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const getDepthOptions = React.useCallback(() => {
    return Array.from(Array(5).keys()).map((i) => {
      return {
        label: (i + 1).toString(),
        value: i + 1,
      };
    });
  }, []);

  // Load locales options
  // React.useEffect(() => {
  //   const options = locales
  //     ?.filter((l) => l.checked)
  //     .map((l) => {
  //       return {
  //         label: l.name,
  //         value: l.code,
  //       };
  //     });
  //   updateValue(options);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  //Load references
  React.useEffect(() => {
    console.log("Loading references", locales);
    if (!isReady || !entryUid || !contentTypeUid || locales?.length === 0) {
      setLoading(false);
      return;
    }

    const loc = locales?.filter((l) => l.checked).map((ll) => ll.code);
    if (loc && loc.length > 0) {
      setLoading(true);
      setProgress(0);
      setData([]);
      for (let i = 0; i < loc.length; i++) {
        const l = loc[i];
        getReferencesByLocale(contentTypeUid, entryUid, l, depthValue.value)
          .then((response: any) => {
            setData((prev) => {
              setProgress((p) => {
                return calculateProgress(p, loc.length);
              });
              return [...prev.filter((p) => p.locale !== l), response.data];
            });
          })
          .catch((e: any) => {
            console.log("Error while getting references");
            console.log(e);
            setLoading(false);
          });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryUid, contentTypeUid, locales, depthValue, /*value,*/ isReady]);

  // Update loading state
  React.useEffect(() => {
    if (
      loading &&
      data.length > 0 &&
      data.length === locales?.filter((l) => l.checked)?.length
    ) {
      console.log("Loading complete");
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.length]);

  interface ReferenceDetailComponentProps {
    reference: ReferenceDetailLite;
    locale: string;
    isChild?: boolean;
  }

  const ReferenceDetailComponent = ({
    reference,
    locale,
    isChild = false,
  }: ReferenceDetailComponentProps) => {
    return (
      <div className="flex flex-row ">
        <div
          className={`flex flex-row gap-1 -mb-4 ${isChild ? "-mt-2" : "-mt-4"}`}
        >
          <div className="py-4 px-1 ">
            <Icon icon="Reference" size="small" />
          </div>
          <div className="py-4">
            <Checkbox
              key={`check_${reference.uniqueKey}`}
              checked={checkedReferences[locale][reference.uniqueKey]}
              onClick={() => {
                setCheckedReferences((prev) => {
                  const r = searchReference(
                    data.find((d) => d.locale === locale)?.topLevelEntry!,
                    reference.uniqueKey
                  );
                  if (r !== null) {
                    const flat = genericFlatten("uniqueKey", "references", r);
                    const newCheckedReferences = { ...prev };
                    const checked =
                      !newCheckedReferences[locale][reference.uniqueKey];
                    flat.forEach((f) => {
                      newCheckedReferences[locale][f] = checked;
                    });

                    return newCheckedReferences;
                  }
                  return prev;
                });
              }}
              label={""}
            />
          </div>
          <div className="py-4">
            <Collapsible
              className="top-0"
              open={openReferences[locale][reference.uniqueKey]}
              onOpenChange={() => {
                if (reference.references.length > 0) {
                  setOpenReferences((prev) => {
                    const newOpenReferences = { ...prev };
                    newOpenReferences[locale][reference.uniqueKey] =
                      !newOpenReferences[locale][reference.uniqueKey];
                    return newOpenReferences;
                  });
                } else {
                  setCheckedReferences((prev) => {
                    const newCheckedReferences = { ...prev };
                    newCheckedReferences[locale][reference.uniqueKey] =
                      !newCheckedReferences[locale][reference.uniqueKey];
                    return newCheckedReferences;
                  });
                }
              }}
            >
              <CollapsibleTrigger>
                <Tooltip
                  content={`Reference UID: ${reference.uid}`}
                  position="right"
                  type="primary"
                  variantType="light"
                >
                  <span
                    className={`${
                      reference.references.length > 0
                        ? "font-semibold hover:text-[#6C5CE7]"
                        : ""
                    }`}
                  >
                    {reference.title}
                    {" - "}
                    <span className=" font-normal italic">
                      {reference.content_type_uid}
                    </span>
                  </span>
                </Tooltip>
              </CollapsibleTrigger>
              <CollapsibleContent>
                {reference.references.map((r) => {
                  return (
                    <ReferenceDetailComponent
                      key={r.uniqueKey}
                      reference={r}
                      locale={locale}
                      isChild
                    />
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </div>
    );
  };

  return loading ? (
    <div className="p-5">
      <DefaultLoading
        progress={progress}
        title="Retrieving references..."
        showProgressBar
      />
    </div>
  ) : (
    <div className="">
      {data && data.length > 0 && (
        <div className="grid grid-cols-5">
          <div className="p-4 pr-24 m-1 col-span-2">
            <div className="pb-2">
              <h3 className="text-l pb-2">Depth</h3>
              <Select
                className="pl-2 -ml-2"
                selectLabel=""
                options={getDepthOptions() || []}
                value={depthValue}
                onChange={updateDepthValue}
                placeholder="Select Depth"
                multiDisplayLimit={2}
                version="v2"
              ></Select>
            </div>
            <div className="pb-2">
              <h3 className="text-l pt-4 pb-2">Languages</h3>
              <Configuration />
            </div>
            {/* <Select
              className="pl-2 pb-2 -ml-2"
              selectLabel="Languages"
              options={
                locales?.map((l) => {
                  return {
                    label: l.name,
                    value: l.code,
                  };
                }) || []
              }
              value={value}
              onChange={(v: any) => {
                setCheckedLocales((prev) => {
                  const newCheckedLocales = { ...prev };
                  v.map((vv: any) => {
                    newCheckedLocales[vv.value] = true;
                  });
                  return newCheckedLocales;
                });
                setLocales(v.map((vv: any) => vv.value));

                setCheckedReferences((prev) => {
                  const ll = v.map((vv: any) => vv.value);
                  const newCheckedReferences = { ...prev };
                  Object.keys(newCheckedReferences).forEach((key) => {
                    const checked = ll.includes(key);
                    Object.keys(newCheckedReferences[key]).forEach((k) => {
                      newCheckedReferences[key][k] = checked;
                    });
                  });
                  return newCheckedReferences;
                });
                updateValue(v);
              }}
              placeholder="Select Languages"
              isSearchable={true}
              isClearable={true}
              multiDisplayLimit={1}
              isMulti={true}
              version="v2"
            /> */}
            <Line type="dashed" className="pb-2" />
            <ReleaseOptions
              data={data}
              checkedReferences={checkedReferences}
              totalReferenceCount={totalReferenceCount}
              setLoading={setLoading}
            />
          </div>
          <div className="p-2 m-1  col-span-3">
            <div className="max-h-[38rem] overflow-y-scroll pl-6 px-4 mb-4 pb-4">
              {totalReferenceCount > 0 ? (
                <div className="">
                  <h3 className="text-l pt-2">
                    References (
                    {totalReferenceCount > 0 ? totalReferenceCount : ""})
                  </h3>
                </div>
              ) : (
                <h3 className="text-l pb-2">No references selected</h3>
              )}
              {data
                .filter((ld) => checkedLocales[ld.locale])
                .map((localeData) => {
                  const localeName = locales?.find(
                    (l) => l.code === localeData.locale
                  )?.name;

                  const list = getUniqueReferenceKeys(
                    localeData.topLevelEntry.references,
                    [],
                    checkedReferences[localeData.locale]
                  );

                  return (
                    <div
                      className="-mb-3 pl-2"
                      key={`${localeData.locale}_content`}
                    >
                      <Accordion title={`${localeName} (${list.length + 1})`}>
                        <ReferenceDetailComponent
                          reference={localeData.topLevelEntry}
                          locale={localeData.locale}
                        />
                      </Accordion>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default References;
