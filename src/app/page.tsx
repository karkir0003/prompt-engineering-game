import Link from "next/link";
import { requireGuest } from "@/lib/supabase/auth";

export default async function Home() {
  await requireGuest();

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Welcome to Promptle</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            A daily prompt engineering challenge. Recreate the target image with your best prompt!
          </p>
        </div>

        <div className="flex flex-col gap-4 pt-6">
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Get Started
          </Link>
        </div>
      </div>
    </main>
  );
}
