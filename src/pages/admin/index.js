import AdminLayout from "@/components/layouts/AdminLayout";
import AdminDashboard from "@/features/admin/components/Dashboard";
import withProtectedRoute from "@/utils/protectedRoute";

function AdminPage() {
  return <AdminDashboard />;
}

// Define the layout for this page
AdminPage.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

// Wrap with protected route for admin only
export default withProtectedRoute(AdminPage, { adminOnly: true });
