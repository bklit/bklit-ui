import { Icon, type IconName } from "@bklitui/icons";
import type { ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

type CalloutType = "info" | "warn" | "warning" | "error" | "success" | "idea";

const VARIANTS: Record<
  CalloutType,
  {
    variant: "default" | "info" | "warning" | "error" | "success";
    icon: IconName;
  }
> = {
  info: { variant: "info", icon: "IconCircleInfo" },
  idea: { variant: "default", icon: "IconCircleInfo" },
  warn: { variant: "warning", icon: "IconExclamationTriangle" },
  warning: { variant: "warning", icon: "IconExclamationTriangle" },
  error: { variant: "error", icon: "IconExclamationCircle" },
  success: { variant: "success", icon: "IconCircleCheck" },
};

/**
 * MDX `<Callout>` rendered with the coss UI Alert, so docs callouts match
 * the rest of the site. Accepts Fumadocs' `type` / `title` props.
 */
export function DocsCallout({
  type = "info",
  title,
  children,
  className,
}: {
  type?: CalloutType;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const { variant, icon } = VARIANTS[type] ?? VARIANTS.info;
  return (
    <Alert className={cn("not-prose my-6", className)} variant={variant}>
      <Icon name={icon} />
      {title ? <AlertTitle>{title}</AlertTitle> : null}
      <AlertDescription className="[&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-3">
        {children}
      </AlertDescription>
    </Alert>
  );
}
