import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router";
import { useAuth } from "./hooks/useAuth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "../../shared/components/ui/card";
import { Button } from "../../shared/components/ui/button";
import { Input } from "../../shared/components/ui/input";
import PasswordInput from "../../shared/components/PasswordInput";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "../../shared/components/ui/form";

const formSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
    invitationCode: z.string().min(1, "Invitation code is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const RegisterPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const { register } = useAuth();
  const navigate = useNavigate();

  // Extract invitation code from URL query params if available
  const queryParams = new URLSearchParams(location.search);
  const invitationCodeFromUrl = queryParams.get('code');

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      invitationCode: invitationCodeFromUrl || "",
    },
  });

  // Update form if invitation code in URL changes
  useEffect(() => {
    if (invitationCodeFromUrl) {
      form.setValue('invitationCode', invitationCodeFromUrl);
    }
  }, [invitationCodeFromUrl, form]);

  const onSubmit = async (values) => {
    setIsLoading(true);

    try {
      console.log("RegisterPage: Attempting registration with:", {
        name: values.name,
        email: values.email,
        password: "***",
        invitationCode: values.invitationCode,
      });

      // Call the register function from useAuth hook
      const success = await register({
        name: values.name,
        email: values.email,
        password: values.password,
        invitationCode: values.invitationCode,
      });

      console.log("Registration result:", success);

      if (success) {
        navigate("/dashboard", { replace: true });
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full p-4">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Create an account
            </CardTitle>
            <CardDescription className="text-center">
              Enter your details below to create your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <PasswordInput placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <PasswordInput placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invitationCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invitation Code</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your invitation code" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        You need an invitation code to register. Please contact an administrator if you don't have one.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Register"}
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-500 hover:text-blue-700 font-medium"
              >
                Login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;