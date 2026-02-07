import { BreadcrumbItem, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { useState } from "react";
import { Id } from "../../../../convex/_generated/dataModel";
import { useProjectById, useRenameProject } from "../hooks/use-projects";

interface ProjectTitleRenamerProps {
  projectId: Id<"projects">;
}

export const ProjectTitleRenamer = ({
  projectId,
}: ProjectTitleRenamerProps) => {
  const project = useProjectById(projectId);
  const renameProject = useRenameProject(projectId);

  const [isRenaming, setIsRenaming] = useState(false);
  const [name, setName] = useState("");

  const handleStartRename = () => {
    if (!project) return;

    setName(project.name);
    setIsRenaming(true);
  };

  const handleSubmit = () => {
    if (!project) return;
    setIsRenaming(false);

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName === project.name) return;

    renameProject({ id: projectId, name: trimmedName });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      setIsRenaming(false);
    }
  };

  return (
    <BreadcrumbItem>
      {isRenaming ? (
        <input
          autoFocus
          title="Project Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={(e) => e.currentTarget.select()}
          onBlur={handleSubmit}
          onKeyDown={handleKeyDown}
          className="text-sm bg-transparent text-foreground outline-none focus:ring-1 focus:ring-inset focus:ring-ring font-medium max-w-40 truncate"
        />
      ) : (
        <BreadcrumbPage
          onClick={handleStartRename}
          className="text-sm cursor-pointer hover:text-primary font-medium max-w-40 truncate"
        >
          {project?.name ?? "Loading..."}
        </BreadcrumbPage>
      )}
    </BreadcrumbItem>
  );
};
