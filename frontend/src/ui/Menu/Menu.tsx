import { useState, useEffect } from "react";
import { Button } from "../../ui/Bouton/Bouton";
import Icons_Parametres from "../../ui/Icons/icons_parametre";

interface ProfileActionsProps {
  profile: any;
  currentUser: { username: string } | null;
  username: string;
  refreshProfile: () => void;
}

export default function ProfileActions({
  profile,
  currentUser,
  username,
  refreshProfile,
}: ProfileActionsProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [formData, setFormData] = useState({
    bio: profile.bio || "",
    profilePicture: profile.profilePicture || "",
    banner: profile.banner || "",
    location: profile.location || "",
    website: profile.website || "",
  });
  const [isBlocked, setIsBlocked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [localIsPrivate, setLocalIsPrivate] = useState<boolean>(
    !!profile.isPrivate
  );

  useEffect(() => {
    setFormData({
      bio: profile.bio || "",
      profilePicture: profile.profilePicture || "",
      banner: profile.banner || "",
      location: profile.location || "",
      website: profile.website || "",
    });
    setLocalIsPrivate(profile.isPrivate); // ✅ Mettre à jour localIsPrivate quand profile change
  }, [profile]);

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
          const blocked = blockedUsers.find(
            (u: any) => u.username === username
          );
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
      const response = await fetch(
        `http://localhost:8080/api/profile/${username}/edit`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );
      if (!response.ok) throw new Error();
      await response.json();
      refreshProfile();
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Erreur update profil:", error);
    }
  };

  const handleToggleReadOnlyMode = async () => {
    const token = localStorage.getItem("token");
    if (!token || !profile) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/profile/${username}/readonly`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ readOnlyMode: !profile.readOnlyMode }),
        }
      );
      if (!response.ok) throw new Error();
      await response.json();
      refreshProfile();
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

  const handleTogglePrivateProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token || !profile) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/profile/${username}/edit`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isPrivate: !localIsPrivate }), // ✅ on utilise local
        }
      );
      if (!response.ok) throw new Error();
      await response.json();
      setLocalIsPrivate((prev) => !prev); // ✅ on inverse l'état local directement
      refreshProfile();
    } catch (error) {
      console.error("Erreur bascule mode privé:", error);
    }
  };

  const handleToggleCommentPrivacy = async () => {
    const token = localStorage.getItem("token");
    if (!token || !profile) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/profile/${username}/toggle-comment-privacy`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            onlyFollowersCanComment: !profile.onlyFollowersCanComment,
          }),
        }
      );
      if (!response.ok) throw new Error();
      await response.json();
      refreshProfile();
    } catch (error) {
      console.error("Erreur réglage commentaires:", error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen((prevState) => !prevState);
  };

  return (
    <>
      <div className="flex justify-end relative">
        <button onClick={toggleMenu} className="w-6 h-6 text-gray-600">
          {isMenuOpen ? (
            <span className="text-xl font-bold">×</span>
          ) : (
            <Icons_Parametres />
          )}
        </button>

        {isMenuOpen && (
          <div className="absolute top-8 right-0 flex flex-col bg-white shadow-md rounded-lg p-4 space-y-2 z-10">
            {currentUser?.username === profile.username ? (
              <>
                {!isEditingProfile && (
                  <Button onClick={handleEditProfileToggle} variant="cyan">
                    Modifier Profil
                  </Button>
                )}
                {!isEditingProfile && (
                  <Button onClick={handleToggleReadOnlyMode} variant="purple">
                    {profile.readOnlyMode
                      ? "Désactiver Lecture Seule"
                      : "Activer Lecture Seule"}
                  </Button>
                )}
                <Button onClick={handleToggleCommentPrivacy} variant="yellow">
                  {profile.onlyFollowersCanComment
                    ? "Autoriser tous les commentaires"
                    : "Limiter aux abonnés"}
                </Button>

                {/* BOUTON MODE PRIVÉ */}
                <Button onClick={handleTogglePrivateProfile} variant="blue">
                  {localIsPrivate
                    ? "Désactiver Mode Privé"
                    : "Activer Mode Privé"}
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleFollowToggle} variant="cyan">
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
        )}
      </div>

      {/* Formulaire modification profil */}
      {isEditingProfile && (
        <div className="flex flex-col space-y-2 mt-4 bg-white p-4 rounded-lg shadow">
          <input
            type="text"
            name="bio"
            value={formData.bio}
            onChange={handleChangeProfile}
            placeholder="Bio"
            className="border border-gray-300 rounded p-2"
          />
          <input
            type="text"
            name="profilePicture"
            value={formData.profilePicture}
            onChange={handleChangeProfile}
            placeholder="Photo de profil (URL)"
            className="border border-gray-300 rounded p-2"
          />
          <input
            type="text"
            name="banner"
            value={formData.banner}
            onChange={handleChangeProfile}
            placeholder="Bannière (URL)"
            className="border border-gray-300 rounded p-2"
          />
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChangeProfile}
            placeholder="Localisation"
            className="border border-gray-300 rounded p-2"
          />
          <input
            type="text"
            name="website"
            value={formData.website}
            onChange={handleChangeProfile}
            placeholder="Site web"
            className="border border-gray-300 rounded p-2"
          />
          <div className="flex gap-2 mt-2">
            <Button onClick={handleSubmitProfile} variant="green">
              Enregistrer
            </Button>
            <Button onClick={handleEditProfileToggle} variant="gray">
              Annuler
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
