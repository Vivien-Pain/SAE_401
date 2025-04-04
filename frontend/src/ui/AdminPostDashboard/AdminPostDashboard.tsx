import { useEffect, useState } from "react";

interface Post {
  id: number;
  content: string;
  isCensored: boolean;
  author: {
    username: string;
  };
}

const AdminContentDashboard = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/admin/")
      .then((res) => res.json())
      .then(setPosts);
  }, []);

  const censorPost = async (id: number) => {
    await fetch(`http://localhost:8080/api/admin/${id}/censor`, {
      method: "POST",
    });
    setPosts(posts.map(p => p.id === id ? { ...p, isCensored: true } : p));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Modération des contenus</h2>
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
  );
};

export default AdminContentDashboard;
