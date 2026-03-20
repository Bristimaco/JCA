import { Head, usePage } from '@inertiajs/react';
import AppLayout from '../Layouts/AppLayout';
import AdminPanel from './Dashboard/AdminPanel';

export default function Dashboard(props) {
    const { auth } = usePage().props;
    const role = auth.user.role;

    return (
        <AppLayout>
            <Head title="Dashboard" />

            {role === 'admin' && (
                <AdminPanel
                    pendingUsers={props.pendingUsers}
                    roles={props.roles}
                />
            )}

            {role !== 'admin' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
                    <p className="text-gray-600">
                        Welkom, {auth.user.name}!
                    </p>
                </div>
            )}
        </AppLayout>
    );
}
