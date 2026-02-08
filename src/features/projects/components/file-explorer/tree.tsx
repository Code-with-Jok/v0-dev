import { Doc, Id } from "../../../../../convex/_generated/dataModel";
import { FileNode } from "./file-node";
import { FolderNode } from "./folder-node";

export const Tree = ({
  item,
  level = 0,
  projectId,
  defaultOpen = true,
}: {
  item: Doc<"files">;
  level?: number;
  projectId: Id<"projects">;
  defaultOpen?: boolean;
}) => {
  if (item.type === "file") {
    return <FileNode item={item} level={level} />;
  }

  return (
    <FolderNode
      item={item}
      level={level}
      projectId={projectId}
      defaultOpen={defaultOpen}
    />
  );
};
