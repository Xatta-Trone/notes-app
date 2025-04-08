"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import AuthGuard from "@/components/auth/AuthGuard";
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
import AppLayout from "@/components/layout/AppLayout";

interface User {
  id: string;
  username: string;
  email: string;
}

interface PasswordFormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ServerErrors {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  server?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState<PasswordFormData>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<ServerErrors>({});

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
      } else {
        toast.error("Failed to fetch user data", {
          style: { background: "#dc2626", color: "white" },
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Error fetching user data", {
        style: { background: "#dc2626", color: "white" },
      });
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            oldPassword: passwordFormData.oldPassword,
            newPassword: passwordFormData.newPassword,
            confirmPassword: passwordFormData.confirmPassword,
          }),
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Password updated successfully");
        setPasswordFormData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setErrors(data.errors || {});
        if (data.errors) {
          const firstError = Object.values(data.errors)[0];
          toast.error(firstError as string, {
            style: { background: "#dc2626", color: "white" },
          });
        }
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Error resetting password", {
        style: { background: "#dc2626", color: "white" },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <AppLayout>
        <div className="container mx-auto p-4">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* User Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>View your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label>Username</Label>
                  <p className="text-lg font-medium">{user?.username}</p>
                </div>
                <div className="space-y-1">
                  <Label>Email</Label>
                  <p className="text-lg font-medium">{user?.email}</p>
                </div>
              </CardContent>
            </Card>

            {/* Password Reset Card */}
            <Card>
              <CardHeader>
                <CardTitle>Reset Password</CardTitle>
                <CardDescription>Change your account password</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="oldPassword">Current Password</Label>
                    <Input
                      id="oldPassword"
                      type="password"
                      value={passwordFormData.oldPassword}
                      onChange={(e) =>
                        setPasswordFormData({
                          ...passwordFormData,
                          oldPassword: e.target.value,
                        })
                      }
                      className={errors.oldPassword ? "border-red-500" : ""}
                    />
                    {errors.oldPassword && (
                      <p className="text-sm text-red-500">{errors.oldPassword}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordFormData.newPassword}
                      onChange={(e) =>
                        setPasswordFormData({
                          ...passwordFormData,
                          newPassword: e.target.value,
                        })
                      }
                      className={errors.newPassword ? "border-red-500" : ""}
                    />
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 6 characters long
                    </p>
                    {errors.newPassword && (
                      <p className="text-sm text-red-500">{errors.newPassword}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordFormData.confirmPassword}
                      onChange={(e) =>
                        setPasswordFormData({
                          ...passwordFormData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className={errors.confirmPassword ? "border-red-500" : ""}
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {errors.server && (
                    <p className="text-sm text-red-500 text-center">
                      {errors.server}
                    </p>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Updating Password..." : "Update Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}