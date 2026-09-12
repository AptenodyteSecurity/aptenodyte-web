import AccessibilitySettings from "@/components/AccessibilitySettings";
import AccountSettingsForm from "@/components/AccountSettingsForm";
import { getUserProfile } from "@/lib/auth/context";
import { signOut } from "@/lib/auth/actions";
import { ctaLoginClassName } from "@/lib/nav";

export default async function SettingsPage() {
  const profile = await getUserProfile();

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto w-full max-w-4xl flex-1 px-6 py-8"
    >
      <header>
        <h1 className="text-4xl font-bold tracking-tight text-black">
          Settings
        </h1>
        <p className="mt-3 text-lg text-zinc-800">
          Manage your account, password, and accessibility preferences.
        </p>
      </header>

      <AccountSettingsForm profile={profile} />

      <div className="mt-6 border-2 border-black bg-white p-6">
        <h2 className="text-xl font-bold text-black">Accessibility</h2>
        <p className="mt-2 text-sm text-zinc-700">
          Text size, contrast, and motion preferences for this browser.
        </p>
        <div className="mt-4">
          <AccessibilitySettings />
        </div>
      </div>

      <form action={signOut} className="mt-6">
        <button type="submit" className={`${ctaLoginClassName} rounded-2xl`}>
          Sign out
        </button>
      </form>
    </main>
  );
}
