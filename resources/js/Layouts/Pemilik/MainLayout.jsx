import { useState } from "react";
import Sidebar from "@/components/Pemilik/Sidebar";
import Header from "@/components/Pemilik/Header";

export default function MainLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F2F4F3] dark:bg-gray-950">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      <Header isOpen={isOpen} setIsOpen={setIsOpen} />

      <main
        className={`
          pt-[60px] min-h-screen
          transition-all duration-300 ease-in-out
          ${isOpen ? "ml-56" : "ml-0"}
        `}
      >
        <div className="p-6 space-y-4">
          {children}
        </div>
      </main>
    </div>
  );
}