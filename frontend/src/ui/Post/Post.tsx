import { useState, useEffect } from 'react';
import Icons from '../../ui/Icons/Icons';

interface PostProps {
  content: string;
  created_at: string;
  id?: number;          // ID du post
  likes: number;        // Compteur de likes
  isLiked: boolean;     // Statut du like pour l'utilisateur connecté
  authorId: number;     // ID de l'auteur du post
  authorUsername: string; // Nom de l'auteur (pour affichage, si besoin)
  isFollowed: boolean;  // Indique si l'utilisateur connecté suit l'auteur
}

const formatDate = (date: string) => {
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
    .toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
};

const Post = ({
  content,
  created_at,
  id,
  likes,
  isLiked,
  authorId,
  isFollowed,
}: PostProps) => {
  const [likeCount, setLikeCount] = useState<number>(likes ?? 0);
  const [liked, setLiked] = useState(isLiked);
  const [followed, setFollowed] = useState(isFollowed);
  const [authorProfile, setAuthorProfile] = useState<{ username: string, profilePicture: string } | null>(null);

  // Fonction pour récupérer les informations du profil de l'auteur
  useEffect(() => {
    const fetchAuthorProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Aucun token trouvé dans localStorage");
          return;
        }

        const response = await fetch(`http://localhost:8080/api/users/${authorId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        if (response.ok) {
          const data = await response.json();
          setAuthorProfile({
            username: data.username,
            profilePicture: data.profilePicture, // Si vous avez une URL d'avatar dans les données de l'utilisateur
          });
        } else {
          console.error("Erreur lors de la récupération du profil de l'auteur :", await response.text());
        }
      } catch (error) {
        console.error("Erreur lors de la requête de récupération du profil :", error);
      }
    };

    fetchAuthorProfile();
  }, [authorId]);

  // Gestion du like
  const handleLike = async () => {
    if (!id) {
      console.error("L'id du post est indéfini");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Aucun token trouvé dans localStorage");
      return;
    }
    const endpoint = `http://localhost:8080/api/posts/${id}/like`;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Nombre de likes reçu après like :", data.likes);
        if (typeof data.likes === "number") {
          setLikeCount(data.likes);
          setLiked(true);
        } else {
          console.error("Réponse invalide pour les likes :", data);
        }
      } else {
        console.error("Erreur lors du like :", await response.text());
      }
    } catch (error) {
      console.error("Erreur lors de la requête de like :", error);
    }
  };

  // Gestion de l'unlike
  const handleUnlike = async () => {
    if (!id) {
      console.error("L'id du post est indéfini");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Aucun token trouvé dans localStorage");
      return;
    }
    const endpoint = `http://localhost:8080/api/posts/${id}/unlike`;
    try {
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Nombre de likes reçu après unlike :", data.likes);
        if (typeof data.likes === "number") {
          setLikeCount(data.likes);
          setLiked(false);
        } else {
          console.error("Réponse invalide pour les likes :", data);
        }
      } else {
        console.error("Erreur lors de l'unlike :", await response.text());
      }
    } catch (error) {
      console.error("Erreur lors de la requête d'unlike :", error);
    }
  };

  // Gestion du suivi/désabonnement de l'auteur
  const handleFollow = async () => {
    if (authorId === Number(localStorage.getItem("userId"))) return;

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Aucun token trouvé dans localStorage");
      return;
    }
    const endpoint = `http://localhost:8080/api/users/${authorId}/follow`;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      if (response.ok) {
        console.log("Suivi effectué avec succès");
        setFollowed(true);
      } else {
        console.error("Erreur lors du suivi :", await response.text());
      }
    } catch (error) {
      console.error("Erreur lors de la requête de suivi :", error);
    }
  };

  const handleUnfollow = async () => {
    if (authorId === Number(localStorage.getItem("userId"))) return;

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Aucun token trouvé dans localStorage");
      return;
    }
    const endpoint = `http://localhost:8080/api/users/${authorId}/unfollow`;
    try {
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      if (response.ok) {
        console.log("Désabonnement effectué avec succès");
        setFollowed(false);
      } else {
        console.error("Erreur lors du désabonnement :", await response.text());
      }
    } catch (error) {
      console.error("Erreur lors de la requête de désabonnement :", error);
    }
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm w-full max-w-md">
      {/* Header: Author's profile and date */}
      <div className="flex items-center mb-4">
        {authorProfile?.profilePicture ? (
          <img
            src={authorProfile.profilePicture}
            alt={`${authorProfile.username}'s avatar`}
            className="w-10 h-10 rounded-full mr-3"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-300 mr-3" />
        )}
        <div>
            <a
            href={`/profile/${authorProfile?.username}`}
            className="font-semibold text-gray-800 hover:underline"
            >
            {authorProfile?.username || "Auteur inconnu"}
            </a>
          <p className="text-sm text-gray-500">Posté le: {formatDate(created_at)}</p>
        </div>
      </div>

      {/* Content */}
      <p className="text-gray-800 mb-4">{content}</p>

      {/* Actions: Like and Follow */}
      <div className="flex items-center">
        {liked ? (
          <button onClick={handleUnlike} className="flex items-center mr-4">
            <Icons className="w-6 h-6 text-red-500" />
            <span className="ml-2">{likeCount ?? 0}</span>
          </button>
        ) : (
          <button onClick={handleLike} className="flex items-center mr-4">
            <Icons className="w-6 h-6 text-gray-500" />
            <span className="ml-2">{likeCount ?? 0}</span>
          </button>
        )}

        {Number(localStorage.getItem("userId")) !== authorId && (
          followed ? (
            <button onClick={handleUnfollow} className="px-4 py-2 bg-red-500 text-white rounded">
              Ne plus suivre
            </button>
          ) : (
            <button onClick={handleFollow} className="px-4 py-2 bg-blue-500 text-white rounded">
              Suivre
            </button>
          )
        )}
  
      </div>
    </div>
  );
};

export default Post;
