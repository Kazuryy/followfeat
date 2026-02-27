"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { formatRelativeDate } from "@/lib/utils";
import { Shield, ShieldOff, Ban, Trash2 } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  banned: boolean;
  createdAt: Date;
  _count: { posts: number; votes: number; comments: number };
}

interface MembersTableProps {
  users: User[];
  currentUserId: string;
}

export function MembersTable({ users: initial, currentUserId }: MembersTableProps) {
  const [users, setUsers] = useState(initial);

  const patch = async (id: string, body: object) => {
    const res = await fetch(`/api/admin/members/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const updated = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updated } : u)));
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/members/${id}`, { method: "DELETE" });
    if (res.ok) setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="border-b border-zinc-100 dark:border-zinc-800">
          <tr>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500">User</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500">Role</th>
            <th className="px-4 py-2.5 text-center text-xs font-medium text-zinc-500">Posts</th>
            <th className="px-4 py-2.5 text-center text-xs font-medium text-zinc-500">Votes</th>
            <th className="px-4 py-2.5 text-center text-xs font-medium text-zinc-500">Comments</th>
            <th className="px-4 py-2.5 text-right text-xs font-medium text-zinc-500">Joined</th>
            <th className="px-4 py-2.5 text-right text-xs font-medium text-zinc-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            return (
              <tr key={user.id} className={user.banned ? "opacity-50" : ""}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={user.name} image={user.image} size={28} />
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-zinc-50">{user.name}</p>
                      <p className="text-xs text-zinc-400">{user.email}</p>
                    </div>
                    {user.banned && (
                      <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400">
                        Banned
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      user.role === "admin"
                        ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    {user.role === "admin" ? "Admin" : "User"}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-zinc-500">{user._count.posts}</td>
                <td className="px-4 py-3 text-center text-zinc-500">{user._count.votes}</td>
                <td className="px-4 py-3 text-center text-zinc-500">{user._count.comments}</td>
                <td className="px-4 py-3 text-right text-xs text-zinc-400">
                  {formatRelativeDate(user.createdAt)}
                </td>
                <td className="px-4 py-3">
                  {!isSelf && (
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() =>
                          patch(user.id, { role: user.role === "admin" ? "user" : "admin" })
                        }
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                        title={user.role === "admin" ? "Remove admin" : "Make admin"}
                      >
                        {user.role === "admin" ? <ShieldOff size={14} /> : <Shield size={14} />}
                      </button>
                      <button
                        onClick={() => patch(user.id, { banned: !user.banned })}
                        className={`rounded-lg p-1.5 ${
                          user.banned
                            ? "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                            : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                        }`}
                        title={user.banned ? "Unban" : "Ban"}
                      >
                        <Ban size={14} />
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
