import React, {useEffect, useState} from 'react'
import {useChatStore} from "../store/useChatStore.js";
import {useAuthStore} from "../store/useAuthStore.js";
import SidebarSkeleton from "./SidebarSkeleton.jsx";
import {Users} from "lucide-react";

function Sidebar() {
    const {getUsers, users, selectedUser, setSelectedUser, areUsersLoading} = useChatStore()
    const { onlineUsers } =  useAuthStore();
    const [showOnlineOnly, setShowOnlineOnly] = useState(false);
    useEffect(() => {
        getUsers()
    }, [getUsers]);

    const filteredUsers = showOnlineOnly ? users.filter((user) => onlineUsers.includes(user._id))
        : users

    if(areUsersLoading) return (<SidebarSkeleton />)
    return (
        <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
            <div className="border-b border-base-300 w-full p-5">
                <div className="flex items-center gap-2">
                    <Users className="size-6" />
                    <span className="font-medium hidden lg:block">Contacts</span>
                </div>
                {/*TODO: Online filter toggle*/}
                <div className="mt-3 hidden lg:block">
                    <label className="cursor-pointer flex items-center gap-2">
                        <input className = "checkbox checkbox-sm"
                        {/************************************/}
                           type="checkbox"
                        >
                    </label>
                </div>
            </div>
        </aside>
    )
}

export default Sidebar
