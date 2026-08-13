import { Sidebar } from "@/components/nav/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-h-screen">
        <div className="max-w-4xl mx-auto px-8 py-10">{children}</div>
      </div>
    </div>
  );
}
