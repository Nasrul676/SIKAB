"use client";
import { useFormStatus } from "react-dom";

// Submit Button Component using useFormStatus
export function SubmitButton({ type }: { type: "create" | "update"; }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`bg-blue-400 text-white p-2 rounded-md ${pending ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {pending
        ? type === "create"
          ? "Creating..."
          : "Updating..."
        : type === "create"
          ? "Create"
          : "Update"}
    </button>
  );
}
