import Link from 'next/link';
import MainLayout from "@/components/layouts/MainLayout";
import RegisterForm from "@/features/auth/components/RegisterForm";
import { withPublicRoute } from "@/utils/protectedRoute";

function Register() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Create an Account</h1>
        <RegisterForm />
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-800">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Define the layout for this page
Register.getLayout = (page) => <MainLayout>{page}</MainLayout>;

// Wrap with public route protection (redirects to home if already logged in)
export default withPublicRoute(Register);
