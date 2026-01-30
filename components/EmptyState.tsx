"use client";

import { ReactNode } from "react";
import Button from "./Button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && <div className="mb-4 text-6xl opacity-50">{icon}</div>}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md">{description}</p>
      {(action || secondaryAction) && (
        <div className="flex gap-3">
          {action && (
            <Button variant="primary" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="secondary" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Preset empty states for common scenarios
export function NoWorkoutsEmpty({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <EmptyState
      icon="💪"
      title="No workouts yet"
      description="Create your first workout to start your fitness journey. Build custom routines tailored to your goals."
      action={{
        label: "Create Your First Workout",
        onClick: onCreateClick,
      }}
    />
  );
}

export function NoExercisesEmpty() {
  return (
    <EmptyState
      icon="🔍"
      title="No exercises found"
      description="Try adjusting your search or filters to find what you're looking for."
    />
  );
}

export function NoSectionExercisesEmpty({ onAddClick }: { onAddClick: () => void }) {
  return (
    <EmptyState
      icon="➕"
      title="No exercises in this section"
      description="Add exercises from the exercise finder on the left to build your workout section."
      action={{
        label: "Browse Exercises",
        onClick: onAddClick,
      }}
    />
  );
}

export function NoTemplatesEmpty({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <EmptyState
      icon="📋"
      title="No templates available"
      description="Create a workout template to quickly build workouts in the future."
      action={{
        label: "Create Template",
        onClick: onCreateClick,
      }}
    />
  );
}

export function NoSearchResultsEmpty({ onClearFilters }: { onClearFilters?: () => void }) {
  return (
    <EmptyState
      icon="🔎"
      title="No results found"
      description="We couldn't find any matches for your search. Try different keywords or clear your filters."
      action={
        onClearFilters
          ? {
              label: "Clear Filters",
              onClick: onClearFilters,
            }
          : undefined
      }
    />
  );
}
