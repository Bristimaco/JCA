import { Head } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import AdminPanel from '../Dashboard/AdminPanel';

export default function Dashboard({ pendingUsers, users, roles, ageCategories, weightCategories, allMembers, clubSettings, renewalDueCount, renewalDueMembers, trainingGroups, trainers, invoices, vouchers }) {
    return (
        <AppLayout>
            <Head title="Admin" />
            <AdminPanel pendingUsers={pendingUsers} users={users} roles={roles} ageCategories={ageCategories} weightCategories={weightCategories} allMembers={allMembers} clubSettings={clubSettings} renewalDueCount={renewalDueCount} renewalDueMembers={renewalDueMembers} trainingGroups={trainingGroups} trainers={trainers} invoices={invoices} vouchers={vouchers} />
        </AppLayout>
    );
}
