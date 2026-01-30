"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Template } from "@/lib/types";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Link from "next/link";
import Toast from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";

export default function TemplatesPage() {
  return (
    <ProtectedRoute>
      <TemplatesContent />
    </ProtectedRoute>
  );
}

function TemplatesContent() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const loadTemplates = async () => {
      if (!user) return;

      try {
        const token = await user.getIdToken();
        const response = await fetch("/api/templates", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load templates");
        }

        const data = await response.json();
        setTemplates(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load templates");
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, [user]);

  const handleDelete = async (templateId: string) => {
    if (!user) return;

    setShowDeleteConfirm(templateId);
  };

  const confirmDelete = async () => {
    if (!user || !showDeleteConfirm) return;

    setDeletingId(showDeleteConfirm);
    setShowDeleteConfirm(null);

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/templates/${showDeleteConfirm}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete template");
      }

      // Remove from list
      setTemplates(templates.filter((t) => t.id !== showDeleteConfirm));
      setToast({ message: "Template deleted successfully", type: "success" });
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Failed to delete template", type: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  const handleDuplicate = async (template: Template) => {
    if (!user) return;

    try {
      const token = await user.getIdToken();

      // Create a copy without the id
      const { id, createdAt, updatedAt, ...templateData } = template;
      const duplicatedTemplate = {
        ...templateData,
        name: `${template.name} (Copy)`,
      };

      const response = await fetch("/api/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(duplicatedTemplate),
      });

      if (!response.ok) {
        throw new Error("Failed to duplicate template");
      }

      const newTemplate = await response.json();
      setTemplates([newTemplate, ...templates]);

      setToast({ message: "Template duplicated successfully!", type: "success" });
    } catch (err) {
      setToast({ message: err instanceof Error ? err.message : "Failed to duplicate template", type: "error" });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      warmup: "bg-orange-100 text-orange-700",
      core: "bg-blue-100 text-blue-700",
      cooldown: "bg-blue-100 text-blue-700",
      cardio: "bg-red-100 text-red-700",
      strength: "bg-blue-100 text-blue-700",
      custom: "bg-gray-100 text-gray-700",
    };
    return colors[category] || colors.custom;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <ConfirmModal
          title="Delete Template?"
          message="Are you sure you want to delete this template? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          confirmColor="red"
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteConfirm(null)}
        />
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-1">
        <div className="max-w-7xl mx-auto px-3">
          <h1 className="text-sm font-semibold">My Templates</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 py-1">
        {error && (
          <div className="mb-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        {templates.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-2 text-sm">No templates yet</p>
            <Link
              href="/template-builder"
              className="inline-block px-3 py-1.5 bg-green-600 text-white rounded text-xs font-semibold hover:bg-green-700"
            >
              Create Template
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded shadow p-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-gray-900 truncate flex-1">
                    {template.name}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${getCategoryColor(
                      template.category
                    )}`}
                  >
                    {template.category}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <span>{template.exercises.length} exercises</span>
                  <span>•</span>
                  <span>
                    {Math.ceil(
                      template.exercises.reduce(
                        (sum, ex) => sum + (ex.sets * ex.reps * 3 + ex.restSeconds),
                        0
                      ) / 60
                    )} min
                  </span>
                </div>

                <div className="flex gap-1">
                  <Link
                    href={`/template-builder?id=${template.id}`}
                    className="flex-1 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 text-center"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDuplicate(template)}
                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                    title="Duplicate"
                  >
                    <FontAwesomeIcon icon={faCopy} />
                  </button>
                  <button
                    onClick={() => handleDelete(template.id)}
                    disabled={deletingId === template.id}
                    className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 disabled:opacity-50"
                    title="Delete"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating + Button */}
      <Link
        href="/template-builder"
        className="fixed bottom-4 right-4 w-12 h-12 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 flex items-center justify-center z-10"
      >
        <FontAwesomeIcon icon={faPlus} className="text-xl" />
      </Link>
    </div>
  );
}
