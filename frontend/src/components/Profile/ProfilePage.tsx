import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Post from "../../ui/Post/Post";
import { Button } from "../../ui/Bouton/Bouton";

// Import des styles CVA
import {
  profilePageContainer,
  profileMainWrapper,
  bannerContainer,
  bannerImage,
  profilePicture,
  profileInfoContainer,
  profileUsername,
  profileInfoRow,
  profileTextInfo,
  profileLocationWebsite,
  actionButtonsContainer,
  editProfileFormContainer,
  editProfileInput,
  pinnedPostContainer,
  pinnedPostTitle,
  postsListContainer,
  postsListTitle,
  singlePostContainer,
  noPostText,
  editPostTextarea,
  postActionButtonsContainer,
} from "./ProfilePageStyles";

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
      window.location.reload(); // Simpliste, recharge toute la page 
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

  if (!profile) {
    return <p className="text-center mt-8">Chargement...</p>;
  }

  return (
    <div className={profilePageContainer()}>
      <div className={profileMainWrapper()}>
        {/* Bannière + Photo de profil */}
        <div className={bannerContainer()}>
          <img
            src={profile.banner}
            alt="Bannière"
            className={bannerImage()}
          />
          <img
            src={profile.profilePicture}
            alt="Profil"
            className={profilePicture()}
          />
        </div>

        {/* Section infos utilisateur */}
        <div className={profileInfoContainer()}>
          <h1 className={profileUsername()}>{profile.username}</h1>
          <div className={profileInfoRow()}>
            <div className={profileTextInfo()}>
              <p>{profile.bio}</p>
              {profile.location && (
                <p className={profileLocationWebsite()}>
                  📍 {profile.location}
                </p>
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

            {/* Boutons d’action */}
            <div className={actionButtonsContainer()}>
              {/* Si c'est le profil de l'utilisateur courant */}
              {currentUser?.username === profile.username ? (
                <>
                  <Button
                    onClick={handleEditProfileToggle}
                    variant="cyan"
                  >
                    Modifier Profil
                  </Button>
                  <Button
                    onClick={handleToggleReadOnlyMode}
                    variant="purple"
                  >
                    {profile.readOnlyMode
                      ? "Désactiver Lecture Seule"
                      : "Activer Lecture Seule"}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleFollowToggle}
                    variant="cyan"
                  >
                    {isFollowing ? "Se désabonner" : "Suivre"}
                  </Button>
                  <Button
                    onClick={handleBlockToggle}
                    variant={isBlocked ? "green" : "red"}
                  >
                    {isBlocked ? "Débloquer" : "Bloquer"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Formulaire de modification du profil */}
        {isEditingProfile && (
          <div className={editProfileFormContainer()}>
            <input
              type="text"
              name="bio"
              value={formData.bio}
              onChange={handleChangeProfile}
              placeholder="Bio"
              className={editProfileInput()}
            />
            <input
              type="text"
              name="profilePicture"
              value={formData.profilePicture}
              onChange={handleChangeProfile}
              placeholder="Photo de profil (URL)"
              className={editProfileInput()}
            />
            <input
              type="text"
              name="banner"
              value={formData.banner}
              onChange={handleChangeProfile}
              placeholder="Bannière (URL)"
              className={editProfileInput()}
            />
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChangeProfile}
              placeholder="Localisation"
              className={editProfileInput()}
            />
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleChangeProfile}
              placeholder="Site web"
              className={editProfileInput()}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSubmitProfile}
                variant="green"
              >
                Enregistrer
              </Button>
              <Button
                onClick={handleEditProfileToggle}
                variant="gray"
              >
                Annuler
              </Button>
            </div>
          </div>
        )}

        {/* Post épinglé */}
        {profile.pinnedPost && (
          <div className={pinnedPostContainer()}>
            <h2 className={pinnedPostTitle()}>Post Épinglé</h2>
            <Post {...profile.pinnedPost} isCensored={false} />
            {currentUser?.username === profile.username && (
              <Button
                onClick={() => handlePinToggle(profile.pinnedPost!.id, true)}
                variant="yellow"
              >
                Désépingler
              </Button>
            )}
          </div>
        )}

        {/* Liste des posts */}
        <div className={postsListContainer()}>
          <h2 className={postsListTitle()}>Posts</h2>
          {profile.posts.length === 0 ? (
            <p className={noPostText()}>Aucun post trouvé.</p>
          ) : (
            profile.posts.map((post) => (
              <div key={post.id} className={singlePostContainer()}>
                {editingPostId === post.id ? (
                  <>
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className={editPostTextarea()}
                      rows={3}
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
                    {/* Boutons d'action sur le post si c'est le profil de l'utilisateur */}
                    {currentUser?.username === profile.username && (
                      <div className={postActionButtonsContainer()}>
                        <Button
                          onClick={() => handleEditPost(post.id, post.content)}
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
  );
}
