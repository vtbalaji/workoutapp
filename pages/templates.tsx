"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Template } from "@/lib/types";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Link from "next/link";
import Toast from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faTrash, faEdit, faPlus } from "@fortawesome/free-solid-svg-icons";

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
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-3">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">My Templates</h1>
              <p className="text-blue-100 text-sm">
                Create and manage reusable exercise templates
              </p>
            </div>
            <Link
              href="/template-builder"
              className="px-6 py-3 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faPlus} />
              New Template
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {templates.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No templates yet
            </h2>
            <p className="text-gray-600 mb-6">
              Create your first template to get started
            </p>
            <Link
              href="/template-builder"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Create Template
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  {/* Category Badge */}
                  <div className="mb-3">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${getCategoryColor(
                        template.category
                      )}`}
                    >
                      {template.category}
                    </span>
                  </div>

                  {/* Template Name */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {template.name}
                  </h3>

                  {/* Description */}
                  {template.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {template.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span className="font-semibold">
                      {template.exercises.length} exercises
                    </span>
                    <span>•</span>
                    <span>
                      {Math.ceil(
                        template.exercises.reduce(
                          (sum, ex) =>
                            sum + (ex.sets * ex.reps * 3 + ex.restSeconds),
                          0
                        ) / 60
                      )}{" "}
                      min
                    </span>
                  </div>

                  {/* Exercise Preview */}
                  <div className="mb-4 text-sm text-gray-600">
                    {template.exercises.slice(0, 3).map((ex, idx) => (
                      <div key={idx} className="truncate">
                        • {ex.exerciseName} ({ex.sets}x{ex.reps})
                      </div>
                    ))}
                    {template.exercises.length > 3 && (
                      <div className="text-gray-500 italic">
                        +{template.exercises.length - 3} more...
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/template-builder?id=${template.id}`}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-center font-medium hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDuplicate(template)}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors text-sm"
                      title="Duplicate"
                    >
                      <FontAwesomeIcon icon={faCopy} />
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      disabled={deletingId === template.id}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors disabled:opacity-50 text-sm"
                      title="Delete"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>

                {/* Footer with timestamp */}
                <div className="bg-gray-50 px-6 py-3 text-xs text-gray-500">
                  Updated{" "}
                  {new Date(template.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
