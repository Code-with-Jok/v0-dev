import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";
import { CloudCheckIcon, LoaderIcon } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";
import { useProjectById } from "../hooks/use-projects";

interface ProjectSaveStatusProps {
  projectId: Id<"projects">;
}

export const ProjectSaveStatus = ({ projectId }: ProjectSaveStatusProps) => {
  const project = useProjectById(projectId);

  if (project?.importStatus === "importing") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <LoaderIcon className="size-4 text-muted-foreground animate-spin" />
        </TooltipTrigger>
        <TooltipContent>Importing...</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <CloudCheckIcon className="size-4 text-muted-foreground" />
      </TooltipTrigger>
      <TooltipContent>
        Saved{" "}
        {project?.updatedAt
          ? formatDistanceToNow(project.updatedAt, { addSuffix: true })
          : "Loading..."}
      </TooltipContent>
    </Tooltip>
  );
};
