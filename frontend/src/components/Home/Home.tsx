import { useState, useEffect } from "react";
import NavBar from "../../ui/NavBar/NavBar";
import PostModal from "../../ui/PostModal/PostModal";
import Header from "../../ui/Header/Header";
import Post from "../../ui/Post/Post";

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState<any[]>([]); // Assure-toi que posts est un tableau
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Récupérer les posts depuis l'API au montage du composant
  useEffect(() => {
    const fetchPosts = async (page = 1) => {
      setIsLoading(true); // Indicateur de chargement
      try {
        const response = await fetch(`http://localhost:8080/api/posts?page=${page}`);
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP : ${response.status}`);

        }
    
        const data = await response.json();
    console.log(data); // Vérifie la structure de la réponse
      
    
        // Vérifie que posts est un tableau
        if (data && Array.isArray(data.posts)) {
          setPosts(data.posts); // Met à jour les posts directement
        } else {
          throw new Error('Les posts ne sont pas sous la forme d\'un tableau');
        }
      } catch (error) {
        setError('Erreur lors de la récupération des posts');
       
      } finally {
        setIsLoading(false); // Fin du chargement
      }
    };
    fetchPosts(); // Appel à la fonction pour récupérer les posts
  }, []); // Exécution au montage du composant

  const openPostForm = () => {
    setIsModalOpen(true);
  };

  const closePostForm = () => {
    setIsModalOpen(false);
  };

  const handleNewPost = (content: string) => {
    const newPost = {
      id: posts.length + 1,  // Assumer que l'id est généré en fonction du nombre de posts
      content,
      created_at: new Date().toISOString(), // Utilise la date actuelle
    };
    setPosts([newPost, ...posts]); // Ajouter un nouveau post au début de la liste
  };

  return (
    <div className="flex flex-col h-screen items-center">
      <Header />

      <div className="flex-grow w-full max-w-md space-y-4 p-4 overflow-auto">
        {/* Afficher l'indicateur de chargement */}
        {isLoading && <p>Chargement des posts...</p>}

        {/* Afficher l'erreur si elle existe */}
        {error && <p className="text-red-500">{error}</p>}

        {/* Affiche les posts récupérés */}
        {Array.isArray(posts) && posts.length > 0 ? (
          posts.map((post) => (
            <Post
              key={post.id}  // Assure-toi d'ajouter une clé unique pour chaque élément
              content={post.content}
              created_at={post.created_at}
            />
          ))
        ) : (
          <p>Aucun post disponible</p>
        )}
      </div>

      <div className="fixed bottom-0 w-full">
        <NavBar openPostForm={openPostForm} />
      </div>

      <PostModal
        isOpen={isModalOpen}
        onClose={closePostForm}
        onSubmit={handleNewPost}
      />
    </div>
  );
};

export default Home;
