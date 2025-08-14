"use client";

import React from 'react';
import { LogOut } from "lucide-react";
import { showConfirmationAlert } from "@/app/utils/alert";
import { logoutAction } from "@/lib/actions/authActions";

export default function LogoutButton() {

    const handleLogout = () => {
        showConfirmationAlert("Apakah anda yakin ingin keluar ?", async () => {
            await logoutAction();
        });
    };
    return (
        <button onClick={handleLogout} className="pl-4 gap-2 flex items-center text-black-600 hover">
            <LogOut size={15} />
            <span className="text-sm">Keluar</span>
        </button>
    );
}