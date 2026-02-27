export const CHANGELOG_CATEGORIES = [
  { value: "NEW", label: "New" },
  { value: "IMPROVED", label: "Improved" },
  { value: "FIXED", label: "Fixed" },
  { value: "BETA", label: "Beta" },
] as const;

export type CategoryValue = (typeof CHANGELOG_CATEGORIES)[number]["value"];
