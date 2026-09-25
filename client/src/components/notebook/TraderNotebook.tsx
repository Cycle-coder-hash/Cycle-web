import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  NotebookUserData,
  NotebookTemplate,
  NotebookPage,
} from "@/types/notebook";
import {
  loadUserNotebookData,
  debouncedSaveNotebookData,
  saveUserNotebookData,
} from "@/lib/notebookStorage";
import { NotebookSidebar } from "./NotebookSidebar";
import { NotebookPageEditor } from "./NotebookPageEditor";
import { NotebookSearchModal } from "./NotebookSearchModal";
import { NotebookDeleteDialog } from "./NotebookDeleteDialog";
import {
  BookOpen,
  Plus,
  Sparkles,
  Search,
  Shield,
  Layers,
  FilePlus,
  Compass,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { UpgradeModal, UpgradeFeatureType } from "@/components/subscription/UpgradeModal";

interface TraderNotebookProps {
  user?: any;
  isBn?: boolean;
  subUsage?: any;
}

export function TraderNotebook({ user, isBn = false, subUsage: propSubUsage }: TraderNotebookProps) {
  const userId = useMemo(() => {
    return user?.openId || user?.email || (user?.id ? String(user.id) : "trader_private_vault");
  }, [user]);

  const utils = trpc.useUtils();
  const subUsageQuery = trpc.subscription.getMyUsage.useQuery(undefined, {
    enabled: !propSubUsage && !!user,
  });
  const subUsage = propSubUsage || subUsageQuery.data;

  const createNotebookPageMutation = trpc.subscription.createNotebookPage.useMutation({
    onSuccess: () => {
      utils.subscription.getMyUsage.invalidate();
    },
  });

  const deleteNotebookPageMutation = trpc.subscription.deleteNotebookPage.useMutation({
    onSuccess: () => {
      utils.subscription.getMyUsage.invalidate();
    },
  });

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<UpgradeFeatureType>("notebook_pages");

  const [userData, setUserData] = useState<NotebookUserData | null>(null);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Search Modal
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Delete Confirmation Dialog State
  const [deleteTarget, setDeleteTarget] = useState<{
    isOpen: boolean;
    type: "template" | "page" | "subpage";
    id: string;
    name: string;
  }>({
    isOpen: false,
    type: "page",
    id: "",
    name: "",
  });

  // Load User Notebook Data on mount or user change
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    loadUserNotebookData(userId)
      .then((data) => {
        if (!isMounted) return;
        setUserData(data);
        const currentTmplId = data.activeTemplateId || data.templates[0]?.id || null;
        setActiveTemplateId(currentTmplId);

        // Find initial active page
        const pagesInTmpl = data.pages.filter((p) => p.notebookId === currentTmplId);
        const validActivePage = pagesInTmpl.find((p) => p.id === data.activePageId) || pagesInTmpl[0] || null;
        setActivePageId(validActivePage ? validActivePage.id : null);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load notebook data:", err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [userId]);

  // Save changes helper with debounce
  const persistChanges = useCallback(
    (nextData: NotebookUserData) => {
      setUserData(nextData);
      setIsSaving(true);
      debouncedSaveNotebookData(userId, nextData, 400).then(() => {
        setIsSaving(false);
      });
    },
    [userId]
  );

  // Switch Template
  const handleSelectTemplate = (templateId: string) => {
    if (!userData) return;
    setActiveTemplateId(templateId);
    const pagesInTmpl = userData.pages.filter((p) => p.notebookId === templateId);
    const firstPage = pagesInTmpl[0] || null;
    setActivePageId(firstPage ? firstPage.id : null);

    persistChanges({
      ...userData,
      activeTemplateId: templateId,
      activePageId: firstPage ? firstPage.id : null,
    });
  };

  // Create Template
  const handleCreateTemplate = (name: string, description?: string) => {
    if (!userData) return;
    const newTemplateId = `tmpl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newTemplate: NotebookTemplate = {
      id: newTemplateId,
      userId,
      name,
      description: description || "Custom trading workspace",
      icon: "📘",
      color: "#06b6d4",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Also create initial welcome page
    const newPageId = `page_${Date.now()}_init`;
    const initialPage: NotebookPage = {
      id: newPageId,
      notebookId: newTemplateId,
      parentPageId: null,
      title: isBn ? "পরিচিতি ও কৌশল নোট" : "Overview & Strategy Notes",
      icon: "🎯",
      blocks: [
        {
          id: `b_${Date.now()}`,
          type: "heading",
          content: isBn ? "কৌশল বিশ্লেষণ ও প্লেবুক" : "Trading Playbook & Edge Formulation",
          meta: { level: 1 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: `b_${Date.now() + 1}`,
          type: "text",
          content: isBn
            ? "এই নোটবুকে আপনার চার্ট সেটআপ, রুলস, স্ক্রিনশট এবং ভিডিও রেকর্ড সংরক্ষণ করুন।"
            : "Capture chart analysis, trade setups, execution rules, and daily market recaps here.",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const nextData: NotebookUserData = {
      ...userData,
      templates: [...userData.templates, newTemplate],
      pages: [...userData.pages, initialPage],
      activeTemplateId: newTemplateId,
      activePageId: newPageId,
    };

    setActiveTemplateId(newTemplateId);
    setActivePageId(newPageId);
    persistChanges(nextData);
  };

  // Rename Template
  const handleRenameTemplate = (templateId: string, newName: string) => {
    if (!userData) return;
    const nextTemplates = userData.templates.map((t) =>
      t.id === templateId ? { ...t, name: newName, updatedAt: new Date().toISOString() } : t
    );
    persistChanges({
      ...userData,
      templates: nextTemplates,
    });
  };

  // Trigger Delete Template Dialog
  const triggerDeleteTemplate = (templateId: string) => {
    const tmpl = userData?.templates.find((t) => t.id === templateId);
    if (!tmpl) return;
    setDeleteTarget({
      isOpen: true,
      type: "template",
      id: templateId,
      name: tmpl.name,
    });
  };

  // Confirm Delete Template
  const confirmDeleteTemplate = () => {
    if (!userData) return;
    const templateId = deleteTarget.id;
    const remainingTemplates = userData.templates.filter((t) => t.id !== templateId);
    const remainingPages = userData.pages.filter((p) => p.notebookId !== templateId);

    const nextActiveTmpl = remainingTemplates[0]?.id || null;
    const nextPages = remainingPages.filter((p) => p.notebookId === nextActiveTmpl);
    const nextActivePage = nextPages[0]?.id || null;

    setActiveTemplateId(nextActiveTmpl);
    setActivePageId(nextActivePage);

    persistChanges({
      ...userData,
      templates: remainingTemplates,
      pages: remainingPages,
      activeTemplateId: nextActiveTmpl,
      activePageId: nextActivePage,
    });

    setDeleteTarget((prev) => ({ ...prev, isOpen: false }));
  };

  // Select Page
  const handleSelectPage = (pageId: string) => {
    if (!userData) return;
    setActivePageId(pageId);
    persistChanges({
      ...userData,
      activePageId: pageId,
    });
  };

  // Create Page (Top-level or Sub-page)
  const handleCreatePage = (parentPageId?: string | null) => {
    if (!userData || !activeTemplateId) return;

    if (subUsage) {
      if (
        subUsage.notebookPagesLimit === 0 ||
        (subUsage.notebookPagesLimit !== "unlimited" &&
          subUsage.notebookPagesCount >= subUsage.notebookPagesLimit)
      ) {
        setUpgradeFeature("notebook_pages");
        setIsUpgradeModalOpen(true);
        return;
      }
    }

    const newPageId = `page_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newPage: NotebookPage = {
      id: newPageId,
      notebookId: activeTemplateId,
      parentPageId: parentPageId || null,
      title: parentPageId ? (isBn ? "নতুন সাব-টপিক" : "New Sub-Topic") : (isBn ? "নতুন পৃষ্ঠা" : "New Page"),
      icon: parentPageId ? "📄" : "📝",
      blocks: [
        {
          id: `b_${Date.now()}`,
          type: "heading",
          content: parentPageId ? "Sub-Topic Detail" : "Topic Overview",
          meta: { level: 2 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: `b_${Date.now() + 1}`,
          type: "text",
          content: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const nextPages = [...userData.pages, newPage];
    setActivePageId(newPageId);
    persistChanges({
      ...userData,
      pages: nextPages,
      activePageId: newPageId,
    });

    createNotebookPageMutation.mutate({ pageId: newPageId });
  };

  // Rename Page
  const handleRenamePage = (pageId: string, newTitle: string) => {
    if (!userData) return;
    const nextPages = userData.pages.map((p) =>
      p.id === pageId ? { ...p, title: newTitle, updatedAt: new Date().toISOString() } : p
    );
    persistChanges({
      ...userData,
      pages: nextPages,
    });
  };

  // Trigger Delete Page Dialog
  const triggerDeletePage = (pageId: string) => {
    const page = userData?.pages.find((p) => p.id === pageId);
    if (!page) return;
    setDeleteTarget({
      isOpen: true,
      type: page.parentPageId ? "subpage" : "page",
      id: pageId,
      name: page.title,
    });
  };

  // Confirm Delete Page
  const confirmDeletePage = () => {
    if (!userData) return;
    const pageId = deleteTarget.id;

    // Remove the target page and any child subpages
    const nextPages = userData.pages.filter((p) => p.id !== pageId && p.parentPageId !== pageId);

    // Pick next active page in current template
    let nextActivePage = activePageId;
    if (activePageId === pageId || !nextPages.some((p) => p.id === activePageId)) {
      const tmplPages = nextPages.filter((p) => p.notebookId === activeTemplateId);
      nextActivePage = tmplPages[0]?.id || null;
    }

    setActivePageId(nextActivePage);
    persistChanges({
      ...userData,
      pages: nextPages,
      activePageId: nextActivePage,
    });

    setDeleteTarget((prev) => ({ ...prev, isOpen: false }));
    deleteNotebookPageMutation.mutate({ pageId });
  };

  // Update Page Content
  const handleUpdatePage = (updatedPage: NotebookPage) => {
    if (!userData) return;
    const nextPages = userData.pages.map((p) => (p.id === updatedPage.id ? updatedPage : p));
    persistChanges({
      ...userData,
      pages: nextPages,
    });
  };

  // Active Template & Page objects
  const activeTemplate = useMemo(() => {
    return userData?.templates.find((t) => t.id === activeTemplateId) || userData?.templates[0] || null;
  }, [userData, activeTemplateId]);

  const activePage = useMemo(() => {
    return userData?.pages.find((p) => p.id === activePageId) || null;
  }, [userData, activePageId]);

  const activeParentPage = useMemo(() => {
    if (!activePage?.parentPageId) return null;
    return userData?.pages.find((p) => p.id === activePage.parentPageId) || null;
  }, [userData, activePage]);

  const activeSubPages = useMemo(() => {
    if (!activePage) return [];
    return userData?.pages.filter((p) => p.parentPageId === activePage.id) || [];
  }, [userData, activePage]);

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3 rounded-3xl border border-slate-200/80 bg-white/50 p-8 dark:border-slate-800/80 dark:bg-slate-900/20">
        <Sparkles className="h-8 w-8 animate-spin text-cyan-500" />
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
          {isBn ? "প্রাইভেট নোটবুক ও প্লেবুক লোড হচ্ছে..." : "Loading Private Trader Notebook Vault..."}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Top Banner: Trader Notebook Status & Knowledge Vault Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-3xl border border-slate-200/80 bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-transparent p-5 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/40">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                {isBn ? "প্রাইভেট ট্রেডার নোটবুক ও স্ট্র্যাটেজি ভল্ট" : "Private Trader Notebook & Strategy Vault"}
              </h3>
              <span className="flex items-center gap-1 rounded-full bg-cyan-500/15 px-2.5 py-0.5 text-[10px] font-bold text-cyan-600 dark:text-cyan-400">
                <Shield className="h-3 w-3" />
                {isBn ? "১০০% প্রাইভেট এনক্রিপ্টেড" : "100% User-Private"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isBn
                ? "নোশন-স্টাইল নোট, স্ক্রিনশট, সর্বোচ্চ ১০ মিনিটের সেশন ভিডিও এবং প্লেবুক লাইব্রেরি"
                : "Notion-style hierarchy, chart screenshots, ≤ 10-minute session videos, and multi-playbook storage"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:border-cyan-500 hover:text-cyan-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-cyan-400 dark:hover:text-cyan-400 transition-all"
          >
            <Search className="h-3.5 w-3.5 text-cyan-500" />
            <span>{isBn ? "সার্চ (⌘K)" : "Global Search (⌘K)"}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout: Empty State or Sidebar + Page Editor */}
      {userData && userData.templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200/80 bg-white/40 p-12 text-center dark:border-slate-800/80 dark:bg-slate-900/30 min-h-[480px] shadow-xs">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-500 mb-4 shadow-lg shadow-cyan-500/10">
            <BookOpen className="h-8 w-8" />
          </div>
          <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
            {isBn ? "এখনো কোনো নোটবুক নেই" : "No Notebooks Yet"}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1.5 mb-6 leading-relaxed">
            {isBn
              ? "আপনার ট্রেডিং জ্ঞান, স্ট্র্যাটেজি এবং প্লেবুক সাজাতে প্রথম নোটবুকটি তৈরি করুন।"
              : "Create your first notebook to organize your trading knowledge."}
          </p>
          <button
            type="button"
            onClick={() => handleCreateTemplate(isBn ? "আমার নোটবুক" : "My Trading Playbook")}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-xs font-black text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>{isBn ? "+ প্রথম নোটবুক তৈরি করুন" : "+ Create First Notebook"}</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-5 min-h-[720px]">
          {/* Left Sidebar */}
          <NotebookSidebar
            templates={userData?.templates || []}
            activeTemplateId={activeTemplateId}
            pages={userData?.pages || []}
            activePageId={activePageId}
            isBn={isBn}
            onSelectTemplate={handleSelectTemplate}
            onCreateTemplate={handleCreateTemplate}
            onRenameTemplate={handleRenameTemplate}
            onDeleteTemplate={triggerDeleteTemplate}
            onSelectPage={handleSelectPage}
            onCreatePage={handleCreatePage}
            onRenamePage={handleRenamePage}
            onDeletePage={triggerDeletePage}
            onOpenSearch={() => setIsSearchOpen(true)}
          />

          {/* Right Main Page Editor */}
          {activePage && activeTemplate ? (
            <NotebookPageEditor
              page={activePage}
              template={activeTemplate}
              parentPage={activeParentPage}
              subPages={activeSubPages}
              isBn={isBn}
              isSaving={isSaving}
              onUpdatePage={handleUpdatePage}
              onDeletePage={triggerDeletePage}
              onCreateSubPage={(parentId) => handleCreatePage(parentId)}
              onSelectPage={handleSelectPage}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200/80 bg-white/30 p-12 text-center dark:border-slate-800/80 dark:bg-slate-900/20">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-500 mb-4">
                <Layers className="h-7 w-7" />
              </div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                {isBn ? "কোনো পৃষ্ঠা নির্বাচন করা হয়নি" : "No page selected"}
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1 mb-5">
                {isBn
                  ? "বামের সাইডবার থেকে যেকোনো পৃষ্ঠা সিলেক্ট করুন অথবা নতুন পৃষ্ঠা তৈরি করুন।"
                  : "Select an existing topic from the sidebar or click below to start a new page."}
              </p>
              <button
                type="button"
                onClick={() => handleCreatePage(null)}
                className="flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-2.5 text-xs font-black text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/25 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>{isBn ? "+ নতুন পৃষ্ঠা তৈরি করুন" : "+ Create New Page"}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Global Search Modal */}
      <NotebookSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        templates={userData?.templates || []}
        pages={userData?.pages || []}
        isBn={isBn}
        onSelectResult={(tmplId, pageId) => {
          setActiveTemplateId(tmplId);
          setActivePageId(pageId);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <NotebookDeleteDialog
        isOpen={deleteTarget.isOpen}
        title={
          deleteTarget.type === "template"
            ? isBn
              ? "নোটবুক টেমপ্লেট মুছে ফেলুন"
              : "Delete Notebook Template"
            : isBn
            ? "পৃষ্ঠা মুছে ফেলুন"
            : "Delete Page"
        }
        itemName={deleteTarget.name}
        itemType={deleteTarget.type}
        isBn={isBn}
        onConfirm={deleteTarget.type === "template" ? confirmDeleteTemplate : confirmDeletePage}
        onCancel={() => setDeleteTarget((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Subscription Access / Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        feature={upgradeFeature}
        currentPlan={subUsage?.plan}
      />
    </div>
  );
}
