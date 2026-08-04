import updateStatusJson from "../../data/generated/update-status.json";

export type UpdateStatus = {
  status:
    | "up-to-date"
    | "update-available"
    | "check-failed";
  catalogVersion: string;
  latestAvailableVersion: string | null;
  publishedSourceUrl: string | null;
  publishedSourceSha256: string | null;
  latestSourceUrl: string | null;
  latestSourceSha256: string | null;
  lastCheckedAt: string;
  lastCatalogUpdateAt: string | null;
  sourceChangedAt: string | null;
  updateAvailable: boolean;
  checkResult: "success" | "error";
  message: string;
};

export const updateStatus =
  updateStatusJson as UpdateStatus;
