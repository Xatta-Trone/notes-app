import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import type { Note } from "@/types/note";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import EditNoteModal from "./EditNoteModal";

interface NoteDetailsModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function NoteDetailsModal({
  note,
  isOpen,
  onClose,
}: NoteDetailsModalProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!note) return; // Add null check
    if (!confirm("Are you sure you want to delete this note?")) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/notes/${note.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete note");
      }

      toast.success("Note deleted successfully");
      onClose();
    } catch (error) {
      console.error("Delete note error:", error);
      toast.error("Failed to delete note", {
        style: { background: "#dc2626", color: "white" },
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const formattedDate = format(d, 'dd-MMM-yyyy').toLowerCase();
    const time = format(d, 'HH:mm');
    const distance = formatDistanceToNow(d, { addSuffix: true });
    return `${formattedDate} at ${time} (${distance})`;
  };

  if (!note) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[90vw] max-h-[85vh] w-full">
          <DialogHeader className="pb-2 relative">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold">{note.title}</DialogTitle>
              {note.isOwner && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowEditModal(true);
                    }}
                    disabled={loading}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                    disabled={loading}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <div 
              className="absolute bottom-0 left-0 right-0 h-[2px]" 
              style={{ backgroundColor: note.color }}
            />
          </DialogHeader>
            
          <div className="overflow-y-auto max-h-[calc(85vh-8rem)]">
            <div className="space-y-6 p-4">
              {/* Note Content */}
              <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap text-base leading-relaxed">
                  {note.body}
                </p>
              </div>

              {/* Categories */}
              {note.categories.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {note.categories.map((category) => (
                      <div
                        key={category.id}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: `${category.color}15`,
                          color: category.color,
                          border: `1px solid ${category.color}30`
                        }}
                      >
                        {category.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="space-y-3 text-sm text-muted-foreground border-t pt-4">
                <div className="flex items-center justify-between">
                  <span>Created by</span>
                  <span className="font-medium">
                    {note.author.username}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Created</span>
                  <span>{formatDate(note.createdAt)}</span>
                </div>
                {note.updatedAt !== note.createdAt && (
                  <div className="flex items-center justify-between">
                    <span>Updated</span>
                    <span>{formatDate(note.updatedAt)}</span>
                  </div>
                )}
                
                {/* Sharing Information */}
                {note.sharedWith.length > 0 && (
                  <div className="pt-2 space-y-2">
                    <h3 className="font-medium">Shared with</h3>
                    <div className="space-y-1 ml-4">
                      {note.sharedWith.map((share) => (
                        <div 
                          key={share.user.id}
                          className="flex items-center justify-between text-xs"
                        >
                          <span>{share.user.username}</span>
                          <span className="px-2 py-0.5 bg-secondary rounded-full">
                            {share.permission}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showEditModal && (
        <EditNoteModal
          note={note}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onNoteUpdated={onClose}
        />
      )}
    </>
  );
}