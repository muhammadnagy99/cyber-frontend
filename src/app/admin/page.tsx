'use client'

import { useEffect, useState } from "react";
import axios from "axios";

interface Role {
    id: string;
    name: string;
}

interface Permission {
    id: string;
    name: string;
}

interface RolePermissions {
    permissions: string[];
    status: string;
}

interface CardProps {
    title: string;
    children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children }) => (
    <div className="bg-white shadow-lg rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        {children}
    </div>
);

const Input: React.FC<{ placeholder: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ placeholder, value, onChange }) => (
    <input className="border p-2 rounded w-[86%]" placeholder={placeholder} value={value} onChange={onChange} />
);

const Button: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
    <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={onClick}>
        {children}
    </button>
);

export default function RBACDashboard() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [roleName, setRoleName] = useState("");
    const [permissionName, setPermissionName] = useState("");
    const [activeTab, setActiveTab] = useState("roles");
    const [rolePermissions, setRolePermissions] = useState<{ [key: string]: string[] }>({});
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [selectedPermission, setSelectedPermission] = useState<string>("");


    const API_BASE_URL = "https://nagy.services/api";
    const headers = { "Authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6IjY0YjZlYmEwM2RlZWE2ZTVjMjZjMTg1NDQ3ZmE4MDNjIn0.eyJzdWIiOiIyOTcyMTUxOTE5IiwibmFtZSI6IkJJR0JPU1MiLCJpYXQiOjEzMjEyMzEzMjEzMjF9.zN7mG-0pI2EBE2wsXu9jsdfud4uiqBiZDPgxrE0e2mJ4sD_CdesyQPANeEYp6c7log4haM8XbeMVr7P54oO-bQ", "Content-Type": "application/json" };


    useEffect(() => {
        fetchRoles();
        fetchPermissions();
    }, []);

    const fetchRoles = async () => {
        const res = await axios.get<Role[]>(`${API_BASE_URL}/roles`, { headers });
        setRoles(res.data);
    };

    const fetchPermissions = async () => {
        const res = await axios.get<Permission[]>(`${API_BASE_URL}/permissions`, { headers });
        setPermissions(res.data);
    };

    const createRole = async () => {
        await axios.post(`${API_BASE_URL}/roles`, { id: roleName, name: roleName }, { headers });
        fetchRoles();
    };

    const deleteRole = async (id: string) => {
        await axios.delete(`${API_BASE_URL}/roles/${id}`, { headers });
        fetchRoles();
    };

    const createPermission = async () => {
        await axios.post(`${API_BASE_URL}/permissions`, { id: permissionName, name: permissionName }, { headers });
        fetchPermissions();
    };

    const deletePermission = async (id: string) => {
        await axios.delete(`${API_BASE_URL}/permissions/${id}`, { headers });
        fetchPermissions();
    };

    const fetchRolePermissions = async (roleId: string) => {
        const res = await axios.get<RolePermissions>(`${API_BASE_URL}/roles/${roleId}/permissions`, { headers });
        setRolePermissions(prev => ({ ...prev, [roleId]: res.data.permissions }));
    };

    const assignPermission = async () => {
        if (!selectedRole || !selectedPermission) return;
        await axios.post(`${API_BASE_URL}/roles/${selectedRole}/permissions/${selectedPermission}`, {}, { headers });
        fetchRolePermissions(selectedRole);
    };
    const deletePermissionFromRole = async (permId: string) => {
        if (!selectedRole) return;
        await axios.delete(`${API_BASE_URL}/roles/${selectedRole}/permissions/${permId}`, { headers });
        fetchRolePermissions(selectedRole);
    };

    return (
        <div className="flex h-screen">
            <div className="w-64 bg-gray-800 text-white p-4 h-full">
                <h2 className="text-lg font-bold">Dashboard</h2>
                <ul>
                    <li className={`p-2 cursor-pointer ${activeTab === "roles" ? "bg-gray-600" : ""}`} onClick={() => setActiveTab("roles")}>Roles</li>
                    <li className={`p-2 cursor-pointer ${activeTab === "permissions" ? "bg-gray-600" : ""}`} onClick={() => setActiveTab("permissions")}>Permissions</li>
                    <li className={`p-2 cursor-pointer ${activeTab === "role-permissions" ? "bg-gray-600" : ""}`} onClick={() => setActiveTab("role-permissions")}>Assign Permissions</li>
                </ul>
            </div>
            <div className="flex-1 p-6 overflow-y-auto max-h-full">
                <h1 className="text-xl font-bold">RBAC Management Dashboard</h1>
                {activeTab === "roles" && (
                    <Card title="Roles">
                        <div className="flex flex-row gap-2">
                            <Input placeholder="Role Name" value={roleName} onChange={(e) => setRoleName(e.target.value)} />
                            <Button onClick={createRole}>Create Role</Button>
                        </div>
                        <ul className="px-80">
                            {roles.map((role) => (
                                <li key={role.id} className="flex justify-between mt-2">
                                    {role.name}
                                    <Button onClick={() => deleteRole(role.id)}>Delete</Button>
                                </li>
                            ))}
                        </ul>
                    </Card>
                )}
                {activeTab === "permissions" && (
                    <Card title="Permissions">
                        <div className="flex flex-row gap-2">
                            <Input placeholder="Permission Name" value={permissionName} onChange={(e) => setPermissionName(e.target.value)} />
                            <Button onClick={createPermission}>Create Permission</Button>
                        </div>
                        <ul className="px-80">
                            {permissions.map((perm) => (
                                <li key={perm.id} className="flex justify-between mt-2">
                                    {perm.name}
                                    <Button onClick={() => deletePermission(perm.id)}>Delete</Button>
                                </li>
                            ))}
                        </ul>
                    </Card>
                )}

                {activeTab === "role-permissions" && (
                    <Card title="Assign Permissions to Role">
                        <select className="border p-2 rounded w-full" onChange={(e) => {
                            setSelectedRole(e.target.value);
                            fetchRolePermissions(e.target.value);
                        }}>
                            <option value="">Select Role</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>{role.name}</option>
                            ))}
                        </select>
                        {selectedRole && (
                            <div className="mt-4">
                                <h3 className="font-semibold py-2">Assigned Permissions:</h3>
                                <ul className="flex flex-col gap-2">
                                    {rolePermissions[selectedRole]?.map((permId) => {
                                        const perm = permissions.find(p => p.id === permId);
                                        return (
                                            <li key={permId} className="flex justify-between">
                                                {perm ? perm.name : permId}
                                                <Button onClick={() => deletePermissionFromRole(permId)}>Remove</Button>
                                            </li>
                                        );
                                    })}
                                </ul>
                                <h3 className="font-semibold mt-4 py-2">Assign New Permission:</h3>
                                <select className="border p-2 rounded w-full mb-2" onChange={(e) => setSelectedPermission(e.target.value)}>
                                    <option value="">Select Permission</option>
                                    {permissions.map((perm) => (
                                        <option key={perm.id} value={perm.id}>{perm.name}</option>
                                    ))}
                                </select>
                                <Button onClick={assignPermission}>Assign Permission</Button>
                            </div>
                        )}
                    </Card>
                )}
            </div>

        </div>
    );
}
