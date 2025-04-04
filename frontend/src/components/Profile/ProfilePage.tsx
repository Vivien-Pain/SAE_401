import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Post from "../../ui/Post/Post";

interface PostType {
  id: number;
  content: string;
  created_at: string;
  authorUsername: string;
  likes: number;
  isLiked: boolean;
  authorId: number;
  media: string[];
  replies?: PostType[];
}

interface UserProfile {
  id: number;
  username: string;
  bio: string;
  profilePicture: string;
  banner: string;
  location: string;
  website: string;
  posts: PostType[];
  readOnlyMode: boolean;
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ username: string } | null>(null);
  const [formData, setFormData] = useState({
    bio: "",
    profilePicture: "",
    banner: "",
    location: "",
    website: "",
  });
  const [isBlocked, setIsBlocked] = useState(false); // 🚀 Ajouter état pour le blocage

  useEffect(() => {
    if (!username) {
      console.error("Nom d'utilisateur invalide.");
      return;
    }

    fetch(`http://localhost:8080/api/profile/${username}`)
      .then((res) => {
        if (!res.ok) throw new Error("Profil non trouvé");
        return res.json();
      })
      .then((data) => {
        setProfile(data);
        setFormData({
          bio: data.bio || "",
          profilePicture: data.profilePicture || "",
          banner: data.banner || "",
          location: data.location || "",
          website: data.website || "",
        });
      })
      .catch((error) => console.error("Erreur lors de la récupération du profil:", error));
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

    const fetchBlockStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token || !username) return;

      const res = await fetch(`http://localhost:8080/api/blocked`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const blockedUsers = await res.json();
        const blocked = blockedUsers.find((u: any) => u.username === username);
        setIsBlocked(!!blocked);
      }
    };

    fetchCurrentUser();
    fetchBlockStatus();
  }, [username]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:8080/api/profile/${username}/edit`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Erreur lors de la mise à jour du profil");

      const data = await response.json();
      setProfile(prev => ({
        ...prev!,
        bio: data.bio,
        profilePicture: data.profilePicture,
        banner: data.banner,
        location: data.location,
        website: data.website,
      }));
      setIsEditing(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
    }
  };

  const handleToggleReadOnlyMode = async () => {
    const token = localStorage.getItem("token");
    if (!token || !profile) return;

    try {
      const response = await fetch(`http://localhost:8080/api/profile/${username}/readonly`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ readOnlyMode: !profile.readOnlyMode }),
      });

      if (!response.ok) throw new Error("Erreur lors de l'activation/désactivation lecture seule");

      const updated = await response.json();
      setProfile(prev => ({
        ...prev!,
        readOnlyMode: updated.readOnlyMode,
      }));
    } catch (error) {
      console.error("Erreur mode lecture seule:", error);
    }
  };

  const handleBlockToggle = async () => {
    const token = localStorage.getItem("token");
    if (!token || !profile) return;

    const endpoint = isBlocked
      ? `http://localhost:8080/api/users/${profile.id}/unblock`
      : `http://localhost:8080/api/users/${profile.id}/block`;

    try {
      const response = await fetch(endpoint, {
        method: isBlocked ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.message || "Erreur inconnue");
        return;
      }

      const data = await response.json();
      alert(data.message);
      setIsBlocked(!isBlocked);
    } catch (error) {
      console.error("Erreur lors du blocage/déblocage:", error);
    }
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
              <>
                <button onClick={handleEditToggle} className="ml-4 px-4 py-2 bg-yellow-500 text-white rounded">Modifier</button>
                <button onClick={handleToggleReadOnlyMode} className="ml-4 px-4 py-2 bg-purple-500 text-white rounded">
                  {profile.readOnlyMode ? "Désactiver Lecture Seule" : "Activer Lecture Seule"}
                </button>
              </>
            )}
            {currentUser?.username !== profile.username && (
              <button onClick={handleBlockToggle} className={`ml-4 px-4 py-2 rounded ${isBlocked ? "bg-green-500" : "bg-red-500"} text-white`}>
                {isBlocked ? "Débloquer" : "Bloquer"}
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col space-y-2 mt-4">
            <input type="text" name="bio" value={formData.bio} onChange={handleChange} placeholder="Bio" className="border p-2" />
            <input type="text" name="profilePicture" value={formData.profilePicture} onChange={handleChange} placeholder="Photo de profil (URL)" className="border p-2" />
            <input type="text" name="banner" value={formData.banner} onChange={handleChange} placeholder="Bannière (URL)" className="border p-2" />
            <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Localisation" className="border p-2" />
            <input type="text" name="website" value={formData.website} onChange={handleChange} placeholder="Site web" className="border p-2" />
            <div className="flex space-x-2">
              <button onClick={handleSubmit} className="px-4 py-2 bg-green-500 text-white rounded">Enregistrer</button>
              <button onClick={handleEditToggle} className="px-4 py-2 bg-gray-500 text-white rounded">Annuler</button>
            </div>
          </div>
        )}
      </div>

      <hr className="my-4" />

      <div>
        <h2 className="text-xl font-semibold">Posts</h2>
        {profile.posts.length === 0 ? (
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
                isCensored={false}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
