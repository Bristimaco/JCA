export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">JCA</h1>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
