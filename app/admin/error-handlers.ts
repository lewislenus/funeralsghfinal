"use client";

// This helper file contains common error handling patterns for the admin dashboard

import { toast } from "@/components/ui/use-toast";

// Shows a toast message for RLS permission errors
export function showServiceRoleKeyError() {
  toast({
    title: "Admin Permission Error",
    description: "To fix this, add either SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY to your .env.local file. Get this key from your Supabase project settings.",
    variant: "destructive",
    duration: 10000,
  });
}

// Shows a toast message for missing funeral errors
export function showFuneralNotFoundError() {
  toast({
    title: "Funeral Not Found",
    description: "The funeral you're trying to access doesn't exist or has been deleted.",
    variant: "destructive",
    duration: 5000,
  });
}

// Shows a generic error message with the specific error
export function showGenericError(message: string) {
  toast({
    title: "Error",
    description: message,
    variant: "destructive",
    duration: 5000,
  });
}

// Handles common error patterns for API calls
export function handleApiError(error: unknown) {
  console.error("API Error:", error);
  
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  
  if (errorMessage.includes('RLS') || errorMessage.includes('service role')) {
    showServiceRoleKeyError();
  } else if (errorMessage.includes('not found')) {
    showFuneralNotFoundError();
  } else {
    showGenericError("An error occurred: " + errorMessage);
  }
}
