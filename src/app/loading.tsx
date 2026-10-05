import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div
      className="mx-auto flex w-full max-w-lg flex-col gap-3 px-6 py-16"
      aria-busy="true"
      aria-live="polite"
    >
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full max-w-lg" />
      <Skeleton className="h-4 w-full max-w-md" />
    </div>
  );
}
