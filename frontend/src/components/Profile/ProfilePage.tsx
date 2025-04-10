import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Post from "../../ui/Post/Post";
import ProfileActions from "../../ui/Menu/Menu";
import { Button } from "../../ui/Bouton/Bouton";
import NotificationBell from "../../ui/Notifications/Notifications";

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
  isPrivate: boolean; // AJOUT ICI
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<{ username: string } | null>(
    null
  );
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState<string>("");

  useEffect(() => {
    if (!username) return;
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/profile/${username}`);
      const data = await res.json();
      setProfile(data);
    } catch (error) {
      console.error("Erreur profil:", error);
    }
  };

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

  const handleEditPost = (postId: number, currentContent: string) => {
    setEditingPostId(postId);
    setEditedContent(currentContent);
  };

  const handleSubmitEditPost = async (postId: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/posts/${postId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: editedContent }),
        }
      );
      if (!response.ok) throw new Error();
      const updated = await response.json();
      setProfile((prev) => ({
        ...prev!,
        posts: prev!.posts.map((p) =>
          p.id === updated.id ? { ...p, content: updated.content } : p
        ),
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
      const response = await fetch(
        `http://localhost:8080/api/posts/${postId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error();
      setProfile((prev) => ({
        ...prev!,
        posts: prev!.posts.filter((p) => p.id !== postId),
      }));
    } catch (error) {
      console.error("Erreur suppression post:", error);
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
      fetchProfile();
    } catch (error) {
      console.error("Erreur pin/unpin:", error);
    }
  };

  const handleFollowRequest = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await fetch(
        `http://localhost:8080/api/profile/${profile!.username}/follow`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Demande de suivi envoyée.");
    } catch (error) {
      console.error("Erreur demande de suivi:", error);
    }
  };

  if (!profile) {
    return <p className="text-center mt-8">Chargement...</p>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto w-full pb-8">
        {/* Bannière */}
        <div className="relative w-full h-48 bg-gray-300 overflow-hidden">
          <img
            src={profile.banner}
            alt="Bannière"
            className="object-cover w-full h-full shadow-sm"
          />
          <img
            src={profile.profilePicture}
            alt="Profil"
            className="absolute w-24 h-24 rounded-full border-4 border-white shadow-md bottom-0 left-4 -mb-12"
          />
        </div>

        {/* Notifications */}
        <div className="flex justify-end mr-4 mt-16">
          <NotificationBell />
        </div>

        {/* Infos utilisateur */}
        <div className="bg-white shadow-md rounded mt-6 p-4">
          <h1 className="text-2xl font-bold">{profile.username}</h1>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2">
            <div className="text-gray-700 space-y-1">
              <p>{profile.bio}</p>
              {profile.location && (
                <p className="text-sm text-gray-500">📍 {profile.location}</p>
              )}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline text-sm"
                >
                  {profile.website}
                </a>
              )}
            </div>
            <div className="mt-4 sm:mt-0 space-x-2">
              <ProfileActions
                currentUser={currentUser}
                profile={profile}
                username={username!}
                refreshProfile={fetchProfile}
              />
            </div>
          </div>

          {/* Bouton "Demander abonnement" */}
          {profile.isPrivate && currentUser?.username !== profile.username && (
            <div className="mt-4">
              <Button onClick={handleFollowRequest} variant="blue">
                Demander abonnement
              </Button>
            </div>
          )}
        </div>

        {/* Post épinglé */}
        {profile.pinnedPost && (
          <div className="mt-8 bg-white shadow-md rounded p-4">
            <h2 className="text-lg font-bold mb-2">Post Épinglé</h2>
            <Post {...profile.pinnedPost} isCensored={false} isLocked={false} />
            {currentUser?.username === profile.username && (
              <div className="mt-2">
                <Button
                  onClick={() => handlePinToggle(profile.pinnedPost!.id, true)}
                  variant="yellow"
                >
                  Désépingler
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Posts */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 ml-4">Posts</h2>
          <div className="space-y-6 px-4">
            {profile.isPrivate && currentUser?.username !== profile.username ? (
              <p className="text-center text-gray-500 mt-6">
                🔒 Ce compte est privé. Abonnez-vous pour voir les publications.
              </p>
            ) : profile.posts.length === 0 ? (
              <p className="text-gray-400">Aucun post trouvé.</p>
            ) : (
              profile.posts.map((post) => (
                <div key={post.id} className="bg-white shadow rounded p-4">
                  {editingPostId === post.id ? (
                    <>
                      <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        rows={3}
                        className="w-full border p-2 rounded resize-none focus:ring-2 focus:ring-purple-500"
                      />
                      <div className="flex gap-2 mt-2">
                        <Button
                          onClick={() => handleSubmitEditPost(post.id)}
                          variant="green"
                        >
                          Enregistrer
                        </Button>
                        <Button
                          onClick={() => setEditingPostId(null)}
                          variant="gray"
                        >
                          Annuler
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Ton composant Post */}
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
                        isLocked={false}
                      />
                      {currentUser?.username === profile.username && (
                        <div className="flex gap-2 mt-4">
                          <Button
                            onClick={() =>
                              handleEditPost(post.id, post.content)
                            }
                            variant="cyan"
                          >
                            Modifier
                          </Button>
                          {!post.isPinned && (
                            <Button
                              onClick={() => handlePinToggle(post.id, false)}
                              variant="yellow"
                            >
                              Épingler
                            </Button>
                          )}
                          <Button
                            onClick={() => handleDeletePost(post.id)}
                            variant="red"
                          >
                            Supprimer
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
