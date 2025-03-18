'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Role {
  id: string;
  name: string;
}

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

export default function Home() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const fetchRoles = async () => {
      const res = await fetch("https://nagy.services/api/roles", {
        headers: { "Authorization": `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6IjY0YjZlYmEwM2RlZWE2ZTVjMjZjMTg1NDQ3ZmE4MDNjIn0.eyJzdWIiOiIyOTcyMTUxOTE5IiwibmFtZSI6IkJJR0JPU1MiLCJpYXQiOjEzMjEyMzEzMjEzMjF9.zN7mG-0pI2EBE2wsXu9jsdfud4uiqBiZDPgxrE0e2mJ4sD_CdesyQPANeEYp6c7log4haM8XbeMVr7P54oO-bQ` },
      });
      const data = await res.json();
      setRoles(data);
      if (data.length > 0) setSelectedRole(data[0].id);
    };
    fetchRoles();
  }, []);

  const handleSignIn = async () => {
    setLoading(true);
    setTimeout(() => {
      router.push(`/permissions?role=${selectedRole}`);
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Select Role</h1>
      <select
        className="p-2 border rounded-md"
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value)}
      >
        {roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.name}
          </option>
        ))}
      </select>
      <Button onClick={handleSignIn} disabled={loading}>
        {loading ? "Signing In..." : "Sign In"}
      </Button>
    </div>
  );
}
