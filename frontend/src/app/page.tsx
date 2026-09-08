"use client";

import dynamic from "next/dynamic";

const ItemsApp = dynamic(
  () => import("@/components/items-app").then((mod) => mod.ItemsApp),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
        Loading registry…
      </div>
    ),
  },
);

export default function Home() {
  return <ItemsApp />;
}
