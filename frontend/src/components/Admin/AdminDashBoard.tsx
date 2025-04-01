import { useState, useEffect } from "react";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  isBlocked: boolean;
}

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);

  // Charger les utilisateurs depuis l'API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/admin");
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          console.error("Erreur lors de la récupération des utilisateurs");
        }
      } catch (error) {
        console.error("Erreur réseau:", error);
      }
    };

    fetchUsers();
  }, []);

  // Bloquer/Débloquer un utilisateur
  const toggleBlock = async (userId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/admin/${userId}/toggle-block`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(users.map(user => user.id === userId ? { ...user, isBlocked: data.isBlocked } : user));
      } else {
        console.error("Erreur lors du blocage de l'utilisateur");
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Dashboard Admin</h1>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2">ID</th>
            <th className="border border-gray-300 p-2">Nom d'utilisateur</th>
            <th className="border border-gray-300 p-2">Email</th>
            <th className="border border-gray-300 p-2">Rôle</th>
            <th className="border border-gray-300 p-2">Statut</th>
            <th className="border border-gray-300 p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="text-center">
              <td className="border border-gray-300 p-2">{user.id}</td>
              <td className="border border-gray-300 p-2">{user.username}</td>
              <td className="border border-gray-300 p-2">{user.email}</td>
              <td className="border border-gray-300 p-2">{user.role}</td>
              <td className="border border-gray-300 p-2">
                {user.isBlocked ? "Bloqué" : "Actif"}
              </td>
              <td className="border border-gray-300 p-2">
                <button
                  onClick={() => toggleBlock(user.id)}
                  className={`px-4 py-1 rounded text-white ${
                    user.isBlocked ? "bg-red-500" : "bg-green-500"
                  }`}
                >
                  {user.isBlocked ? "Débloquer" : "Bloquer"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
