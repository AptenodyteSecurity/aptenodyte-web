import type { Metadata } from "next";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset password — Aptenodyte",
  description: "Request an Aptenodyte password reset email.",
};

export default function ForgotPasswordPage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex flex-1 flex-col items-center justify-center px-6 py-16"
    >
      <ForgotPasswordForm />
    </main>
  );
}
