import { AuthProvider } from "../lib/auth";
import AdminPage from "./AdminPage";

export default function AdminRoot() {
  return (
    <AuthProvider>
      <AdminPage />
    </AuthProvider>
  );
}
