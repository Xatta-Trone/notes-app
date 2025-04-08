import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { NOTE_COLORS } from "@/constants/colors";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X } from "lucide-react";

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNoteCreated: () => void;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

export default function CreateNoteModal({
  isOpen,
  onClose,
  onNoteCreated,
}: CreateNoteModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    color: NOTE_COLORS[7].value, // Default to white
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/categories`,
          {
            credentials: "include",
          }
        );
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        setCategories(data.categories);
      } catch (error) {
        console.error("Fetch categories error:", error);
        toast.error("Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          categories: selectedCategories,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create note");
      }

      toast.success("Note created successfully");
      onNoteCreated();
      onClose();
      setFormData({ title: "", body: "", color: NOTE_COLORS[7].value });
      setSelectedCategories([]);
    } catch (error) {
      console.error("Create note error:", error);
      toast.error("Failed to create note", {
        style: { background: "#dc2626", color: "white" },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategories((prev) => {
      const newCategories = prev.includes(value)
        ? prev.filter((id) => id !== value)
        : [...prev, value];
      return newCategories;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[85vh] w-full">
        <DialogHeader>
          <DialogTitle>Create New Note</DialogTitle>
        </DialogHeader>
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
              required
            />
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
              className="min-h-[200px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Categories</Label>
            <Select onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder="Select categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id}
                      className="flex items-center gap-2"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span>{category.name}</span>
                        </div>
                        {selectedCategories.includes(category.id) && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Selected Categories Display */}
            {selectedCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 p-2 bg-muted/30 rounded-lg">
                {selectedCategories.map((id) => {
                  const category = categories.find((c) => c.id === id);
                  return (
                    category && (
                      <div
                        key={id}
                        className="flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors"
                        style={{ 
                          backgroundColor: category.color,
                          color: '#ffffff',
                        }}
                      >
                        <span>{category.name}</span>
                        <button
                          type="button"
                          onClick={() => handleCategoryChange(id)}
                          className="ml-1 text-white hover:text-red-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )
                  )
                })}
              </div>
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

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Note"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}