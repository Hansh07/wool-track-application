import React, { useEffect, useState } from 'react';
import client from '../api/axiosClient';
import { Shield, User, Edit2, Check, X } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Loader } from '../components/ui/Loader';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const { data } = await client.get('/api/admin/users');
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        try {
            await client.patch(`/api/admin/assign-role/${userId}`, { role: newRole });
            setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
        } catch (error) {
            alert('Failed to update role');
        }
    };

    if (loading) {
        return (
            <DashboardLayout role="Admin">
                <div className="flex h-[80vh] items-center justify-center"><Loader size="xl" /></div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="Admin">
            <div className="space-y-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary-100 rounded-xl text-primary-600">
                        <Shield size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
                        <p className="text-gray-500">User role management and system oversight.</p>
                    </div>
                </div>

                <Card className="overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="p-5 text-gray-600 font-medium text-sm">User</th>
                                    <th className="p-5 text-gray-600 font-medium text-sm">Email</th>
                                    <th className="p-5 text-gray-600 font-medium text-sm">Current Role</th>
                                    <th className="p-5 text-gray-600 font-medium text-sm">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-gray-800 group-hover:text-primary-600 transition-colors">
                                                    {user.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-5 text-gray-500 font-mono text-sm">{user.email}</td>
                                        <td className="p-5">
                                            <Badge variant="outline">{user.role}</Badge>
                                        </td>
                                        <td className="p-5">
                                            <div className="relative">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                    className="bg-primary-50 border border-gray-200 text-gray-800 text-sm rounded-lg block p-2.5 focus:ring-primary-500 focus:border-primary-500"
                                                >
                                                    <option value="FARMER">FARMER</option>
                                                    <option value="MILL_OPERATOR">MILL_OPERATOR</option>
                                                    <option value="QUALITY_INSPECTOR">QUALITY_INSPECTOR</option>
                                                    <option value="BUYER">BUYER</option>
                                                    <option value="ADMIN">ADMIN</option>
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default AdminPanel;
