import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Spinner } from "@/components/ui/spinner";
import { formatDistanceToNow } from "date-fns";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { Doc } from "../../../../convex/_generated/dataModel";
import { useProjectsPartial } from "../hooks/use-projects";
import { ProjectIcon } from "./project-icon";

interface ProjectsListProps {
  onViewAll: () => void;
}

const formatTimestamp = (timestamp: number) => {
  return formatDistanceToNow(new Date(timestamp), {
    addSuffix: true,
  });
};

const ContinueCard = ({ data }: { data: Doc<"projects"> }) => {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-muted-foreground">Last updated</span>
      <Button
        variant="outline"
        asChild
        className="h-auto items-start justify-start p-4 bg-background border rounded-none flex flex-col gap-2"
      >
        <Link href={`/projects/${data._id}`} className="group">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <ProjectIcon
                importStatus={data.importStatus}
                className="size-3.5"
              />
              <span className="font-medium truncate">{data.name}</span>
            </div>
            <ArrowRightIcon className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </div>
          <span className="text-xs text-muted-foreground">
            {formatTimestamp(data.updatedAt)}
          </span>
        </Link>
      </Button>
    </div>
  );
};

const ProjectItem = ({ data }: { data: Doc<"projects"> }) => {
  return (
    <Link
      href={`/projects/${data._id}`}
      className="text-sm text-foreground/60 font-medium hover:text-foreground py-1 flex items-center justify-between w-full group"
    >
      <div className="flex items-center gap-2">
        <ProjectIcon importStatus={data.importStatus} className="size-3.5" />
        <span className="truncate">{data.name}</span>
      </div>
      <span className="text-xs text-muted-foreground group-hover:text-foreground/60 transition-colors">
        {formatTimestamp(data.updatedAt)}
      </span>
    </Link>
  );
};

const ProjectsList = ({ onViewAll }: ProjectsListProps) => {
  const projects = useProjectsPartial(10);

  if (projects === undefined) {
    return <Spinner className="size-4 text-ring" />;
  }
  const [mostRecent, ...rest] = projects;

  return (
    <div className="flex flex-col gap-4">
      {mostRecent ? <ContinueCard data={mostRecent} /> : null}

      {rest.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              Recent projects
            </span>
            <button
              onClick={onViewAll}
              className="flex items-center gap-2 text-muted-foreground text-xs hover:text-foreground transition-colors"
            >
              <span>View all</span>
              <Kbd className="bg-accent border">Ctrl+K</Kbd>
            </button>
          </div>

          <ul className="flex flex-col">
            {rest.map((project) => (
              <li key={project._id}>
                <ProjectItem data={project} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProjectsList;
