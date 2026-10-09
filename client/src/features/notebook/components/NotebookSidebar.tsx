import React, { useState } from "react";
import {
  NotebookTemplate,
  NotebookPage,
} from "@/types/notebook";
import {
  BookOpen,
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  FileText,
  FilePlus,
  Trash2,
  Edit2,
  FolderPlus,
  MoreVertical,
  Check,
  X,
  Sparkles,
} from "lucide-react";

interface NotebookSidebarProps {
  templates: NotebookTemplate[];
  activeTemplateId: string | null;
  pages: NotebookPage[];
  activePageId: string | null;
  isBn?: boolean;
  onSelectTemplate: (templateId: string) => void;
  onCreateTemplate: (name: string, description?: string) => void;
  onRenameTemplate: (templateId: string, newName: string) => void;
  onDeleteTemplate: (templateId: string) => void;
  onSelectPage: (pageId: string) => void;
  onCreatePage: (parentPageId?: string | null) => void;
  onRenamePage: (pageId: string, newTitle: string) => void;
  onDeletePage: (pageId: string) => void;
  onOpenSearch: () => void;
}

export function NotebookSidebar({
  templates,
  activeTemplateId,
  pages,
  activePageId,
  isBn = false,
  onSelectTemplate,
  onCreateTemplate,
  onRenameTemplate,
  onDeleteTemplate,
  onSelectPage,
  onCreatePage,
  onRenamePage,
  onDeletePage,
  onOpenSearch,
}: NotebookSidebarProps) {
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [collapsedParents, setCollapsedParents] = useState<Record<string, boolean>>({});

  // Editing page title inline state
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingPageTitle, setEditingPageTitle] = useState("");

  const activeTemplate = templates.find((t) => t.id === activeTemplateId) || templates[0];

  // Filter pages for active template
  const templatePages = pages.filter((p) => p.notebookId === activeTemplateId);
  const parentPages = templatePages.filter((p) => !p.parentPageId);

  const toggleCollapse = (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedParents((prev) => ({ ...prev, [pageId]: !prev[pageId] }));
  };

  const handleStartRename = (page: NotebookPage, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPageId(page.id);
    setEditingPageTitle(page.title);
  };

  const handleSaveRename = (pageId: string) => {
    if (editingPageTitle.trim()) {
      onRenamePage(pageId, editingPageTitle.trim());
    }
    setEditingPageId(null);
  };

  const handleCreateNewTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) return;
    onCreateTemplate(newTemplateName.trim());
    setNewTemplateName("");
    setIsCreatingTemplate(false);
    setIsTemplateMenuOpen(false);
  };

  return (
    <aside className="w-full lg:w-72 shrink-0 flex flex-col bg-white/60 dark:bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-xs">
      {/* 1. Template Selector Header */}
      <div className="relative mb-3">
        <button
          type="button"
          onClick={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}
          className="flex w-full items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-2.5 text-left shadow-2xs hover:border-cyan-500 transition-colors dark:border-slate-800 dark:bg-slate-950"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-base">
              {activeTemplate?.icon || "📓"}
            </span>
            <div className="min-w-0">
              <div className="truncate text-xs font-black text-slate-900 dark:text-white">
                {activeTemplate?.name || (isBn ? "নোটবুক টেমপ্লেট" : "Notebook Template")}
              </div>
              <div className="truncate text-[10px] text-slate-400">
                {parentPages.length} {isBn ? "টি টপিক পৃষ্ঠা" : "main pages"}
              </div>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        </button>

        {/* Template Dropdown Menu */}
        {isTemplateMenuOpen && (
          <div className="absolute left-0 top-14 z-50 w-full rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-950">
            <div className="max-h-48 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
              {templates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className={`group flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs transition-colors ${
                    tmpl.id === activeTemplateId
                      ? "bg-cyan-500/10 text-cyan-600 font-bold dark:text-cyan-400"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTemplate(tmpl.id);
                      setIsTemplateMenuOpen(false);
                    }}
                    className="flex items-center gap-2 min-w-0 flex-1 text-left"
                  >
                    <span>{tmpl.icon || "📓"}</span>
                    <span className="truncate">{tmpl.name}</span>
                  </button>
                  {templates.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTemplate(tmpl.id);
                      }}
                      title={isBn ? "টেমপ্লেট মুছুন" : "Delete Template"}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Create New Template Section */}
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {!isCreatingTemplate ? (
                <button
                  type="button"
                  onClick={() => setIsCreatingTemplate(true)}
                  className="flex w-full items-center gap-1.5 rounded-xl px-2 py-1.5 text-xs font-bold text-cyan-600 hover:bg-cyan-500/10 dark:text-cyan-400"
                >
                  <FolderPlus className="h-3.5 w-3.5" />
                  <span>{isBn ? "+ নতুন নোটবুক টেমপ্লেট" : "+ New Notebook Template"}</span>
                </button>
              ) : (
                <form onSubmit={handleCreateNewTemplate} className="space-y-1.5 p-1">
                  <input
                    type="text"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder={isBn ? "টেমপ্লেটের নাম..." : "Template name..."}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-800 focus:border-cyan-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                    autoFocus
                  />
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => setIsCreatingTemplate(false)}
                      className="rounded px-2 py-1 text-[10px] text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded bg-cyan-500 px-2.5 py-1 text-[10px] font-bold text-slate-950 hover:bg-cyan-400"
                    >
                      Create
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. Global Search Trigger */}
      <button
        type="button"
        onClick={onOpenSearch}
        className="mb-3 flex w-full items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50 px-3 py-2 text-xs text-slate-500 shadow-2xs hover:border-cyan-500/50 hover:bg-white transition-colors dark:border-slate-800/80 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900"
      >
        <div className="flex items-center gap-2">
          <Search className="h-3.5 w-3.5 text-cyan-500" />
          <span>{isBn ? "নোট ও পৃষ্ঠা অনুসন্ধান..." : "Search pages & blocks..."}</span>
        </div>
        <kbd className="rounded bg-slate-200/60 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          ⌘K
        </kbd>
      </button>

      {/* 3. Section Title & Add Page Action */}
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
          {isBn ? "পৃষ্ঠা ও সাব-পেজ" : "Pages & Playbooks"}
        </span>
        <button
          type="button"
          onClick={() => onCreatePage(null)}
          title={isBn ? "নতুন পৃষ্ঠা তৈরি করুন" : "Add Page"}
          className="flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-bold text-cyan-600 hover:bg-cyan-500/10 dark:text-cyan-400"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>{isBn ? "পৃষ্ঠা" : "Page"}</span>
        </button>
      </div>

      {/* 4. Hierarchical Page Tree */}
      <div className="flex-1 overflow-y-auto space-y-0.5 pr-1 scrollbar-thin">
        {parentPages.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            {isBn ? "কোনো পৃষ্ঠা নেই। উপরে '+' চাপুন।" : "No pages yet. Click + to create one."}
          </div>
        ) : (
          parentPages.map((page) => {
            const subPages = templatePages.filter((p) => p.parentPageId === page.id);
            const isCollapsed = collapsedParents[page.id];
            const isCurrent = page.id === activePageId;

            return (
              <div key={page.id} className="space-y-0.5">
                {/* Parent Page Row */}
                <div
                  className={`group relative flex items-center justify-between rounded-xl px-2 py-1.5 text-xs transition-colors cursor-pointer ${
                    isCurrent
                      ? "bg-cyan-500/15 text-cyan-700 font-black dark:bg-cyan-500/10 dark:text-cyan-300"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60 font-medium"
                  }`}
                  onClick={() => onSelectPage(page.id)}
                >
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    {subPages.length > 0 ? (
                      <button
                        type="button"
                        onClick={(e) => toggleCollapse(page.id, e)}
                        className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      >
                        {isCollapsed ? (
                          <ChevronRight className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </button>
                    ) : (
                      <span className="w-3.5" />
                    )}

                    <span className="text-sm shrink-0">{page.icon || "📄"}</span>

                    {editingPageId === page.id ? (
                      <input
                        type="text"
                        value={editingPageTitle}
                        onChange={(e) => setEditingPageTitle(e.target.value)}
                        onBlur={() => handleSaveRename(page.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveRename(page.id);
                          if (e.key === "Escape") setEditingPageId(null);
                        }}
                        autoFocus
                        className="w-full rounded bg-white px-1.5 py-0.5 text-xs border border-cyan-500 focus:outline-none dark:bg-slate-900"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="truncate flex-1">
                        {page.title || (isBn ? "শিরোনামহীন" : "Untitled")}
                      </span>
                    )}
                  </div>

                  {/* Actions on hover */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreatePage(page.id);
                      }}
                      title={isBn ? "সাব-পেজ যোগ করুন" : "Add Sub-page"}
                      className="p-1 text-slate-400 hover:text-cyan-500"
                    >
                      <FilePlus className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleStartRename(page, e)}
                      title={isBn ? "রিনেম" : "Rename"}
                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePage(page.id);
                      }}
                      title={isBn ? "মুছুন" : "Delete"}
                      className="p-1 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Sub-Pages List */}
                {!isCollapsed && subPages.length > 0 && (
                  <div className="pl-6 space-y-0.5 border-l border-slate-200/60 dark:border-slate-800/60 ml-4">
                    {subPages.map((subPage) => {
                      const isSubCurrent = subPage.id === activePageId;
                      return (
                        <div
                          key={subPage.id}
                          className={`group flex items-center justify-between rounded-xl px-2 py-1 text-xs transition-colors cursor-pointer ${
                            isSubCurrent
                              ? "bg-cyan-500/15 text-cyan-700 font-bold dark:bg-cyan-500/10 dark:text-cyan-300"
                              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60"
                          }`}
                          onClick={() => onSelectPage(subPage.id)}
                        >
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <span className="text-xs shrink-0">{subPage.icon || "📄"}</span>
                            {editingPageId === subPage.id ? (
                              <input
                                type="text"
                                value={editingPageTitle}
                                onChange={(e) => setEditingPageTitle(e.target.value)}
                                onBlur={() => handleSaveRename(subPage.id)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSaveRename(subPage.id);
                                  if (e.key === "Escape") setEditingPageId(null);
                                }}
                                autoFocus
                                className="w-full rounded bg-white px-1.5 py-0.5 text-xs border border-cyan-500 focus:outline-none dark:bg-slate-900"
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <span className="truncate flex-1">
                                {subPage.title || (isBn ? "শিরোনামহীন" : "Untitled")}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={(e) => handleStartRename(subPage, e)}
                              title={isBn ? "রিনেম" : "Rename"}
                              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeletePage(subPage.id);
                              }}
                              title={isBn ? "মুছুন" : "Delete"}
                              className="p-1 text-slate-400 hover:text-red-500"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
