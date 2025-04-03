import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Post from "../../ui/Post/Post";

interface Post {
  id: number;
  content: string;
  created_at: string;
  authorUsername: string; 
  likes: number;
  isLiked: boolean;
  authorId: number;
  isFollowed: boolean;
  media: string[];
  replies?: Post[];
}

interface UserProfile {
  id: number;
  username: string;
  bio: string;
  profilePicture: string;
  banner: string;
  location: string;
  website: string;
  posts: Post[];
  isFollowed: boolean;
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isFollowed, setIsFollowed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ username: string } | null>(null);
  const [formData, setFormData] = useState({
    bio: "",
    profilePicture: "",
    banner: "",
    location: "",
    website: "",
  });

  useEffect(() => {
    if (!username) {
      console.error("Nom d'utilisateur invalide.");
      return;
    }

    const token = localStorage.getItem("token");

    fetch(`http://localhost:8080/api/profile/${username}`)
      .then((res) => {
        if (!res.ok) throw new Error("Profil non trouvé");
        return res.json();
      })
      .then((data) => {
        setProfile(data);
        setIsFollowed(data.isFollowed);
        setFormData({
          bio: data.bio,
          profilePicture: data.profilePicture,
          banner: data.banner,
          location: data.location,
          website: data.website,
        });
      })
      .catch((error) => console.error("Erreur lors de la récupération du profil:", error));

    if (token) {
      fetch("http://localhost:8080/api/blocked", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((blockedList) => {
          const isBlockedUser = blockedList.find((b: any) => b.username === username);
          setIsBlocked(!!isBlockedUser);
        });
    }
  }, [username]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("http://localhost:8080/api/current_user", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentUser({ username: data.username });
      }
    };

    fetchCurrentUser();
  }, []);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    fetch(`http://localhost:8080/api/profile/${username}/edit`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setIsEditing(false);
      })
      .catch((error) => console.error("Erreur lors de la mise à jour du profil:", error));
  };

  const handleFollowToggle = () => {
    if (!profile) return;

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Aucun token trouvé, veuillez vous connecter.");
      return;
    }

    const url = `http://localhost:8080/api/profile/${username}/${isFollowed ? "unfollow" : "follow"}`;
    const method = isFollowed ? "DELETE" : "POST";

    fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur lors de la mise à jour du suivi");
        setIsFollowed(!isFollowed);
      })
      .catch((error) => console.error("Erreur lors de la mise à jour du suivi:", error));
  };

  const handleBlockToggle = async () => {
    const token = localStorage.getItem("token");
    if (!token || !profile?.id) {
      console.error("Token ou ID de profil manquant.");
      return;
    }

    const method = isBlocked ? "DELETE" : "POST";
    const endpoint = `http://localhost:8080/api/users/${profile.id}/${isBlocked ? "unblock" : "block"}`;

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Erreur API:", errorData.message || "Erreur inconnue");
        alert(`Erreur: ${errorData.message || "Impossible d'effectuer l'action"}`);
        return;
      }

      const data = await res.json();
      alert(data.message);
      setIsBlocked(!isBlocked);
    } catch (err) {
      console.error("Erreur réseau:", err);
      alert("Erreur réseau lors de l'envoi de la requête");
    }
  };

  const handleDeletePost = (postId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Aucun token trouvé, veuillez vous connecter.");
      return;
    }

    fetch(`http://localhost:8080/api/posts/${postId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur lors de la suppression du post");
        setProfile((prevProfile) => ({
          ...prevProfile!,
          posts: prevProfile!.posts.filter((post) => post.id !== postId),
        }));
      })
      .catch((error) => console.error("Erreur lors de la suppression du post:", error));
  };

  if (!profile) return <p>Chargement...</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="relative">
        <img src={profile.banner} alt="Bannière" className="w-full h-40 object-cover" />
        <img src={profile.profilePicture} alt="Profil" className="w-24 h-24 rounded-full border-4 border-white absolute -bottom-12 left-4" />
      </div>

      <div className="mt-12 p-4">
        <h1 className="text-2xl font-bold">
          {profile.username} {currentUser?.username === profile.username && <span className="text-sm text-gray-500">(Vous)</span>}
        </h1>
        {!isEditing ? (
          <>
            <p className="text-gray-600">{profile.bio}</p>
            <p className="text-gray-500">{profile.location}</p>
            <a href={profile.website} className="text-blue-500">{profile.website}</a>
            {currentUser?.username === profile.username && (
              <button onClick={handleEditToggle} className="ml-4 px-4 py-2 bg-yellow-500 text-white rounded">Modifier</button>
            )}
          </>
        ) : (
          <div className="flex flex-col space-y-2">
            <input type="text" name="bio" value={formData.bio} onChange={handleChange} placeholder="Bio" className="border p-2" />
            <input type="text" name="profilePicture" value={formData.profilePicture} onChange={handleChange} placeholder="URL Photo de Profil" className="border p-2" />
            <input type="text" name="banner" value={formData.banner} onChange={handleChange} placeholder="URL Bannière" className="border p-2" />
            <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Localisation" className="border p-2" />
            <input type="text" name="website" value={formData.website} onChange={handleChange} placeholder="Site Web" className="border p-2" />
            <button onClick={handleSubmit} className="px-4 py-2 bg-green-500 text-white rounded">Enregistrer</button>
            <button onClick={handleEditToggle} className="px-4 py-2 bg-gray-500 text-white rounded">Annuler</button>
          </div>
        )}

        {currentUser?.username !== profile.username && (
          <>
            <button onClick={handleFollowToggle} className={`mt-4 px-4 py-2 rounded ${isFollowed ? "bg-red-500 text-white" : "bg-blue-500 text-white"}`}>
              {isFollowed ? "Ne plus suivre" : "Suivre"}
            </button>
            <button onClick={handleBlockToggle} className={`ml-2 mt-4 px-4 py-2 rounded ${isBlocked ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
              {isBlocked ? "Débloquer" : "Bloquer"}
            </button>
          </>
        )}
      </div>

      <hr className="my-4" />

      <div>
        <h2 className="text-xl font-semibold">Posts</h2>
        {!profile.posts || profile.posts.length === 0 ? (
          <p>Aucun post trouvé.</p>
        ) : (
          profile.posts.map((post) => (
            <div key={post.id} className="mb-4">
              <Post
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
              <button onClick={() => handleDeletePost(post.id)} className="text-red-500 mt-2">Supprimer</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
