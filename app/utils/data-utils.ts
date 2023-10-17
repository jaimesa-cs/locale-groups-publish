import {
  IEntryReleaseInfo,
  ReferenceDetailLite,
  ReferenceLocaleData,
} from "../components/sidebar/models/models";

export const getReleaseInfo = (
  data: ReferenceLocaleData[],
  checkedReferences: Record<string, Record<string, boolean>>
): IEntryReleaseInfo[] => {
  const releaseInfo: IEntryReleaseInfo[] = [];
  data.forEach((d) => {
    const { locale, topLevelEntry } = d;

    if (!checkedReferences[locale]) return;
    if (topLevelEntry.checked) {
      const topLevelEntryReleaseInfo: IEntryReleaseInfo = {
        uid: topLevelEntry.uid,
        version: parseInt(topLevelEntry.version.toString()),
        locale: locale,
        content_type_uid:
          topLevelEntry.content_type_uid === "asset"
            ? "built_io_upload"
            : topLevelEntry.content_type_uid,
        action: "publish",
        title: topLevelEntry.title,
      };
      releaseInfo.push(topLevelEntryReleaseInfo);
    }
    releaseInfo.push(
      ...getReleaseInfoRecursive(
        locale,
        topLevelEntry.references,
        checkedReferences
      )
    );
  });

  return releaseInfo;
};

const getReleaseInfoRecursive = (
  locale: string,
  references: ReferenceDetailLite[],
  checkedReferences: Record<string, Record<string, boolean>>
): IEntryReleaseInfo[] => {
  const info: IEntryReleaseInfo[] = [];
  if (!references || references.length === 0) return info;
  references.forEach((r) => {
    const checked = checkedReferences[locale][r.uniqueKey];
    if (checked) {
      info.push({
        uid: r.uid,
        version: parseInt(r.version.toString()),
        locale: locale,
        content_type_uid:
          r.content_type_uid === "asset"
            ? "built_io_upload"
            : r.content_type_uid,
        action: "publish",
        title: r.title,
      });
    }
    if (r.references && r.references.length > 0) {
      info.push(
        ...getReleaseInfoRecursive(locale, r.references, checkedReferences)
      );
    }
  });
  return info;
};
