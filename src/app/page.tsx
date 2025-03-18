'use client';

import { useState, Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";

interface Role {
  id: string;
  name: string;
}

const fetcher = (url: string) =>
  fetch(url, {
    headers: { "Authorization": `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6IjY0YjZlYmEwM2RlZWE2ZTVjMjZjMTg1NDQ3ZmE4MDNjIn0.eyJzdWIiOiIyOTcyMTUxOTE5IiwibmFtZSI6IkJJR0JPU1MiLCJpYXQiOjEzMjEyMzEzMjEzMjF9.zN7mG-0pI2EBE2wsXu9jsdfud4uiqBiZDPgxrE0e2mJ4sD_CdesyQPANeEYp6c7log4haM8XbeMVr7P54oO-bQ` },
  }).then((res) => res.json());

const Button = ({ children, onClick, disabled }: { children: string; onClick: () => void; disabled?: boolean }) => (
  <button
    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-400"
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
);

const Card = ({ title, children, highlighted }: { title: string; children?: React.ReactNode; highlighted?: boolean }) => (
  <div className={`p-4 border rounded-md shadow-md ${highlighted ? "bg-blue-100" : "bg-gray-200"}`}>
    <h3 className="font-bold">{title}</h3>
    <div>{children}</div>
  </div>
);

const RoleSelector = ({ selectedRole, onRoleSelect }: { selectedRole: string; onRoleSelect: (role: string) => void }) => {
  const { data: roles, error } = useSWR("https://nagy.services/api/roles", fetcher);

  useEffect(() => {
    if (roles && roles.length > 0 && !selectedRole) {
      onRoleSelect(roles[0].id);
    }
  }, [roles, selectedRole, onRoleSelect]);

  if (error) return <p className="text-red-500">Failed to load roles</p>;
  if (!roles) return <p>Loading roles...</p>;

  return (
    <select
      className="p-2 border rounded-md"
      value={selectedRole}
      onChange={(e) => onRoleSelect(e.target.value)}
    >
      {roles.map((role: Role) => (
        <option key={role.id} value={role.id}>
          {role.name}
        </option>
      ))}
    </select>
  );
};
export default function Home() {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSignIn = async () => {
    setLoading(true);
    setTimeout(() => {
      router.push(`/permissions?role=${selectedRole}`);
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Select Role</h1>
      <Suspense fallback={<p>Loading roles...</p>}>
      <RoleSelector selectedRole={selectedRole} onRoleSelect={(newRole) => setSelectedRole(newRole)} />
      </Suspense>
      <Button onClick={handleSignIn} disabled={loading || !selectedRole}>
        {loading ? "Signing In..." : "Sign In"}
      </Button>
    </div>
  );
}
