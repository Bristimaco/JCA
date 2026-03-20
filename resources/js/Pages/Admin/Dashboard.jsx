import { Head } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import AdminPanel from '../Dashboard/AdminPanel';

export default function Dashboard({ pendingUsers, roles }) {
    return (
        <AppLayout>
            <Head title="Admin" />
            <AdminPanel pendingUsers={pendingUsers} roles={roles} />
        </AppLayout>
    );
}
