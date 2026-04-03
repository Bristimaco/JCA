import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../Layouts/AppLayout';
import TournamentStepper from '../Components/TournamentStepper';

const moduleIcons = {
    'Mijn Leden': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
    ),
    'Leden': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>
    ),
    'Toernooien': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-3.52 1.522m0 0a6.003 6.003 0 01-3.52-1.522" /></svg>
    ),
    'Mijn Toernooien': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-3.52 1.522m0 0a6.003 6.003 0 01-3.52-1.522" /></svg>
    ),
    'Archief': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
    ),
    'Trainingsgroepen': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>
    ),
    'Kassa': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>
    ),
    'Facturen': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
    ),
    'Vouchers': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" /></svg>
    ),
    'Aan te vullen': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 11.625l2.25-2.25M12 11.625l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
    ),
    'Kassa Producten': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" /></svg>
    ),
    'Verkoopstatistieken': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
    ),
    'Sponsors': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
    ),
    'Prospectie': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
    ),
    'Mededelingen': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" /></svg>
    ),
    'Uitgenodigd': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
    ),
    'Ingeschreven': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 011.65 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75" /></svg>
    ),
    'Betaald': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>
    ),
    'Evenementen': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" /></svg>
    ),
    'Evenementen Beheer': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
    ),
    'Activiteit': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
    ),
    'Test Log': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
    ),
    'Kalender': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" /></svg>
    ),
    'Extra Training': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" /></svg>
    ),
    'Bestelling Plaatsen': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
    ),
    'Bestellingen': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
    ),
    'Poef': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
    'Mijn Poef': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>
    ),
    'Club Instellingen': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    ),
    'Gebruikersbeheer': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
    ),
    'Leeftijdscategorieën': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
    ),
    'Gewichtscategorieën': (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-13.5 0L2.633 15.57c-.122.499.106 1.028.589 1.202a5.989 5.989 0 002.031.352 5.989 5.989 0 002.031-.352c.483-.174.711-.703.59-1.202L5.25 4.971z" /></svg>
    ),
};

const moduleColors = {
    'Mijn Leden': 'from-rose-600 to-red-800',
    'Leden': 'from-rose-700 to-rose-600',
    'Trainingsgroepen': 'from-amber-600 to-orange-700',
    'Toernooien': 'from-red-700 to-rose-600',
    'Mijn Toernooien': 'from-rose-600 to-pink-700',
    'Archief': 'from-slate-600 to-slate-500',
    'Kassa': 'from-emerald-600 to-teal-700',
    'Facturen': 'from-blue-600 to-indigo-700',
    'Vouchers': 'from-purple-600 to-violet-700',
    'Aan te vullen': 'from-amber-600 to-yellow-700',
    'Kassa Producten': 'from-emerald-700 to-teal-800',
    'Verkoopstatistieken': 'from-indigo-600 to-purple-700',
    'Sponsors': 'from-pink-600 to-rose-700',
    'Prospectie': 'from-teal-600 to-cyan-700',
    'Mededelingen': 'from-cyan-600 to-teal-700',
    'Uitgenodigd': 'from-yellow-500 to-amber-600',
    'Ingeschreven': 'from-orange-500 to-orange-700',
    'Betaald': 'from-green-500 to-emerald-700',
    'Evenementen': 'from-orange-600 to-amber-700',
    'Evenementen Beheer': 'from-orange-700 to-red-700',
    'Activiteit': 'from-indigo-600 to-purple-700',
    'Test Log': 'from-amber-600 to-orange-700',
    'Kalender': 'from-sky-600 to-blue-700',
    'Extra Training': 'from-orange-600 to-orange-700',
    'Bestelling Plaatsen': 'from-lime-600 to-green-700',
    'Bestellingen': 'from-teal-600 to-emerald-700',
    'Poef': 'from-amber-500 to-orange-600',
    'Mijn Poef': 'from-amber-500 to-yellow-600',
    'Club Instellingen': 'from-slate-600 to-slate-700',
    'Gebruikersbeheer': 'from-rose-600 to-red-700',
    'Leeftijdscategorieën': 'from-sky-600 to-blue-700',
    'Gewichtscategorieën': 'from-indigo-600 to-violet-700',
};

const moduleGroups = [
    {
        title: 'Leden',
        modules: [
            { name: 'Mijn Leden', href: '/mijn-leden', roles: ['parent', 'member', 'admin', 'coach', 'barmedewerker'] },
            { name: 'Leden', href: '/admin/members', roles: ['admin'], extraModule: 'members' },
            { name: 'Facturen', href: '/admin/facturen', roles: ['admin'], extraModule: 'members' },
            { name: 'Vouchers', href: '/admin/vouchers', roles: ['admin'], extraModule: 'members' },
        ],
    },
    {
        title: 'Trainingen',
        modules: [
            { name: 'Trainingsgroepen', href: '/trainer/training-groups', roles: ['coach', 'admin'], extraModule: 'training' },
            { name: 'Extra Training', href: '/trainer/extra-training', roles: ['coach', 'admin'], extraModule: 'training' },
        ],
    },
    {
        title: 'Toernooien',
        modules: [
            { name: 'Mijn Toernooien', href: '/mijn-toernooien', roles: ['parent', 'member', 'admin', 'coach', 'barmedewerker'] },
            { name: 'Toernooien', href: '/admin/tournaments', roles: ['admin', 'coach'], extraModule: 'tournaments' },
            { name: 'Archief', href: '/archief', roles: ['parent', 'member', 'admin', 'coach', 'barmedewerker'] },
        ],
    },
    {
        title: 'Kantine',
        modules: [
            { name: 'Bestelling Plaatsen', href: '/bestelling', roles: ['parent', 'member', 'admin', 'coach', 'barmedewerker'] },
            { name: 'Mijn Poef', href: '/mijn-poef', roles: ['parent', 'member', 'admin', 'coach', 'barmedewerker'] },
            { name: 'Kassa', href: '/pos', roles: ['barmedewerker', 'admin'], extraModule: 'bar' },
            { name: 'Bestellingen', href: '/pos/bestellingen', roles: ['barmedewerker', 'admin'], extraModule: 'bar' },
            { name: 'Poef', href: '/pos/poef', roles: ['barmedewerker', 'admin'], extraModule: 'bar' },
            { name: 'Kassa Producten', href: '/admin/bar-products', roles: ['admin'], extraModule: 'bar' },
            { name: 'Aan te vullen', href: '/admin/aan-te-vullen', roles: ['admin'], extraModule: 'bar' },
            { name: 'Verkoopstatistieken', href: '/admin/verkoop-statistieken', roles: ['admin'], extraModule: 'bar' },
        ],
    },
    {
        title: 'Evenementen',
        modules: [
            { name: 'Uitgenodigd', href: '/evenementen?filter=uitgenodigd', roles: ['parent', 'member', 'admin', 'coach', 'barmedewerker'] },
            { name: 'Ingeschreven', href: '/evenementen?filter=ingeschreven', roles: ['parent', 'member', 'admin', 'coach', 'barmedewerker'] },
            { name: 'Betaald', href: '/evenementen?filter=betaald', roles: ['parent', 'member', 'admin', 'coach', 'barmedewerker'] },
            { name: 'Evenementen', href: '/evenementen', roles: ['parent', 'member', 'admin', 'coach', 'barmedewerker'] },
            { name: 'Evenementen Beheer', href: '/admin/evenementen', roles: ['admin'], extraModule: 'events' },
            { name: 'Mededelingen', href: '/admin/mededelingen', roles: ['admin'], extraModule: 'announcements' },
        ],
    },
    {
        title: 'Sponsoring',
        modules: [
            { name: 'Sponsors', href: '/admin/sponsors', roles: ['admin'], extraModule: 'sponsors' },
            { name: 'Prospectie', href: '/admin/prospectie', roles: ['admin'], extraModule: 'sponsors' },
        ],
    },
    {
        title: 'Beheer',
        modules: [
            { name: 'Club Instellingen', href: '/admin/club-instellingen', roles: ['admin'], extraModule: 'admin' },
            { name: 'Gebruikersbeheer', href: '/admin/gebruikers', roles: ['admin'], extraModule: 'admin' },
            { name: 'Leeftijdscategorieën', href: '/admin/leeftijdscategorieen', roles: ['admin'], extraModule: 'admin' },
            { name: 'Gewichtscategorieën', href: '/admin/gewichtscategorieen', roles: ['admin'], extraModule: 'admin' },
            { name: 'Activiteit', href: '/admin/activiteit', roles: ['admin'], extraModule: 'admin' },
            { name: 'Test Log', href: '/admin/test-mode-log', roles: ['admin'], extraModule: 'admin' },
        ],
    },
];

export default function Dashboard({ pendingCount, pendingUsers, adminCounters, barCounters, memberStats, myMemberCount, myPoefCount, myEventCount, invitedEventCount, registeredEventCount, paidEventCount, archivedTournamentCount, myTournamentCount, activeTournaments, coachTournaments, coachTrainingGroups, upcomingTournaments, coachTournamentCount, recentArchived, activeTrainingSessions, extraTrainings }) {
    const { auth } = usePage().props;
    const role = auth.user.role;
    const extraModules = auth.user.extra_modules || [];
    const [expandedGroups, setExpandedGroups] = useState(() => {
        try { return JSON.parse(localStorage.getItem('dashboard-expanded-groups')) || {}; } catch { return {}; }
    });

    const toggleGroup = (title) => {
        setExpandedGroups((prev) => {
            const next = { ...prev, [title]: !prev[title] };
            localStorage.setItem('dashboard-expanded-groups', JSON.stringify(next));
            return next;
        });
    };

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="mb-2">
                <h1 className="text-xl font-bold text-stone-100 tracking-tight">Dashboard</h1>
                <p className="text-slate-400 text-xs">Welkom terug, {auth.user.name}</p>
            </div>

            <div className="mb-3">
                <Link
                    href="/kalender"
                    className="inline-flex items-center gap-2 bg-slate-900 rounded-xl shadow-sm ring-1 ring-slate-800 border-t-2 border-t-rose-700/40 px-4 py-2.5 hover:shadow-md hover:ring-rose-500/40 hover:-translate-y-0.5 transition-all"
                >
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${moduleColors['Kalender']} flex items-center justify-center text-white shadow-sm [&_svg]:w-3.5 [&_svg]:h-3.5`}>
                        {moduleIcons['Kalender']}
                    </div>
                    <span className="text-sm font-semibold text-white">Kalender</span>
                </Link>
            </div>

            {(() => {
                const filtered = moduleGroups.map((group) => ({
                    ...group,
                    visibleModules: group.modules.filter((m) => m.roles.includes(role) || (m.extraModule && extraModules.includes(m.extraModule))),
                })).filter((g) => g.visibleModules.length > 0);

                const counts = {
                    'Leden': memberStats?.total,
                    'Mijn Leden': myMemberCount,
                    'Toernooien': adminCounters?.activeTournamentCount ?? coachTournamentCount,
                    'Mijn Toernooien': myTournamentCount,
                    'Facturen': adminCounters?.pendingInvoiceCount,
                    'Vouchers': adminCounters?.activeVoucherCount,
                    'Aan te vullen': adminCounters?.refillProductCount,
                    'Sponsors': adminCounters?.activeSponsorCount,
                    'Prospectie': adminCounters?.prospectCount,
                    'Mededelingen': adminCounters?.activeAnnouncementCount,
                    'Uitgenodigd': invitedEventCount,
                    'Ingeschreven': registeredEventCount,
                    'Betaald': paidEventCount,
                    'Evenementen Beheer': adminCounters?.activeEventCount,
                    'Evenementen': myEventCount,
                    'Archief': archivedTournamentCount,
                    'Bestellingen': barCounters?.pendingOrderCount,
                    'Poef': barCounters?.unpaidPoefCount,
                    'Mijn Poef': myPoefCount,
                    'Gebruikersbeheer': pendingCount,
                };

                return (
                    <div className="space-y-1">
                        {filtered.map((g) => {
                            const isOpen = expandedGroups[g.title] || false;
                            return (
                                <div key={g.title}>
                                    <button
                                        onClick={() => toggleGroup(g.title)}
                                        className="w-full flex items-center gap-1.5 py-1.5 text-left"
                                    >
                                        <svg className={`w-3 h-3 text-slate-500 transition-transform ${isOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                        </svg>
                                        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{g.title}</h2>
                                    </button>
                                    {isOpen && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pb-1">
                                            {g.visibleModules.map((m) => (
                                                <ModuleTile key={m.name} m={m} moduleColors={moduleColors} moduleIcons={moduleIcons} counts={counts} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                );
            })()}

            {activeTournaments && activeTournaments.length > 0 && (
                <ActiveTournaments tournaments={activeTournaments} />
            )}

            {coachTournaments && coachTournaments.length > 0 && (
                <CoachTournaments tournaments={coachTournaments} />
            )}

            {coachTrainingGroups && coachTrainingGroups.length > 0 && (
                <CoachTrainingGroups groups={coachTrainingGroups} />
            )}

            {extraTrainings && extraTrainings.length > 0 && (
                <ExtraTrainings trainings={extraTrainings} />
            )}

            {activeTrainingSessions && activeTrainingSessions.length > 0 && (
                <ActiveTrainingSessions sessions={activeTrainingSessions} />
            )}
        </AppLayout>
    );
}

function ModuleTile({ m, moduleColors, moduleIcons, counts }) {
    const count = counts[m.name];
    return (
        <Link
            href={m.href}
            className="group bg-slate-900 rounded-xl shadow-sm ring-1 ring-slate-800 border-t-2 border-t-rose-700/40 p-2 hover:shadow-md hover:ring-rose-500/40 hover:-translate-y-0.5"
        >
            <div className="flex flex-col items-center text-center">
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${moduleColors[m.name]} flex items-center justify-center text-white mb-1 shadow-sm group-hover:scale-105 [&_svg]:w-3.5 [&_svg]:h-3.5`}>
                    {moduleIcons[m.name]}
                </div>
                <span className="text-sm font-semibold text-white">{m.name}</span>
                {count !== undefined && count !== null && (
                    <span className="mt-0.5 inline-flex items-center rounded-full bg-slate-800 px-1.5 py-0 text-xs font-medium text-slate-300">
                        {count}
                    </span>
                )}
            </div>
        </Link>
    );
}

function ActiveTournaments({ tournaments }) {
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('nl-BE');
    };

    return (
        <div className="mt-10">
            <div className="flex items-center gap-2 mb-4">
                <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </div>
                <h2 className="text-lg font-semibold text-white">Lopende Toernooien</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tournaments.map(t => (
                    <Link key={t.id} href={`/toernooien/${t.id}`} className="group bg-slate-900 rounded-xl shadow-sm ring-2 ring-red-700/50 overflow-hidden hover:shadow-md hover:ring-red-500/60 hover:-translate-y-0.5">
                        {t.latitude && t.longitude && (
                            <iframe
                                title={`Locatie ${t.name}`}
                                width="100%"
                                height="140"
                                className="border-b border-slate-800 pointer-events-none"
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${t.longitude - 0.01},${t.latitude - 0.01},${parseFloat(t.longitude) + 0.01},${parseFloat(t.latitude) + 0.01}&layer=mapnik&marker=${t.latitude},${t.longitude}`}
                            />
                        )}
                        <div className="p-4">
                            <div className="flex items-center gap-2">
                                <TournamentStepper status={t.status || 'started'} compact />
                                <p className="font-semibold text-white">{t.name}</p>
                            </div>
                            <p className="text-sm text-slate-400 mt-1">{formatDate(t.tournament_date)}</p>
                            <p className="text-xs text-slate-500 mt-1">
                                {[t.address_street, t.address_postal_code, t.address_city].filter(Boolean).join(', ') || 'Geen adres'}
                            </p>
                            <p className="mt-3 text-xs font-medium text-rose-400 group-hover:text-rose-300">Bekijk details →</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

function CoachTournaments({ tournaments }) {
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('nl-BE');
    };

    const statusColors = {
        started: 'bg-emerald-900/40 text-emerald-400',
        finished: 'bg-purple-900/40 text-purple-400',
    };

    return (
        <div className="mt-10">
            <h2 className="text-lg font-semibold text-white mb-4">
                Mijn Toernooien als Trainer
                <span className="ml-2 inline-flex items-center rounded-full bg-rose-900/40 px-2.5 py-0.5 text-xs font-medium text-rose-400">
                    {tournaments.length}
                </span>
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tournaments.map(t => (
                    <Link
                        key={t.id}
                        href={`/trainer/toernooien/${t.id}`}
                        className="group bg-slate-900 rounded-xl shadow-sm ring-2 ring-rose-700/40 overflow-hidden hover:shadow-md hover:ring-rose-500/50 hover:-translate-y-0.5"
                    >
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <TournamentStepper status={t.status} compact />
                                <span className="inline-flex items-center rounded-full bg-rose-900/40 px-2 py-0.5 text-xs font-semibold text-rose-400">
                                    Trainer
                                </span>
                            </div>
                            <p className="font-semibold text-white">{t.name}</p>
                            <p className="text-sm text-slate-400 mt-1">{formatDate(t.tournament_date)}</p>
                            <p className="text-xs text-slate-500 mt-1">
                                {[t.address_street, t.address_postal_code, t.address_city].filter(Boolean).join(', ') || 'Geen adres'}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">{t.participant_count} deelnemers</p>
                            <p className="mt-3 text-xs text-rose-400 font-semibold group-hover:text-rose-300">Resultaten invullen →</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

function ActiveTrainingSessions({ sessions }) {
    const handleToggle = (sessionId, memberId) => {
        router.post(`/attendance/session/${sessionId}/toggle`, { member_id: memberId }, { preserveScroll: true });
    };

    return (
        <div className="mt-10">
            <div className="flex items-center gap-2 mb-4">
                <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </div>
                <h2 className="text-lg font-semibold text-white">Actieve Trainingen</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sessions.map(s => (
                    <div key={`${s.session_id}-${s.member_id}`} className="bg-slate-900 rounded-xl shadow-sm ring-1 ring-slate-800 border-t-2 border-t-emerald-600/60 overflow-hidden">
                        <div className="p-4">
                            <p className="font-semibold text-white">{s.group_name}</p>
                            <p className="text-sm text-emerald-400 mt-0.5">{s.member_name}</p>
                            <p className="text-sm text-slate-400 mt-1">{s.day} {s.start_time}{s.end_time ? `–${s.end_time}` : ''}</p>
                            {s.trainer_name && <p className="text-xs text-slate-500 mt-1">Trainer: {s.trainer_name}</p>}
                            {s.absent && (
                                <p className="mt-2 text-xs text-amber-400 font-medium">⚠ Afwezig gemeld via kalender</p>
                            )}
                            <button
                                onClick={() => handleToggle(s.session_id, s.member_id)}
                                className={`mt-3 w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${s.attending
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md'
                                    : s.absent
                                        ? 'bg-amber-900/40 text-amber-300 hover:bg-amber-900/60 ring-1 ring-amber-700/50'
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 ring-1 ring-slate-700'
                                    }`}
                            >
                                {s.attending ? '✓ Aanwezig' : 'Aanwezig melden'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function CoachTrainingGroups({ groups }) {
    const { auth } = usePage().props;
    const [expandedId, setExpandedId] = useState(null);
    const [closingSession, setClosingSession] = useState(null);
    const [remarks, setRemarks] = useState('');

    const handleOpenSession = (scheduleId) => {
        router.post('/trainer/sessions/open', { training_schedule_id: scheduleId }, { preserveScroll: true });
    };

    const handleCloseSession = () => {
        if (!closingSession) return;
        router.patch(`/trainer/sessions/${closingSession}/close`, { remarks: remarks || null }, {
            preserveScroll: true,
            onSuccess: () => {
                setClosingSession(null);
                setRemarks('');
            },
        });
    };

    const todayGroups = groups
        .map(g => ({ ...g, schedules: g.schedules?.filter(s => s.is_today) || [] }))
        .filter(g => g.schedules.length > 0);

    return (
        <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">
                    Trainingen vandaag
                    <span className="ml-2 inline-flex items-center rounded-full bg-rose-900/40 px-2.5 py-0.5 text-xs font-medium text-rose-400">
                        {todayGroups.length}
                    </span>
                </h2>
                <Link href="/trainer/sessions" className="text-sm font-medium text-rose-400 hover:text-rose-300">
                    Historiek →
                </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {todayGroups.map(g => (
                    <div key={g.id} className="bg-slate-900 rounded-xl shadow-sm ring-1 ring-slate-800 border-t-2 border-t-rose-700/40 overflow-hidden">
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-white">{g.name}</p>
                            </div>

                            {g.schedules?.map((s, i) => (
                                <div key={i} className="mt-2 p-2 rounded-lg bg-slate-800/50 ring-1 ring-slate-700/50">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-400">
                                            {s.day} {s.start_time}{s.end_time ? `–${s.end_time}` : ''}{s.trainer_name ? ` (${s.trainer_name})` : ''}
                                        </span>
                                        {s.trainer_id === auth.user.id && (
                                            <>
                                                {s.session?.is_open ? (
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-900/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                                                                <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
                                                                {s.session.attendance_count} aanwezig
                                                            </span>
                                                            <button
                                                                onClick={() => { setClosingSession(s.session.id); setRemarks(''); }}
                                                                className="rounded-md bg-red-900/30 px-2 py-1 text-[10px] font-semibold text-red-400 hover:bg-red-900/50 ring-1 ring-red-700/30"
                                                            >
                                                                Sluiten
                                                            </button>
                                                        </div>
                                                        {(() => {
                                                            const notifiedAbsent = g.members.filter(m => !s.session.attendee_ids?.includes(m.id) && s.session.notified_absent_ids?.includes(m.id));
                                                            const unnotifiedAbsent = g.members.filter(m => !s.session.attendee_ids?.includes(m.id) && !s.session.notified_absent_ids?.includes(m.id));
                                                            return (notifiedAbsent.length > 0 || unnotifiedAbsent.length > 0) ? (
                                                                <div className="mt-1.5 space-y-0.5">
                                                                    {notifiedAbsent.length > 0 && (
                                                                        <div><span className="text-[10px] text-amber-400/80">⚠ Gemeld afwezig: {notifiedAbsent.map(m => m.name).join(', ')}</span></div>
                                                                    )}
                                                                    {unnotifiedAbsent.length > 0 && (
                                                                        <div><span className="text-[10px] text-red-400/70">Afwezig: {unnotifiedAbsent.map(m => m.name).join(', ')}</span></div>
                                                                    )}
                                                                </div>
                                                            ) : null;
                                                        })()}
                                                    </div>
                                                ) : s.session?.closed_at ? (
                                                    <span className="inline-flex items-center rounded-full bg-slate-700 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                                                        Afgesloten ({s.session.attendance_count})
                                                    </span>
                                                ) : s.is_today ? (
                                                    <button
                                                        onClick={() => handleOpenSession(s.id)}
                                                        className="rounded-md bg-emerald-900/30 px-2 py-1 text-[10px] font-semibold text-emerald-400 hover:bg-emerald-900/50 ring-1 ring-emerald-700/30"
                                                    >
                                                        Start training
                                                    </button>
                                                ) : null}
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {g.location && <p className="text-xs text-slate-500 mt-2">{g.location}</p>}
                            {g.description && <p className="text-xs text-slate-500 mt-1">{g.description}</p>}
                            <button
                                onClick={() => setExpandedId(expandedId === g.id ? null : g.id)}
                                className="mt-2 text-xs font-medium text-rose-400 hover:text-rose-300"
                            >
                                {g.member_count} {g.member_count === 1 ? 'lid' : 'leden'} {expandedId === g.id ? '▲' : '▼'}
                            </button>
                            {expandedId === g.id && (
                                <div className="mt-2 pt-2 border-t border-slate-800">
                                    {g.members.length === 0 ? (
                                        <p className="text-xs text-slate-500">Geen leden in deze groep.</p>
                                    ) : (
                                        <ul className="space-y-1">
                                            {g.members.map(m => (
                                                <li key={m.id} className="text-xs text-slate-300">{m.name}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {closingSession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-slate-900 rounded-xl shadow-xl ring-1 ring-slate-700 w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Training afsluiten</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-300 mb-1">Opmerking (optioneel)</label>
                            <textarea
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                rows={3}
                                className="w-full rounded-md border border-slate-600 bg-slate-700/50 text-white shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
                                placeholder="Eventuele opmerkingen over de training..."
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setClosingSession(null)}
                                className="rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-600"
                            >
                                Annuleren
                            </button>
                            <button
                                onClick={handleCloseSession}
                                className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
                            >
                                Afsluiten
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ExtraTrainings({ trainings }) {
    const { auth } = usePage().props;
    const [closingSession, setClosingSession] = useState(null);
    const [remarks, setRemarks] = useState('');

    const handleOpenSession = (scheduleId) => {
        router.post('/trainer/sessions/open', { training_schedule_id: scheduleId }, { preserveScroll: true });
    };

    const handleCloseSession = () => {
        if (!closingSession) return;
        router.patch(`/trainer/sessions/${closingSession}/close`, { remarks: remarks || null }, {
            preserveScroll: true,
            onSuccess: () => {
                setClosingSession(null);
                setRemarks('');
            },
        });
    };

    const handleDelete = (id) => {
        if (!confirm('Weet je zeker dat je deze extra training wilt verwijderen?')) return;
        const isAdmin = auth.user.role === 'admin';
        router.delete(isAdmin ? `/admin/extra-training/${id}` : `/trainer/extra-training/${id}`, { preserveScroll: true });
    };

    return (
        <div className="mt-10">
            <h2 className="text-lg font-semibold text-white mb-4">
                Extra Trainingen Vandaag
                <span className="ml-2 inline-flex items-center rounded-full bg-orange-900/40 px-2.5 py-0.5 text-xs font-medium text-orange-400">
                    {trainings.length}
                </span>
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {trainings.map(t => (
                    <div key={t.id} className="bg-slate-900 rounded-xl shadow-sm ring-1 ring-slate-800 border-t-2 border-t-orange-600/60 overflow-hidden">
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-1">
                                <p className="font-semibold text-white">{t.name}</p>
                                <span className="inline-flex items-center rounded-full bg-orange-900/40 px-2 py-0.5 text-[10px] font-semibold text-orange-400">
                                    Extra
                                </span>
                            </div>
                            <p className="text-sm text-slate-400">{t.group_names}</p>
                            <p className="text-sm text-slate-400">{t.start_time}{t.end_time ? `–${t.end_time}` : ''}</p>
                            {t.trainer_name && <p className="text-xs text-slate-500 mt-1">Trainer: {t.trainer_name}</p>}
                            <p className="text-xs text-slate-500 mt-1">{t.member_count} {t.member_count === 1 ? 'lid' : 'leden'}</p>

                            <div className="mt-3">
                                {t.trainer_id === auth.user.id && (
                                    <>
                                        {t.session?.is_open ? (
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-900/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                                                    <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
                                                    {t.session.attendance_count} aanwezig
                                                </span>
                                                <button
                                                    onClick={() => { setClosingSession(t.session.id); setRemarks(''); }}
                                                    className="rounded-md bg-red-900/30 px-2 py-1 text-[10px] font-semibold text-red-400 hover:bg-red-900/50 ring-1 ring-red-700/30"
                                                >
                                                    Sluiten
                                                </button>
                                            </div>
                                        ) : t.session?.closed_at ? (
                                            <span className="inline-flex items-center rounded-full bg-slate-700 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                                                Afgesloten ({t.session.attendance_count})
                                            </span>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleOpenSession(t.id)}
                                                    className="rounded-md bg-emerald-900/30 px-2 py-1 text-[10px] font-semibold text-emerald-400 hover:bg-emerald-900/50 ring-1 ring-emerald-700/30"
                                                >
                                                    Start training
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(t.id)}
                                                    className="rounded-md bg-red-900/30 px-2 py-1 text-[10px] font-semibold text-red-400 hover:bg-red-900/50 ring-1 ring-red-700/30"
                                                >
                                                    Verwijderen
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {closingSession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-slate-900 rounded-xl shadow-xl ring-1 ring-slate-700 w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Extra training afsluiten</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-300 mb-1">Opmerking (optioneel)</label>
                            <textarea
                                value={remarks}
                                onChange={e => setRemarks(e.target.value)}
                                rows={3}
                                maxLength={1000}
                                className="w-full rounded-lg bg-slate-800 border border-slate-700 text-white px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                                placeholder="Optionele opmerking..."
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setClosingSession(null)}
                                className="rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-600"
                            >
                                Annuleren
                            </button>
                            <button
                                onClick={handleCloseSession}
                                className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
                            >
                                Afsluiten
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
