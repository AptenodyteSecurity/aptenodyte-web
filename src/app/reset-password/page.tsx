import type { Metadata } from "next";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "Choose a new password — Aptenodyte",
  description: "Set a new Aptenodyte account password.",
};

export default function ResetPasswordPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex flex-1 flex-col items-center justify-center px-6 py-16"
    >
      <ResetPasswordForm />
    </main>
  );
}
