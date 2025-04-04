import { useState, useEffect } from "react";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  isBlocked: boolean;
}

interface Post {
  id: number;
  content: string;
  isCensored: boolean;
  author: {
    username: string;
  };
}

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/admin");
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users);
          setPosts(data.posts);
        } else {
          console.error("Erreur API");
        }
      } catch (error) {
        console.error("Erreur réseau:", error);
      }
    };

    fetchData();
  }, []);

  const toggleBlock = async (userId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/admin/${userId}/toggle-block`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(users.map(user => user.id === userId ? { ...user, isBlocked: data.isBlocked } : user));
      } else {
        console.error("Erreur toggle block");
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
    }
  };

  const censorPost = async (postId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/admin/${postId}/censor`, {
        method: "POST",
      });

      if (response.ok) {
        setPosts(posts.map(post => post.id === postId ? { ...post, isCensored: true } : post));
      } else {
        console.error("Erreur censure post");
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Dashboard Admin</h1>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Gestion des utilisateurs</h2>
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

      <div>
        <h2 className="text-xl font-semibold mb-4">Modération des contenus</h2>
        <ul className="space-y-4">
          {posts.map((post) => (
            <li key={post.id} className="p-4 border rounded shadow">
              <div className="text-sm text-gray-500">Posté par {post.author.username}</div>
              <p className="text-md my-2">
                {post.isCensored
                  ? "⚠️ Ce message enfreint les conditions d’utilisation de la plateforme"
                  : post.content}
              </p>
              {!post.isCensored && (
                <button
                  onClick={() => censorPost(post.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Censurer
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;
