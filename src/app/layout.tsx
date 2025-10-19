import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#f0f0f0]">
        {/* Sidebar cố định */}
        <Sidebar />

        {/* Khối nội dung chính */}
        <div className="ml-[19vw] p-6 min-h-screen">
          <Header />
          <main className="mt-6 bg-white rounded-xl shadow-sm p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
