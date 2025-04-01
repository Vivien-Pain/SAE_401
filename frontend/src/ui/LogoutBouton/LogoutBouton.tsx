
const LogoutButton = () => {
    const handleLogout = async () => {
        await fetch("/logout", {
            method: "POST",
            credentials: "include",
        });
        window.location.href = "/"; // Redirection après la déconnexion
    };

    return (
        <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
            Déconnexion
        </button>
    );
};

export default LogoutButton;
