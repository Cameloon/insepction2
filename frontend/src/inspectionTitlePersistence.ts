import { Inspection } from "./types";

const STORAGE_KEY = "inspectionTitlesById";

type StoredInspectionTitles = Record<string, string>;

const loadStoredTitles = (): StoredInspectionTitles => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return {};
    }
    return parsed as StoredInspectionTitles;
  } catch {
    return {};
  }
};

const saveStoredTitles = (titles: StoredInspectionTitles) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(titles));
};

export const rememberInspectionTitles = (inspections: Inspection[]) => {
  const storedTitles = loadStoredTitles();
  let hasChanges = false;

  inspections.forEach((inspection) => {
    const id = inspection.id;
    const normalizedTitle = inspection.title?.trim();
    if (!id || !normalizedTitle) {
      return;
    }
    if (storedTitles[String(id)] !== normalizedTitle) {
      storedTitles[String(id)] = normalizedTitle;
      hasChanges = true;
    }
  });

  if (hasChanges) {
    saveStoredTitles(storedTitles);
  }
};

export const hydrateInspectionTitles = (inspections: Inspection[]) => {
  const storedTitles = loadStoredTitles();
  return inspections.map((inspection) => {
    const id = inspection.id;
    if (inspection.title?.trim() || !id) {
      return inspection;
    }
    const fallbackTitle = storedTitles[String(id)];
    if (!fallbackTitle) {
      return inspection;
    }
    return { ...inspection, title: fallbackTitle };
  });
};
