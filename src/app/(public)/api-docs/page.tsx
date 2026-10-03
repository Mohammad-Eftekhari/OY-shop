import type { Metadata } from "next";

import { ApiDocs } from "@/components/shared/ApiDocs";

export const metadata: Metadata = {
  title: "API reference",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ApiDocsPage() {
  return (
    <div className="px-6 py-8">
      <ApiDocs />
    </div>
  );
}
