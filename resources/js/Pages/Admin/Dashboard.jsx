import { Head } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import AdminPanel from '../Dashboard/AdminPanel';

export default function Dashboard({ pendingUsers, users, roles, ageCategories, weightCategories }) {
    return (
        <AppLayout>
            <Head title="Admin" />
            <AdminPanel pendingUsers={pendingUsers} users={users} roles={roles} ageCategories={ageCategories} weightCategories={weightCategories} />
        </AppLayout>
    );
}
