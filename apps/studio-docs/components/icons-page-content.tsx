import { getCentralIconNames } from "@bklitui/icons";
import { IconsCatalog } from "@/components/icons-catalog";

export function IconsPageContent() {
  const names = getCentralIconNames();
  return <IconsCatalog names={names} />;
}
