import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: todos, error } = await supabase
    .from("todos")
    .select("id, title, is_complete")
    .order("id");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-xl flex-col gap-6 px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Next.js + Supabase
        </h1>

        {error ? (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            <p className="font-medium">Couldn&apos;t reach Supabase</p>
            <p className="mt-1 font-mono text-xs">{error.message}</p>
          </div>
        ) : (
          <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
              Live rows from the <code>todos</code> table:
            </p>
            <ul className="flex flex-col gap-2">
              {todos?.map((todo) => (
                <li
                  key={todo.id}
                  className="flex items-center gap-2 text-black dark:text-zinc-50"
                >
                  <span>{todo.is_complete ? "✅" : "⬜"}</span>
                  <span>{todo.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Edit{" "}
          <code className="rounded bg-black/[.06] px-1.5 py-0.5 font-mono text-[0.9em] dark:bg-white/[.08]">
            src/app/page.tsx
          </code>{" "}
          to get started.
        </p>
      </main>
    </div>
  );
}
