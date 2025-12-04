import { Navbar } from "@/components/shared/Navbar";

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            {children}
            <footer className="bg-white border-t border-gray-100 py-12">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
                    © {new Date().getFullYear()} School Breeze. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
