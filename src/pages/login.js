import Link from 'next/link';
import MainLayout from "@/components/layouts/MainLayout";
import LoginForm from "@/features/auth/components/LoginForm";
import { withPublicRoute } from "@/utils/protectedRoute";

function Login() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Login to Your Account</h1>
        <LoginForm />
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-800">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Define the layout for this page
Login.getLayout = (page) => <MainLayout>{page}</MainLayout>;

// Wrap with public route protection (redirects to home if already logged in)
export default withPublicRoute(Login);
