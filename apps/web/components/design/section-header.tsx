import { SiteSectionHeader } from "@/components/design/site-chrome";

export function DesignSectionHeader({
  title,
  subtitle,
  className,
  titleId,
}: {
  title: string;
  subtitle: string;
  className?: string;
  titleId?: string;
}) {
  return (
    <SiteSectionHeader
      className={className}
      description={subtitle}
      title={title}
      titleId={titleId}
    />
  );
}
