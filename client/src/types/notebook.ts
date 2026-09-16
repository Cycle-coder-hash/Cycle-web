export type ContentBlockType =
  | "text"
  | "heading"
  | "bullet_list"
  | "numbered_list"
  | "todo"
  | "quote"
  | "divider"
  | "image"
  | "video"
  | "pdf"
  | "html"
  | "file"
  | "link";

export interface ContentBlock {
  id: string;
  type: ContentBlockType;
  content: string; // text content, image/file data URL, HTML snippet, or link URL
  meta?: {
    checked?: boolean; // for todo / checklist
    level?: 1 | 2 | 3; // for headings (H1, H2, H3)
    fileName?: string;
    fileSize?: number; // size in bytes
    fileType?: string;
    videoDuration?: number; // video duration in seconds (strictly <= 600)
    caption?: string;
    linkTitle?: string;
    linkUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface NotebookPage {
  id: string;
  notebookId: string; // ID of the parent NotebookTemplate
  parentPageId?: string | null; // null for top-level pages, or parent page ID for sub-pages
  title: string;
  icon?: string; // emoji or icon name
  blocks: ContentBlock[];
  createdAt: string;
  updatedAt: string;
}

export interface NotebookTemplate {
  id: string;
  userId: string; // strictly isolated per user
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotebookUserData {
  templates: NotebookTemplate[];
  pages: NotebookPage[];
  activeTemplateId: string | null;
  activePageId: string | null;
}
