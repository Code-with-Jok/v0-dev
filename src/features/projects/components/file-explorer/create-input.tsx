"use client";

import { FileIcon, FolderIcon } from "@react-symbols/icons/utils";
import { ChevronRightIcon } from "lucide-react";
import { useRef, useState } from "react";
import { getItemPadding } from "./constants";

interface CreateInputProps {
  type: "file" | "folder";
  level: number;
  onSubmit: (name: string) => void;
  onCancel: () => void;
}

const CreateInput = ({ type, level, onSubmit, onCancel }: CreateInputProps) => {
  const [name, setName] = useState("");
  const submittedRef = useRef(false);

  const handleSubmit = () => {
    if (submittedRef.current) return;
    submittedRef.current = true;

    const trimmedName = name.trim();
    if (trimmedName) {
      onSubmit(trimmedName);
    } else {
      onCancel();
    }
  };

  return (
    <div
      className="w-full flex items-center gap-1 h-5.5 bg-accent/30"
      style={{ paddingLeft: getItemPadding(level, type === "file") }}
    >
      <div className="flex items-center gap-0.5">
        {type === "folder" && (
          <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
        )}
        {type === "folder" && (
          <FolderIcon className="size-4" folderName={name} />
        )}
        {type === "file" && (
          <FileIcon fileName={name} autoAssign className="size-4" />
        )}
      </div>

      <input
        autoFocus
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1 bg-transparent text-sm outline-none focus:ring-1 focus:ring-inset focus:ring-ring"
        onBlur={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit();
          }
          if (e.key === "Escape") {
            e.preventDefault();
            submittedRef.current = true; // Prevent blur from firing cancel again potentially
            onCancel();
          }
        }}
      />
    </div>
  );
};

export default CreateInput;
