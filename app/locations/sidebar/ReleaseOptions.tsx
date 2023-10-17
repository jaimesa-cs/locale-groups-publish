import {
  Button,
  Field,
  Icon,
  Info,
  Line,
  Radio,
  Select,
  TextInput,
  Tooltip,
} from "@contentstack/venus-components";
import {
  MAX_ENTRIES_PER_RELEASE,
  useCsOAuthApi,
} from "@/app/components/sidebar/ContentstackOAuthApi";
import { showError, showSuccess } from "@/app/utils/notifications";

import React from "react";
import { ReferenceLocaleData } from "@/app/components/sidebar/models/models";

interface ReleaseOptionsProps {
  data: ReferenceLocaleData[];
  checkedReferences: Record<string, Record<string, boolean>>;
  totalReferenceCount: number;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ReleaseOptions = ({
  checkedReferences,
  totalReferenceCount,
  data,

  setLoading,
}: ReleaseOptionsProps) => {
  const [value, setValue] = React.useState<any>(null);
  const { getReleases, createRelease, addToRelease } = useCsOAuthApi();
  const [releases, setReleases] = React.useState([]);
  const [releaseName, setReleaseName] = React.useState("");
  const [releaseDescription, setReleaseDescription] = React.useState("");
  const [canCreateRelease, setCanCreateRelease] = React.useState(false);
  const [canAddToRelease, setCanAddToRelease] = React.useState(false);
  const [checkForNewReleases, setCheckForNewReleases] = React.useState(false);
  // const [strategy, setStrategy] = React.useState<"default" | "group-by-locale">(
  //   "default"
  // );

  const [creatingRelease, setCreatingRelease] = React.useState(false);

  //Check whether any references are checked so that we can enable the add to release button
  React.useEffect(() => {
    if (value !== null) {
      if (
        checkedReferences &&
        Object.values(checkedReferences).some((v) => {
          return (
            v &&
            Object.values(v).some((v) => {
              return v === true;
            })
          );
        })
      ) {
        setCanAddToRelease(true);
      } else {
        setCanAddToRelease(false);
      }
    } else {
      setCanAddToRelease(false);
    }
  }, [checkedReferences, value]);

  //Check whether release name and description are empty so that we can enable the create button
  React.useEffect(() => {
    if (releaseName !== undefined && releaseName !== "") {
      setCanCreateRelease(true);
    } else {
      setCanCreateRelease(false);
    }
  }, [releaseName, releaseDescription]);

  //Get Releases
  React.useEffect(() => {
    // setLoading(true);
    getReleases().then((res: any) => {
      const releases = res.data.releases.map((r: any) => {
        console.log("RELEASE: ", r);
        return {
          id: r.uid,
          label: `${r.name} ${r.locked ? ` (locked)` : ""}`,
          searchableLabel: r.name,
          value: r.uid,
          isDisabled: r.locked,
        };
      });
      setReleases(releases);
      // setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkForNewReleases]);
  return (
    <div className="">
      <div className="grid grid-cols-1">
        <div className="-ml-2">
          <Select
            menuPlacement="bottom"
            isSearchable
            noOptionsMessage={() => "No Releases Available"}
            onChange={(v: any) => {
              setValue(v);
            }}
            options={releases}
            placeholder="Select Release"
            selectLabel="Available Releases"
            value={value}
          />
        </div>
        <div className="pt-3 pb-2">
          <Button
            disabled={!canAddToRelease}
            onClick={() => {
              setLoading(true);
              addToRelease(value?.value || "", data, checkedReferences)
                .then((res: any) => {
                  showSuccess("References added to Release Successfully");
                })
                .catch((err: any) => {
                  showError("Error Adding to Release");
                })
                .finally(() => {
                  setLoading(false);
                });
            }}
            icon={"ReleasesFilled"}
            buttonType="secondary"
            isFullWidth
          >
            Add to Release
          </Button>
        </div>

        {/* 
        <h3 className="text-l pt-4 pb-2">Release Strategies</h3>
        <div className="felx">
          <div className="flex-row">
            <div className="">
              <Radio
                id="default"
                checked={strategy === "default"}
                label="Default"
              />{" "}
              <Tooltip
                content={
                  <>
                    Your currently selected release will be renamed, and
                    additional releases will be created to accommodate the total
                    number of entries. A suffix will be added to show the number
                    of releases, (e.g. Home Release 1 of 3)
                  </>
                }
                position="bottom"
                showArrow={false}
                variantType="light"
                trigger="click"
              >
                <Icon icon="InformationSmall" />
              </Tooltip>
            </div>
          </div>
          <div className="flex-row">
            <div className="">
              <Radio
                disabled
                id="group-by-locale"
                checked={strategy === "group-by-locale"}
                label="Group by Locale"
              />{" "}
              <Tooltip
                disabled
                content={
                  <>
                    Using the top level entry title, a release will be created
                    per each locale. (e.g. Home Release (en-us)) Additionally if
                    the locale exceeds the maximum number of entries allowed,
                    the default strategy will be used per locale.
                  </>
                }
                position="bottom"
                showArrow={false}
                variantType="light"
                trigger="click"
              >
                <Icon icon="InformationSmall" />
              </Tooltip>
            </div>
          </div>
        </div> */}
        {totalReferenceCount > MAX_ENTRIES_PER_RELEASE && (
          <div className="pt-3">
            <Info
              content={
                <>
                  Your are exceeding the maximum items per release limit of{" "}
                  <strong>{MAX_ENTRIES_PER_RELEASE}</strong>. Select an strategy
                  to group your entries accoriding to your needs.
                </>
              }
              icon={<Icon icon="InfoCircleWhite" />}
              type="light"
            />
          </div>
        )}
      </div>

      <Line type="dashed" className="" />
      <h3 className="text-l pt-4 pb-2">Create New Release</h3>
      <div className="grid -ml-2">
        <Field labelText="Name">
          <TextInput
            disabled={creatingRelease}
            onChange={(e: any) => {
              setReleaseName(e.target.value);
            }}
            placeholder={"Release name..."}
          />
        </Field>
        <Field labelText="Description">
          <TextInput
            disabled={creatingRelease}
            onChange={(e: any) => {
              setReleaseDescription(e.target.value);
            }}
            placeholder={"Release description..."}
          />
        </Field>
      </div>
      <div className="">
        <Button
          isFullWidth
          isLoading={creatingRelease}
          onClick={() => {
            setCreatingRelease(true);
            createRelease(releaseName, releaseDescription || "")
              .then((res: any) => {
                showSuccess("Release Created Successfully");
                setCheckForNewReleases(!checkForNewReleases);
              })
              .catch((err: any) => {
                showError(
                  `Error Creating Release. Status: ${err.response.status}`
                );
                console.log("Error Creating Release: ");
              })
              .finally(() => {
                setCreatingRelease(false);
              });
          }}
          buttonType="secondary"
          disabled={!canCreateRelease || creatingRelease}
        >
          Create Release
        </Button>
      </div>
    </div>
  );
};
