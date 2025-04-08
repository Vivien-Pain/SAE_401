import { useState, useEffect } from "react";
import NavBar from "../../ui/NavBar/NavBar";
import PostModal from "../../ui/PostModal/PostModal";
import Header from "../../ui/Header/Header";
import Post from "../../ui/Post/Post";
import Search from "../../ui/Search/Search";

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [user, setUser] = useState<{ username: string | null }>({
    username: null,
  });

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
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(
            `Erreur ${response.status}: ${await response.text()}`
          );
        }

        const data = await response.json();
        setUser({ username: data.username });
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur", error);
      }
    };

    fetchUser();
  }, []);
  const handleSearch = async (query: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token non trouvé");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/posts/search?q=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();

      setPosts(
        data.posts.map((post: any) => ({
          ...post,
          media: post.media || [],
        }))
      );
    } catch (error) {
      console.error("Erreur lors de la recherche de posts", error);
    }
  };
  const fetchPosts = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/posts");
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${await response.text()}`);
      }
      const data = await response.json();

      setPosts(
        data.posts
          .map((post: { media?: any[]; created_at: string }) => ({
            ...post,
            media: post.media || [],
          }))
          .sort(
            (a: { created_at: string }, b: { created_at: string }) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${await response.text()}`);
      }

      console.log("Post créé avec succès");
      fetchPosts();
      closePostForm();
    } catch (error) {
      console.error("Erreur lors de la création du post", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center bg-white">
      {/* Header */}
      <Header username={user.username || "Invité"} />
      <div className="w-full max-w-md p-4">
        <Search onSearch={handleSearch} />
      </div>
      {/* Liste de posts */}
      <div className="flex-grow w-full max-w-md space-y-6 p-4 overflow-auto pb-32">
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
              isCensored={post.isCensored}
              isLocked={post.isLocked || false}
            />
          ))
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-400">Aucun post disponible</p>
          </div>
        )}
      </div>

      {/* NavBar */}
      <div className="fixed bottom-0 w-full">
        <NavBar
          openPostForm={openPostForm}
          username={user.username}
          profilePicture={null}
          onRefresh={fetchPosts}
        />
      </div>

      {/* Modale de création de post */}
      <PostModal
        isOpen={isModalOpen}
        onClose={closePostForm}
        onSubmit={handlePostSubmit}
      />
    </div>
  );
};

export default Home;
