import { cn } from "@/lib/utils";
import { AlertCircleIcon, GlobeIcon, Loader2Icon } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { Doc } from "../../../../convex/_generated/dataModel";

interface ProjectIconProps {
  importStatus?: Doc<"projects">["importStatus"];
  className?: string;
}

export const ProjectIcon = ({ importStatus, className }: ProjectIconProps) => {
  const commonClass = cn("text-muted-foreground", className);

  if (importStatus === "completed") {
    return <FaGithub className={commonClass} />;
  }

  if (importStatus === "failed") {
    return <AlertCircleIcon className={commonClass} />;
  }

  if (importStatus === "importing") {
    return <Loader2Icon className={cn("animate-spin", commonClass)} />;
  }

  return <GlobeIcon className={commonClass} />;
};
