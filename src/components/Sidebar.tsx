import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove logged-in user
    localStorage.removeItem("study_planner_logged_in_user");

    // Go to login page
    navigate("/login", { replace: true });
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: "🏠",
    },
    {
      name: "Goals",
      path: "/goals",
      icon: "🎯",
    },
    {
      name: "Schedule",
      path: "/schedule",
      icon: "📅",
    },
    {
      name: "AI Planner",
      path: "/ai-planner",
      icon: "🤖",
    },
    {
      name: "Progress",
      path: "/progress",
      icon: "📊",
    },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-white shadow-sm">

      {/* Logo / App Name */}
      <div className="border-b border-gray-200 px-6 py-6">

        <h1 className="text-xl font-bold text-blue-600">
          Study Planner
        </h1>

        <p className="mt-1 text-xs text-gray-500">
          AI-powered productivity
        </p>

      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">

        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Menu
        </p>

        <div className="space-y-2">

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              <span className="text-lg">
                {item.icon}
              </span>

              <span>
                {item.name}
              </span>
            </NavLink>
          ))}

        </div>

      </nav>

      {/* User / Logout */}
      <div className="border-t border-gray-200 p-4">

        <div className="mb-3 rounded-lg bg-gray-50 p-3">

          <p className="text-xs text-gray-500">
            Logged in as
          </p>

          <p className="mt-1 truncate text-sm font-semibold text-gray-800">
            {getLoggedInUserName()}
          </p>

        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          <span className="text-lg">
            🚪
          </span>

          <span>
            Logout
          </span>
        </button>

      </div>

    </aside>
  );
}


/*
 * Get logged-in user's name from localStorage.
 */
function getLoggedInUserName() {
  try {
    const user = localStorage.getItem(
      "study_planner_logged_in_user"
    );

    if (!user) {
      return "User";
    }

    const parsedUser = JSON.parse(user);

    return parsedUser?.name || "User";

  } catch (error) {
    console.error(
      "Could not read logged-in user:",
      error
    );

    return "User";
  }
}


export default Sidebar;