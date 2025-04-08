"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AppLayout from "@/components/layout/AppLayout";
import AuthGuard from "@/components/auth/AuthGuard";
import { NOTE_COLORS } from "@/constants/colors";

interface NoteFormData {
  title: string;
  body: string;
  color: string; // Remove optional flag since we always provide a default
  categories?: string[];
}

interface ServerErrors {
  title?: string;
  body?: string;
  color?: string;
  categories?: string;
  server?: string;
}

export default function CreateNotePage() {
  const router = useRouter();

  const initialFormState: NoteFormData = {
    title: "",
    body: "",
    color: "#ffffff", // Default color
  };

  const [formData, setFormData] = useState<NoteFormData>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ServerErrors>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          body: formData.body,
          ...(formData.color && { color: formData.color }),
          ...(formData.categories?.length && { categories: formData.categories }),
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Note created successfully!");
        // Reset form to initial state
        setFormData(initialFormState);
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
      console.error("Create note error:", error);
      setErrors({ server: "Error creating note" });
      toast.error("Error creating note", {
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
          <Card>
            <CardHeader>
              <CardTitle>Create New Note</CardTitle>
              <CardDescription>Add a new note to your collection</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Enter note title"
                    className={errors.title ? "border-red-500" : ""}
                    required
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">{errors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="body">Content</Label>
                  <Textarea
                    id="body"
                    value={formData.body}
                    onChange={(e) =>
                      setFormData({ ...formData, body: e.target.value })
                    }
                    placeholder="Enter note content"
                    className={errors.body ? "border-red-500" : ""}
                    required
                  />
                  {errors.body && (
                    <p className="text-sm text-red-500">{errors.body}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {NOTE_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          formData.color === color.value
                            ? 'border-black dark:border-white scale-110'
                            : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => setFormData({ ...formData, color: color.value })}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>

                {errors.server && (
                  <p className="text-sm text-red-500 text-center">
                    {errors.server}
                  </p>
                )}

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Note"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}