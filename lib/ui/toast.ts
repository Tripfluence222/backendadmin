import { toast } from "sonner";

// Re-export toast for direct usage
export { toast };

export const showToast = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 4000,
    });
  },

  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 6000,
    });
  },

  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 4000,
    });
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 5000,
    });
  },

  loading: (message: string) => {
    return toast.loading(message);
  },

  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId);
  },

  promise: <T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(promise, {
      loading,
      success,
      error,
    });
  },
};

// Common toast messages
export const toastMessages = {
  // Success messages
  created: (entity: string) => `${entity} created successfully`,
  updated: (entity: string) => `${entity} updated successfully`,
  deleted: (entity: string) => `${entity} deleted successfully`,
  published: (entity: string) => `${entity} published successfully`,
  refunded: (amount: number) => `Refund of $${amount} processed successfully`,
  synced: (entity: string) => `${entity} synced successfully`,
  
  // Error messages
  createFailed: (entity: string) => `Failed to create ${entity}`,
  updateFailed: (entity: string) => `Failed to update ${entity}`,
  deleteFailed: (entity: string) => `Failed to delete ${entity}`,
  publishFailed: (entity: string) => `Failed to publish ${entity}`,
  refundFailed: () => "Failed to process refund",
  syncFailed: (entity: string) => `Failed to sync ${entity}`,
  
  // Info messages
  loading: (action: string) => `${action}...`,
  saving: () => "Saving...",
  processing: () => "Processing...",
  uploading: () => "Uploading...",
  
  // Warning messages
  unsavedChanges: () => "You have unsaved changes",
  confirmDelete: (entity: string) => `Are you sure you want to delete this ${entity}?`,
  permissionDenied: () => "You don't have permission to perform this action",
};
