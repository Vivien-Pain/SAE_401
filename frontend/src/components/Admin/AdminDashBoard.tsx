// AdminDashboard.tsx
import { useState, useEffect } from "react";
import {
  adminDashboardContainer,
  adminDashboardTitle,
  usersSectionContainer,
  sectionSubtitle,
  usersTable,
  usersTableHeaderRow,
  usersTableHeaderCell,
  usersTableDataCell,
  blockToggleButton,
  postsList,
  singlePostItem,
  postMeta,
  postContentText,
  postButtonsContainer,
  censorButton,
  deleteButton,
} from "./AdminDashBoardStyles";

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
      const response = await fetch(
        `http://localhost:8080/api/admin/${userId}/toggle-block`,
        { method: "POST" }
      );

      if (response.ok) {
        const data = await response.json();
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId ? { ...user, isBlocked: data.isBlocked } : user
          )
        );
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
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId ? { ...post, isCensored: true } : post
          )
        );
      } else {
        console.error("Erreur censure post");
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
    }
  };

  const deletePost = async (postId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/admin/post/${postId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPosts((prev) => prev.filter((post) => post.id !== postId));
      } else {
        console.error("Erreur suppression post");
      }
    } catch (error) {
      console.error("Erreur réseau:", error);
    }
  };

  return (
    <div className={adminDashboardContainer()}>
      <h1 className={adminDashboardTitle()}>Dashboard Admin</h1>

      {/* Gestion des utilisateurs */}
      <div className={usersSectionContainer()}>
        <h2 className={sectionSubtitle()}>Gestion des utilisateurs</h2>
        <table className={usersTable()}>
          <thead>
            <tr className={usersTableHeaderRow()}>
              <th className={usersTableHeaderCell()}>ID</th>
              <th className={usersTableHeaderCell()}>Nom d'utilisateur</th>
              <th className={usersTableHeaderCell()}>Email</th>
              <th className={usersTableHeaderCell()}>Rôle</th>
              <th className={usersTableHeaderCell()}>Statut</th>
              <th className={usersTableHeaderCell()}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className={usersTableDataCell()}>{user.id}</td>
                <td className={usersTableDataCell()}>{user.username}</td>
                <td className={usersTableDataCell()}>{user.email}</td>
                <td className={usersTableDataCell()}>{user.role}</td>
                <td className={usersTableDataCell()}>
                  {user.isBlocked ? "Bloqué" : "Actif"}
                </td>
                <td className={usersTableDataCell()}>
                  <button
                    onClick={() => toggleBlock(user.id)}
                    className={blockToggleButton({ blocked: user.isBlocked })}
                  >
                    {user.isBlocked ? "Débloquer" : "Bloquer"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modération des contenus */}
      <div>
        <h2 className={sectionSubtitle()}>Modération des contenus</h2>
        <ul className={postsList()}>
          {posts.map((post) => (
            <li key={post.id} className={singlePostItem()}>
              <div className={postMeta()}>Posté par {post.author.username}</div>
              <p className={postContentText()}>
                {post.isCensored
                  ? "⚠️ Ce message enfreint les conditions d’utilisation de la plateforme"
                  : post.content}
              </p>
              <div className={postButtonsContainer()}>
                {!post.isCensored && (
                  <button
                    onClick={() => censorPost(post.id)}
                    className={censorButton()}
                  >
                    Censurer
                  </button>
                )}
                <button
                  onClick={() => deletePost(post.id)}
                  className={deleteButton()}
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;
