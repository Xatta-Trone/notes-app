"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ServerErrors {
  email?: string;
  password?: string;
  server?: string;
}

interface User {
  id: string;
  username: string;
  email: string;
}

interface ServerResponse {
  success: boolean;
  errors?: ServerErrors;
  message?: string;
  token?: string;
  user?: User;
}

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ServerErrors>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.emailOrUsername, // Send as 'email' to match backend
            password: formData.password,
          }),
          credentials: "include", // Important for receiving cookies
        }
      );

      const data: ServerResponse = await response.json();

      if (response.ok && data.success) {
        // Store token and user data
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        toast.success(data.message || "Login successful!");
        router.push("/"); // Changed from /dashboard to /
      } else {
        setErrors(data.errors || {});
        if (data.errors) {
          const firstError = Object.values(data.errors)[0];
          toast.error(firstError, {
            style: { background: "#dc2626", color: "white" },
          });
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrors({ server: "Server error. Please try again later." });
      toast.error("Server error. Please try again later.", {
        style: { background: "#dc2626", color: "white" },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="emailOrUsername">Email or Username</Label>
                <Input
                  id="emailOrUsername"
                  type="text"
                  placeholder="Enter your email or username"
                  value={formData.emailOrUsername}
                  onChange={(e) =>
                    setFormData({ ...formData, emailOrUsername: e.target.value })
                  }
                  className={errors.email ? "border-red-500" : ""}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className={errors.password ? "border-red-500" : ""}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>
            {errors.server && (
              <p className="text-sm text-red-500 text-center">{errors.server}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
            <div className="space-y-2 text-center text-sm">
              <p>
                <Link
                  href="/forgot-password"
                  className="text-blue-500 hover:underline"
                >
                  Forgot your password?
                </Link>
              </p>
              <p>
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="text-blue-500 hover:underline"
                >
                  Register
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}