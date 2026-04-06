import Sidebar from "@/components/Sidebar";
import { USER_NAV } from "@/lib/data";

export default function UserLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-surface-50">
      <Sidebar nav={USER_NAV} role="user" userName="Anna Hovhannisyan" userEmail="anna@example.com" />
      <div className="flex-1 ml-[228px] flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}
