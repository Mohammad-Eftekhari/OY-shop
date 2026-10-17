import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div
      className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-16"
      aria-busy="true"
      aria-live="polite"
    >
      <Skeleton className="h-10 w-48 rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-3">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    </div>
  );
}
