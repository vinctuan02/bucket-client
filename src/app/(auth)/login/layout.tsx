export const metadata = {
    title: "Login",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
    // layout riêng, không dính header/sidebar
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            {children}
        </div>
    );
}
