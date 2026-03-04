import { cn } from "@/lib/utils";
import { AlertOctagon, AlertTriangle, CheckCircle, Siren } from "lucide-react";
import { Severity } from "../backend.d";
import { getSeverityClass, getSeverityLabel } from "../utils/helpers";

interface SeverityBadgeProps {
  severity: Severity;
  showIcon?: boolean;
  className?: string;
}

function SeverityIcon({ severity }: { severity: Severity }) {
  switch (severity) {
    case Severity.low:
      return <CheckCircle size={12} />;
    case Severity.medium:
      return <AlertTriangle size={12} />;
    case Severity.high:
      return <AlertOctagon size={12} />;
    case Severity.emergency:
      return <Siren size={12} />;
    default:
      return null;
  }
}

export default function SeverityBadge({
  severity,
  showIcon = true,
  className,
}: SeverityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border",
        getSeverityClass(severity),
        className,
      )}
    >
      {showIcon && <SeverityIcon severity={severity} />}
      {getSeverityLabel(severity)}
    </span>
  );
}
