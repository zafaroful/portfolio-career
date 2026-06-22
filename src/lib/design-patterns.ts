/**
 * Design system patterns — conventions used across the application.
 */

export const componentPatterns = {
  propNaming: [
    "Use isLoading, isEmpty, isPending for boolean states",
    "Use onEdit, onDelete, onConfirm for callbacks",
    "Prefer children over render props unless using Base UI triggers",
  ],
  sizeVariants: ["sm", "md (default)", "lg"],
  spacing: [
    "Page sections: space-y-6 (page-container)",
    "Form fields: space-y-4",
    "Inline actions: gap-2",
  ],
  states: [
    "Loading: LoadingState or DataTable isLoading",
    "Empty: EmptyState inside DataTable",
    "Error: toast.error for mutations, FormField error for validation",
  ],
} as const;

export const layoutPatterns = {
  dashboard: "DashboardShell → PageContainer → PageHeader + content",
  auth: "AuthLayout → centered Card form",
  public: "PublicLayout → max-w-5xl content area",
  cards: "Responsive grid: grid gap-4 sm:grid-cols-2 lg:grid-cols-N",
} as const;

export const interactionPatterns = {
  feedback: "Sonner toasts for create/update/delete success and errors",
  destructive: "ConfirmDialog before delete (optional, TableActions for inline)",
  forms: "FormField wraps Label + Input + error/description",
  navigation: "Active sidebar item uses sidebar-primary tokens",
} as const;
