import { getCentralIconNames } from "@bklitui/icons/central-icon-names";
import { IconsCatalog } from "@/components/icons-catalog";

export function IconsPageContent() {
  const names = getCentralIconNames();
  return <IconsCatalog names={names} />;
}
