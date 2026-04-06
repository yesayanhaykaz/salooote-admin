import Sidebar from "@/components/Sidebar";
import { VENDOR_NAV } from "@/lib/data";

export default function VendorLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-surface-50">
      <Sidebar nav={VENDOR_NAV} role="vendor" userName="Sweet Dreams Bakery" userEmail="vendor@salooote.am" />
      <div className="flex-1 ml-[228px] flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}
