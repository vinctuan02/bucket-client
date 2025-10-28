// app/layout.tsx
import "@/app/(main)/globals.css"

export const metadata = {
    title: "My App",
    description: "Next.js app",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
