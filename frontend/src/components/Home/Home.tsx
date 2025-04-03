import { useState, useEffect } from "react";
import NavBar from "../../ui/NavBar/NavBar";
import PostModal from "../../ui/PostModal/PostModal";
import Header from "../../ui/Header/Header";
import Post from "../../ui/Post/Post";

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [user, setUser] = useState<{ username: string | null }>({ username: null });

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("Aucun token disponible");
        return;
      }

      try {
        const response = await fetch("http://localhost:8080/api/current_user", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        setUser({ username: data.username });
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur", error);
      }
    };

    fetchUser();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/posts");
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${await response.text()}`);
      }
      const data = await response.json();

      // Vérifie que chaque post contient bien `media` et trie les posts par date décroissante
      setPosts(
        data.posts
          .map((post: { media?: any[]; created_at: string }) => ({
            ...post,
            media: post.media || [], // Ajoute un tableau vide si `media` est absent
          }))
          .sort((a: { created_at: string }, b: { created_at: string }) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          ) // Trie par date décroissante
      );
    } catch (error) {
      console.error("Erreur lors de la récupération des posts", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const openPostForm = () => setIsModalOpen(true);
  const closePostForm = () => setIsModalOpen(false);

  // Fonction pour gérer la soumission d'un nouveau post
  const handlePostSubmit = async (content: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token non trouvé");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${await response.text()}`);
      }

      console.log("Post créé avec succès");
      fetchPosts(); // Rafraîchir les posts après la création
      closePostForm(); // Fermer le modal après la soumission
    } catch (error) {
      console.error("Erreur lors de la création du post", error);
    }
  };

  return (
    <div className="flex flex-col h-screen items-center">
      <Header username={user.username || "Invité"} />

      <div className="flex-grow w-full max-w-md space-y-4 p-4 overflow-auto">
        {posts.length > 0 ? (
          posts.map((post) => (
            <Post
              key={post.id}
              content={post.content}
              created_at={post.created_at}
              likes={post.likes}
              isLiked={post.isLiked}
              id={post.id}
              authorId={post.authorId}
              authorUsername={post.authorUsername}
              media={post.media}
              replies={post.replies} 
            />
          ))
        ) : (
          <div>
            <p>Aucun post disponible</p>
            <NavBar openPostForm={openPostForm} username={user.username} profilePicture={null} onRefresh={() => fetchPosts().then(() => {})} />
          </div>
        )}
      </div>

      <div className="fixed bottom-0 w-full">
        <NavBar openPostForm={openPostForm} username={user.username} profilePicture={null} onRefresh={fetchPosts} />
      </div>

      <PostModal isOpen={isModalOpen} onClose={closePostForm} onSubmit={handlePostSubmit} />
    </div>
  );
};

export default Home;
