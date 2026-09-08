export const ITEM_GROUPS = [
  { value: "auto", label: "Auto" },
  { value: "home", label: "Home" },
  { value: "life", label: "Life" },
  { value: "commercial", label: "Commercial" },
  { value: "specialty", label: "Specialty / HNW" },
  { value: "nonstandard_auto", label: "Non-standard Auto" },
  { value: "collector", label: "Collector" },
  { value: "travel", label: "Travel" },
  { value: "disability", label: "Disability" },
  { value: "residual", label: "Residual Market" },
] as const;

export type ItemGroup = (typeof ITEM_GROUPS)[number]["value"];

export type Item = {
  id: number;
  name: string;
  group: ItemGroup;
  annual_price: string | null;
  monthly_price: string | null;
  reference_code: string | null;
  created_at: string;
  updated_at: string;
};

export type ItemPayload = {
  name: string;
  group: ItemGroup;
  annual_price?: string | null;
  monthly_price?: string | null;
};

export function groupLabel(group: string): string {
  return ITEM_GROUPS.find((g) => g.value === group)?.label ?? group;
}
