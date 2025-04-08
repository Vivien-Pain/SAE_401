import { useEffect, useState } from "react";

interface Notification {
  id: number;
  type: string;
  senderUsername: string;
  postId: number | null;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch("http://localhost:8080/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error("Erreur récupération notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  return (
    <div className="relative">
      {/* Icône cloche (remplace ici par ton SVG custom) */}
      <button
        onClick={toggleDropdown}
        className="relative w-8 h-8 flex items-center justify-center"
      >
        {/* --- SVG cloche personnalisé à mettre ici --- */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 text-gray-700"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405C18.79 14.79 18 13.42 18 12V8a6 6 0 10-12 0v4c0 1.42-.79 2.79-1.595 3.595L3 17h5m7 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Badge pour nombre de notifications non lues */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown notifications */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4 font-semibold text-gray-700 border-b">
            Notifications
          </div>
          {notifications.length === 0 && (
            <div className="p-4 text-gray-500">Aucune notification</div>
          )}
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="p-4 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
            >
              <p className="text-sm">
                {notif.type === "like" &&
                  `${notif.senderUsername} a aimé votre post`}
                {notif.type === "retweet" &&
                  `${notif.senderUsername} a retweeté votre post`}
                {notif.type === "reply" &&
                  `${notif.senderUsername} a répondu à votre post`}
                {notif.type === "follow" &&
                  `${notif.senderUsername} vous suit maintenant`}
                {notif.type === "mention" &&
                  `${notif.senderUsername} vous a mentionné`}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(notif.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
