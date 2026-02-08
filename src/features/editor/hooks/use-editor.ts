import { useCallback } from "react";

import { Id } from "../../../../convex/_generated/dataModel";
import { useEditorStore } from "../store/use-editor-store";

export const useEditor = (projectId: Id<"projects">) => {
  // Select stable action functions individually
  const storeOpenFile = useEditorStore((state) => state.openFile);
  const storeCloseTab = useEditorStore((state) => state.closeTab);
  const storeCloseAllTabs = useEditorStore((state) => state.closeAllTabs);
  const storeSetActiveTab = useEditorStore((state) => state.setActiveTab);
  const storeCloseTabsForIds = useEditorStore((state) => state.closeTabsForIds);
  const tabState = useEditorStore((state) => state.getTabState(projectId));

  const openFile = useCallback(
    (fileId: Id<"files">, options: { pinned: boolean }) => {
      storeOpenFile(projectId, fileId, options);
    },
    [storeOpenFile, projectId]
  );

  const closeTab = useCallback(
    (fileId: Id<"files">) => {
      storeCloseTab(projectId, fileId);
    },
    [storeCloseTab, projectId]
  );

  const closeAllTabs = useCallback(() => {
    storeCloseAllTabs(projectId);
  }, [storeCloseAllTabs, projectId]);

  const setActiveTab = useCallback(
    (fileId: Id<"files">) => {
      storeSetActiveTab(projectId, fileId);
    },
    [storeSetActiveTab, projectId]
  );

  const closeTabsForIds = useCallback(
    (fileIds: Id<"files">[]) => {
      storeCloseTabsForIds(projectId, fileIds);
    },
    [storeCloseTabsForIds, projectId]
  );

  return {
    openTabs: tabState.openTabs,
    activeTabId: tabState.activeTabId,
    previewTabId: tabState.previewTabId,
    openFile,
    closeTab,
    closeAllTabs,
    setActiveTab,
    closeTabsForIds,
  };
};
