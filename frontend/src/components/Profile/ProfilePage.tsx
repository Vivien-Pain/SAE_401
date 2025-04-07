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
  isPinned?: boolean;
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
  pinnedPost: PostType | null;
  readOnlyMode: boolean;
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ username: string } | null>(null);
  const [formData, setFormData] = useState({
    bio: "",
    profilePicture: "",
    banner: "",
    location: "",
    website: "",
  });
  const [isBlocked, setIsBlocked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState<string>("");

  useEffect(() => {
    if (!username) return;
    fetch(`http://localhost:8080/api/profile/${username}`)
      .then((res) => res.json())
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
      .catch((error) => console.error("Erreur profil:", error));
  }, [username]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("http://localhost:8080/api/current_user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser({ username: data.username });
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchRelations = async () => {
      const token = localStorage.getItem("token");
      if (!token || !username) return;

      try {
        const resBlocked = await fetch(`http://localhost:8080/api/blocked`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resBlocked.ok) {
          const blockedUsers = await resBlocked.json();
          const blocked = blockedUsers.find((u: any) => u.username === username);
          setIsBlocked(!!blocked);
        }
      } catch (error) {
        console.error("Erreur fetch relations:", error);
      }
    };

    fetchRelations();
  }, [username]);

  const handleEditProfileToggle = () => {
    setIsEditingProfile(!isEditingProfile);
  };

  const handleChangeProfile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:8080/api/profile/${username}/edit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setProfile((prev) => prev && { ...prev, ...data });
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Erreur update profil:", error);
    }
  };

  const handleToggleReadOnlyMode = async () => {
    const token = localStorage.getItem("token");
    if (!token || !profile) return;

    try {
      const response = await fetch(`http://localhost:8080/api/profile/${username}/readonly`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ readOnlyMode: !profile.readOnlyMode }),
      });
      if (!response.ok) throw new Error();
      const updated = await response.json();
      setProfile((prev) => prev && { ...prev, readOnlyMode: updated.readOnlyMode });
    } catch (error) {
      console.error("Erreur lecture seule:", error);
    }
  };

  const handleFollowToggle = async () => {
    const token = localStorage.getItem("token");
    if (!token || !profile) return;

    const endpoint = isFollowing
      ? `http://localhost:8080/api/profile/${profile.username}/unfollow`
      : `http://localhost:8080/api/profile/${profile.username}/follow`;

    try {
      const response = await fetch(endpoint, {
        method: isFollowing ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error();
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Erreur follow/unfollow:", error);
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
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error();
      setIsBlocked(!isBlocked);
    } catch (error) {
      console.error("Erreur block/unblock:", error);
    }
  };

  const handlePinToggle = async (postId: number, isPinned: boolean) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const endpoint = isPinned
      ? `http://localhost:8080/api/posts/${postId}/unpin`
      : `http://localhost:8080/api/posts/${postId}/pin`;

    try {
      await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      window.location.reload();
    } catch (error) {
      console.error("Erreur pin:", error);
    }
  };

  const handleEditPost = (postId: number, currentContent: string) => {
    setEditingPostId(postId);
    setEditedContent(currentContent);
  };

  const handleSubmitEditPost = async (postId: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:8080/api/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: editedContent }),
      });
      if (!response.ok) throw new Error();
      const updated = await response.json();
      setProfile((prev) => ({
        ...prev!,
        posts: prev!.posts.map((p) => (p.id === updated.id ? { ...p, content: updated.content } : p)),
      }));
      setEditingPostId(null);
      setEditedContent("");
    } catch (error) {
      console.error("Erreur update post:", error);
    }
  };

  const handleDeletePost = async (postId: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:8080/api/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error();

      setProfile((prev) => ({
        ...prev!,
        posts: prev!.posts.filter((p) => p.id !== postId),
      }));
    } catch (error) {
      console.error("Erreur suppression post:", error);
    }
  };

  if (!profile) return <p>Chargement...</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Affichage du profil */}
      <div className="relative">
        <img src={profile.banner} alt="Bannière" className="w-full h-40 object-cover" />
        <img src={profile.profilePicture} alt="Profil" className="w-24 h-24 rounded-full border-4 border-white absolute -bottom-12 left-4" />
      </div>

      <div className="mt-12 p-4">
        <h1 className="text-2xl font-bold">{profile.username}</h1>

        {!isEditingProfile ? (
          <>
            <p>{profile.bio}</p>
            <p>{profile.location}</p>
            <a href={profile.website} className="text-blue-500">{profile.website}</a>

            {currentUser?.username === profile.username ? (
              <>
                <button onClick={handleEditProfileToggle} className="ml-4 px-4 py-2 bg-yellow-500 text-white rounded">Modifier</button>
                <button onClick={handleToggleReadOnlyMode} className="ml-4 px-4 py-2 bg-purple-500 text-white rounded">
                  {profile.readOnlyMode ? "Désactiver Lecture Seule" : "Activer Lecture Seule"}
                </button>
              </>
            ) : (
              <>
                <button onClick={handleFollowToggle} className="ml-4 px-4 py-2 bg-blue-500 text-white rounded">
                  {isFollowing ? "Se désabonner" : "Suivre"}
                </button>
                <button onClick={handleBlockToggle} className={`ml-4 px-4 py-2 rounded ${isBlocked ? "bg-green-500" : "bg-red-500"} text-white`}>
                  {isBlocked ? "Débloquer" : "Bloquer"}
                </button>
              </>
            )}
          </>
        ) : (
          <div className="flex flex-col space-y-2">
            <input type="text" name="bio" value={formData.bio} onChange={handleChangeProfile} className="border p-2" placeholder="Bio" />
            <input type="text" name="profilePicture" value={formData.profilePicture} onChange={handleChangeProfile} className="border p-2" placeholder="Photo de profil (URL)" />
            <input type="text" name="banner" value={formData.banner} onChange={handleChangeProfile} className="border p-2" placeholder="Bannière (URL)" />
            <input type="text" name="location" value={formData.location} onChange={handleChangeProfile} className="border p-2" placeholder="Localisation" />
            <input type="text" name="website" value={formData.website} onChange={handleChangeProfile} className="border p-2" placeholder="Site web" />
            <div className="flex gap-2">
              <button onClick={handleSubmitProfile} className="px-4 py-2 bg-green-500 text-white rounded">Enregistrer</button>
              <button onClick={handleEditProfileToggle} className="px-4 py-2 bg-gray-500 text-white rounded">Annuler</button>
            </div>
          </div>
        )}
      </div>

      {/* Affichage posts */}
      {profile.pinnedPost && (
        <div className="mb-6">
          <h2 className="text-lg font-bold">Post Épinglé</h2>
          <Post {...profile.pinnedPost} isCensored={false} />
          {currentUser?.username === profile.username && (
            <button onClick={() => handlePinToggle(profile.pinnedPost!.id, true)} className="mt-2 px-4 py-2 bg-red-500 text-white rounded">Désépingler</button>
          )}
        </div>
      )}

      <hr className="my-4" />

      <div>
        <h2 className="text-xl font-semibold">Posts</h2>
        {profile.posts.length === 0 ? (
          <p>Aucun post trouvé.</p>
        ) : (
          profile.posts.map((post) => (
            <div key={post.id} className="mb-4">
              {editingPostId === post.id ? (
                <>
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full border p-2 rounded"
                    rows={3}
                  />
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => handleSubmitEditPost(post.id)} className="bg-green-500 text-white px-4 py-2 rounded">Enregistrer</button>
                    <button onClick={() => setEditingPostId(null)} className="bg-gray-500 text-white px-4 py-2 rounded">Annuler</button>
                  </div>
                </>
              ) : (
                <>
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
                  {currentUser?.username === profile.username && (
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => handleEditPost(post.id, post.content)} className="bg-blue-500 text-white px-3 py-1 rounded">Modifier</button>
                      {!post.isPinned && (
                        <button onClick={() => handlePinToggle(post.id, false)} className="bg-yellow-500 text-white px-3 py-1 rounded">Épingler</button>
                      )}
                      <button onClick={() => handleDeletePost(post.id)} className="bg-red-600 text-white px-3 py-1 rounded">Supprimer</button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
