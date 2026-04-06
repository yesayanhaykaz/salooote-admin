import Sidebar from "@/components/Sidebar";
import { ADMIN_NAV } from "@/lib/data";

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-surface-50">
      <Sidebar nav={ADMIN_NAV} role="admin" userName="Haykaz Yesayan" userEmail="haykaz@salooote.am" />
      <div className="flex-1 ml-[228px] flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}
