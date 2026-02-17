import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";

export default function AdminHeader({ theme }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-6">
        <Link
          to="/admin/blog"
          className="text-sm tracking-wide"
          style={{ color: theme.text }}
        >
          Admin Blog
        </Link>
        <Link
          to="/admin/feed"
          className="text-sm tracking-wide"
          style={{ color: theme.text }}
        >
          Admin Feed
        </Link>
      </div>
      <button
        onClick={async () => {
          await signOut();
          navigate("/admin/login");
        }}
        className="inline-flex items-center gap-2 text-sm"
        style={{ color: theme.text }}
      >
        <LogOut size={14} /> Sign out
      </button>
    </div>
  );
}
