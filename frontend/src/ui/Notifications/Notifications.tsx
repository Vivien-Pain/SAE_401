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

  const respondFollowRequest = async (id: number, accept: boolean) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(
        `http://localhost:8080/api/follow_requests/${id}/respond`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ accept }),
        }
      );

      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (error) {
      console.error("Erreur validation demande de suivi:", error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="relative w-8 h-8 flex items-center justify-center"
      >
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

        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

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
              {notif.type === "follow_request" ? (
                <div className="flex justify-between items-center">
                  <p className="text-sm">
                    {notif.senderUsername} a demandé à vous suivre.
                  </p>
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => respondFollowRequest(notif.id, true)}
                      className="text-green-500 font-bold"
                    >
                      Accepter
                    </button>
                    <button
                      onClick={() => respondFollowRequest(notif.id, false)}
                      className="text-red-500 font-bold"
                    >
                      Refuser
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm">{notif.type}</p>
              )}
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
