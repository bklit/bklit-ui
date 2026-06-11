import { IconsCatalog } from "@/components/icons-catalog";
import { getCentralIconNames } from "@/lib/central-icon-names";

export function IconsPageContent() {
  const names = getCentralIconNames();
  return <IconsCatalog names={names} />;
}
