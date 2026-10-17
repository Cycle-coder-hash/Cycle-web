import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { CourseClassesTab } from "./CourseClassesTab";
import { CourseClassModal } from "../modals/CourseClassModal";
import { CourseAlbumMetaModal } from "../modals/CourseAlbumMetaModal";
import type { CourseClass, CourseId, CourseAlbumMeta } from "@shared/types/library";


interface CourseAlbumManagerProps {
  courseId: CourseId;
}

export const CourseAlbumManager: React.FC<CourseAlbumManagerProps> = ({ courseId }) => {
  const utils = trpc.useUtils();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<CourseClass | null>(null);

  // Query album metadata
  const { data: albumMeta = null } = trpc.admin.courseAlbumMeta.useQuery(
    { courseId },
    { staleTime: 1000 * 10 }
  );

  const albumTitle =
    albumMeta?.title ||
    (courseId === "basic-to-advance"
      ? "Cycle of Chart Basic to Advance Course (Album A)"
      : "Cycle of Chart — Professional Trading Blueprint (Album B)");
  const bundleId = courseId === "basic-to-advance" ? 2 : 4;
  const bundlePrice = albumMeta?.priceBdt || (courseId === "basic-to-advance" ? "2,499" : "4,999");

  // Query classes
  const { data: classes = [], isLoading } = trpc.admin.courseClasses.useQuery(
    { courseId },
    { staleTime: 1000 * 10 }
  );

  const updateMetaMutation = trpc.admin.updateCourseAlbumMeta.useMutation({
    onSuccess: () => {
      utils.admin.courseAlbumMeta.invalidate({ courseId });
      utils.customer.courseAlbum.invalidate({ courseId });
      toast.success("Album details saved successfully!");
      setIsMetaModalOpen(false);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update album details");
    },
  });

  // Mutations
  const createMutation = trpc.admin.createCourseClass.useMutation({
    onSuccess: () => {
      utils.admin.courseClasses.invalidate({ courseId });
      utils.customer.courseAlbum.invalidate({ courseId });
      toast.success("Class added successfully!");
      setIsModalOpen(false);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to add class");
    },
  });

  const updateMutation = trpc.admin.updateCourseClass.useMutation({
    onSuccess: () => {
      utils.admin.courseClasses.invalidate({ courseId });
      utils.customer.courseAlbum.invalidate({ courseId });
      toast.success("Class updated successfully!");
      setIsModalOpen(false);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update class");
    },
  });

  const deleteMutation = trpc.admin.deleteCourseClass.useMutation({
    onSuccess: () => {
      utils.admin.courseClasses.invalidate({ courseId });
      utils.customer.courseAlbum.invalidate({ courseId });
      toast.success("Class deleted successfully");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete class");
    },
  });

  const reorderMutation = trpc.admin.reorderCourseClasses.useMutation({
    onSuccess: () => {
      utils.admin.courseClasses.invalidate({ courseId });
      utils.customer.courseAlbum.invalidate({ courseId });
      toast.success("Class sequence updated");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update sequence");
    },
  });

  // Handlers
  const handleOpenAdd = () => {
    setEditingClass(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cls: CourseClass) => {
    setEditingClass(cls);
    setIsModalOpen(true);
  };

  const handleTogglePublish = (cls: CourseClass) => {
    const nextPublished = cls.isPublished === false;
    updateMutation.mutate({
      courseId,
      id: cls.id,
      isPublished: nextPublished,
    });
  };

  const handleDeleteClass = (cls: CourseClass) => {
    if (window.confirm(`Are you sure you want to permanently delete "${cls.title}"?`)) {
      deleteMutation.mutate({
        courseId,
        id: cls.id,
      });
    }
  };

  const handleMoveOrder = (classId: string, direction: "up" | "down") => {
    const list = [...classes];
    const index = list.findIndex((c) => String(c.id) === String(classId));
    if (index === -1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    // Swap positions
    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);

    const orderedIds = list.map((c) => String(c.id));
    reorderMutation.mutate({
      courseId,
      classIds: orderedIds,
    });
  };

  const handleSaveClass = async (formData: {
    courseId: CourseId;
    id?: string;
    title: string;
    description?: string;
    videoUrl: string;
    duration?: string;
    order?: number;
    isPublished?: boolean;
    resourceLink?: string;
  }) => {
    if (formData.id) {
      await updateMutation.mutateAsync({
        courseId,
        id: formData.id,
        title: formData.title,
        description: formData.description,
        videoUrl: formData.videoUrl,
        duration: formData.duration,
        order: formData.order,
        isPublished: formData.isPublished,
        resourceLink: formData.resourceLink,
      });
    } else {
      await createMutation.mutateAsync({
        courseId,
        title: formData.title,
        description: formData.description,
        videoUrl: formData.videoUrl,
        duration: formData.duration,
        order: formData.order,
        isPublished: formData.isPublished,
        resourceLink: formData.resourceLink,
      });
    }
  };

  return (
    <>
      <CourseClassesTab
        courseId={courseId}
        albumTitle={albumTitle}
        bundleId={bundleId}
        bundlePrice={bundlePrice}
        classes={classes}
        isLoading={isLoading}
        onOpenAddModal={handleOpenAdd}
        onOpenEditAlbumModal={() => setIsMetaModalOpen(true)}
        onOpenEditModal={handleOpenEdit}
        onTogglePublish={handleTogglePublish}
        onDeleteClass={handleDeleteClass}
        onMoveOrder={handleMoveOrder}
      />

      <CourseClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        courseId={courseId}
        courseTitle={albumTitle}
        editingClass={editingClass}
        onSave={handleSaveClass}
        isSaving={createMutation.isPending || updateMutation.isPending}
      />

      <CourseAlbumMetaModal
        isOpen={isMetaModalOpen}
        onClose={() => setIsMetaModalOpen(false)}
        courseId={courseId}
        meta={albumMeta}
        onSave={async (id, data) => {
          await updateMetaMutation.mutateAsync({ courseId: id, data });
        }}
        isSaving={updateMetaMutation.isPending}
      />
    </>
  );
};
