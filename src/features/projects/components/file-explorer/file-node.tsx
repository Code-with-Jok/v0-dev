import { FileIcon } from "@react-symbols/icons/utils";
import { useState } from "react";
import { Doc } from "../../../../../convex/_generated/dataModel";
import { useDeleteFile, useRenameFile } from "../../hooks/use-files";
import { RenameInput } from "./rename-input";
import { TreeItemWrapper } from "./tree-item-wrapper";

interface FileNodeProps {
  item: Doc<"files">;
  level: number;
}

export const FileNode = ({ item, level }: FileNodeProps) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const renameFile = useRenameFile();
  const deleteFile = useDeleteFile();

  const handleRename = (newName: string) => {
    setIsRenaming(false);
    if (newName === item.name) return;
    renameFile({ id: item._id, newName });
  };

  const handleDelete = () => {
    deleteFile({ id: item._id });
  };

  if (isRenaming) {
    return (
      <RenameInput
        type="file"
        defaultValue={item.name}
        level={level}
        onSubmit={handleRename}
        onCancel={() => setIsRenaming(false)}
      />
    );
  }

  return (
    <TreeItemWrapper
      item={item}
      level={level}
      isActive={false} // TODO: Implement active state based on router/context
      onClick={() => {
        // TODO: Open file
      }}
      onDoubleClick={() => {}}
      onRename={() => setIsRenaming(true)}
      onDelete={handleDelete}
    >
      <FileIcon fileName={item.name} autoAssign className="size-4" />
      <span className="truncate text-sm">{item.name}</span>
    </TreeItemWrapper>
  );
};
