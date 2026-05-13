import { Suspense } from "react";
import DashboardMain from "@/components/DashboardMain";

/**
 * Required for `output: 'export'` with dynamic routes.
 * Returns an empty array because doc IDs are runtime-generated (from backend).
 * Client-side navigation (router.push) handles actual routing — S3 is configured
 * to serve index.html for all 404s (SPA fallback).
 */
export function generateStaticParams() {
  return [];
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="h-10 w-10 border-4 border-gray-100 border-t-[#12b8cd] rounded-full animate-spin" /></div>}>
      <DashboardMain />
    </Suspense>
  );
}
