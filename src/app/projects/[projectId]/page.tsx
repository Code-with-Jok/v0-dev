import ProjectIdView from "@/features/projects/components/project-id-view";
import { Id } from "../../../../convex/_generated/dataModel";

interface ProjectPageProps {
  params: Promise<{ projectId: Id<"projects"> }>;
}

const ProjectPage = async ({ params }: ProjectPageProps) => {
  const { projectId } = await params;

  return <ProjectIdView projectId={projectId} />;
};

export default ProjectPage;
