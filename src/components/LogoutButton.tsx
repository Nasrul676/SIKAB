"use client";

import React from 'react';
import { LogOut } from "lucide-react";
import { showConfirmationAlert } from "@/app/utils/alert";
import { logoutAction } from "@/lib/actions/authActions";
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {

    const router = useRouter();

    const onLogout = async () => {
        const result = await logoutAction();
        if (result.success) {
            toast.success(result.message);
            router.push('/');
        } else {
            toast.error("Kesalahan server! " + result.message);
        }
    }

    const handleLogout = () => {
        showConfirmationAlert("Apakah anda yakin ingin keluar ?", async () => {
            await onLogout();
        });
    };
    return (
        <button onClick={handleLogout} className="pl-4 gap-2 flex items-center text-black-600 hover cursor-pointer">
            <LogOut size={15} />
            <span className="text-sm">Keluar</span>
        </button>
    );
}