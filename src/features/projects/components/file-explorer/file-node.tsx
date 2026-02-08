import { useEditor } from "@/features/editor/hooks/use-editor";
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
  const { openFile, closeTab, activeTabId } = useEditor(item.projectId);

  const [isRenaming, setIsRenaming] = useState(false);
  const renameFile = useRenameFile();
  const deleteFile = useDeleteFile();

  const handleRename = (newName: string) => {
    setIsRenaming(false);
    if (newName === item.name) return;
    renameFile({ id: item._id, newName });
  };

  const handleDelete = () => {
    closeTab(item._id);
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
      isActive={activeTabId === item._id}
      onClick={() => openFile(item._id, { pinned: false })}
      onDoubleClick={() => openFile(item._id, { pinned: true })}
      onRename={() => setIsRenaming(true)}
      onDelete={handleDelete}
    >
      <FileIcon fileName={item.name} autoAssign className="size-4" />
      <span className="truncate text-sm">{item.name}</span>
    </TreeItemWrapper>
  );
};
