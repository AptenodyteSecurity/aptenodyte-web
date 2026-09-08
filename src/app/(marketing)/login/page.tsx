import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Login — Aptenodyte",
  description: "Sign in to your Aptenodyte workspace.",
};

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath =
    params.next && params.next.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : "/dashboard";

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex flex-1 flex-col items-center justify-center px-6 py-16"
    >
      <LoginForm nextPath={nextPath} />
    </main>
  );
}
