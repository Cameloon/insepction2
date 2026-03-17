import { Inspection, InspectionStep } from "./types";

export type DisplayInspectionStatus =
  | "PLANNED"
  | "IN_PROGRESS"
  | "SUCCEEDED"
  | "FAILED";

export const SUCCESS_THRESHOLD = 0.8;

const isEvaluableStep = (step: InspectionStep) => step.result !== "NA";

export const getInspectionEvaluation = (inspection: Inspection) => {
  const steps = inspection.steps ?? [];
  const evaluableSteps = steps.filter(isEvaluableStep);
  const passed = evaluableSteps.filter((step) => step.result === "FULFILLED").length;
  const total = evaluableSteps.length;
  const passRate = total === 0 ? 0 : passed / total;

  return {
    passed,
    total,
    passRate,
  };
};

export const getDisplayInspectionStatus = (
  inspection: Inspection,
): DisplayInspectionStatus => {
  if (inspection.status === "PLANNED") {
    return "PLANNED";
  }

  if (inspection.status === "IN_PROGRESS") {
    return "IN_PROGRESS";
  }

  const { passRate } = getInspectionEvaluation(inspection);
  return passRate >= SUCCESS_THRESHOLD ? "SUCCEEDED" : "FAILED";
};

export const displayStatusLabel: Record<DisplayInspectionStatus, string> = {
  PLANNED: "Planned",
  IN_PROGRESS: "In Progress",
  SUCCEEDED: "Succeeded",
  FAILED: "Failed",
};

export const displayStatusBadgeClass: Record<DisplayInspectionStatus, string> = {
  PLANNED: "badge-planned",
  IN_PROGRESS: "badge-in-progress",
  SUCCEEDED: "badge-succeeded",
  FAILED: "badge-failed",
};

export const displayStatusSortOrder: Record<DisplayInspectionStatus, number> = {
  PLANNED: 0,
  IN_PROGRESS: 1,
  SUCCEEDED: 2,
  FAILED: 3,
};
