import { Head } from '@inertiajs/react';

export default function Home() {
    return (
        <>
            <Head title="Home" />
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        JCA
                    </h1>
                    <p className="text-lg text-gray-600">
                        Laravel + React + PostgreSQL
                    </p>
                </div>
            </div>
        </>
    );
}
