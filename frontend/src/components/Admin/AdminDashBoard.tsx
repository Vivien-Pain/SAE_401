import { useState } from "react";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

const AdminDashboard = () => {
  // Simuler une liste d'utilisateurs
  const [users, setUsers] = useState<User[]>([
    { id: 1, username: "JohnDoe", email: "john@example.com", role: "user" },
    { id: 2, username: "JaneSmith", email: "jane@example.com", role: "user" },
    { id: 3, username: "AdminUser", email: "admin@example.com", role: "admin" },
  ]);

  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Modifier un utilisateur
  const handleEdit = (user: User) => {
    setEditingUser(user);
  };

  // Sauvegarde des modifications
  const handleSave = () => {
    if (editingUser) {
      setUsers(users.map((user) => (user.id === editingUser.id ? editingUser : user)));
      setEditingUser(null);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Dashboard Admin</h1>

      {/* 📌 TABLEAU SUR GRAND ÉCRAN */}
      <div className="hidden md:block">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">ID</th>
              <th className="border border-gray-300 p-2">Nom d'utilisateur</th>
              <th className="border border-gray-300 p-2">Email</th>
              <th className="border border-gray-300 p-2">Rôle</th>
              <th className="border border-gray-300 p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="text-center">
                <td className="border border-gray-300 p-2">{user.id}</td>
                <td className="border border-gray-300 p-2">
                  {editingUser?.id === user.id ? (
                    <input
                      type="text"
                      value={editingUser.username}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, username: e.target.value })
                      }
                      className="border p-1"
                    />
                  ) : (
                    user.username
                  )}
                </td>
                <td className="border border-gray-300 p-2">{user.email}</td>
                <td className="border border-gray-300 p-2">
                  {editingUser?.id === user.id ? (
                    <select
                      value={editingUser.role}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, role: e.target.value })
                      }
                      className="border p-1"
                    >
                      <option value="user">Utilisateur</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  ) : (
                    user.role
                  )}
                </td>
                <td className="border border-gray-300 p-2">
                  {editingUser?.id === user.id ? (
                    <button
                      onClick={handleSave}
                      className="bg-green-500 text-white px-2 py-1 rounded"
                    >
                      Sauvegarder
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEdit(user)}
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                    >
                      Modifier
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📌 VERSION MOBILE (Cartes) */}
      <div className="md:hidden space-y-4">
        {users.map((user) => (
          <div key={user.id} className="border p-4 rounded-lg shadow-md bg-white">
            <p><strong>ID :</strong> {user.id}</p>
            <p>
              <strong>Nom d'utilisateur :</strong>{" "}
              {editingUser?.id === user.id ? (
                <input
                  type="text"
                  value={editingUser.username}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, username: e.target.value })
                  }
                  className="border p-1 w-full"
                />
              ) : (
                user.username
              )}
            </p>
            <p><strong>Email :</strong> {user.email}</p>
            <p>
              <strong>Rôle :</strong>{" "}
              {editingUser?.id === user.id ? (
                <select
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, role: e.target.value })
                  }
                  className="border p-1 w-full"
                >
                  <option value="user">Utilisateur</option>
                  <option value="admin">Administrateur</option>
                </select>
              ) : (
                user.role
              )}
            </p>
            <div className="mt-2">
              {editingUser?.id === user.id ? (
                <button
                  onClick={handleSave}
                  className="bg-green-500 text-white px-4 py-1 rounded w-full"
                >
                  Sauvegarder
                </button>
              ) : (
                <button
                  onClick={() => handleEdit(user)}
                  className="bg-blue-500 text-white px-4 py-1 rounded w-full"
                >
                  Modifier
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
