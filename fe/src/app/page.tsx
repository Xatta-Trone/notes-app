"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { debounce } from "lodash";
import { format } from "date-fns";
import AuthGuard from "@/components/auth/AuthGuard";
import AppLayout from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import NoteDetailsModal from "@/components/notes/NoteDetailsModal";
import CreateNoteModal from "@/components/notes/CreateNoteModal";
import type { Note, PaginationInfo } from "@/types/note";
import { NOTE_COLORS } from "@/constants/colors";
import { Loader2, Plus } from "lucide-react";

interface SearchParams {
  query?: string;
  color?: string;
  page?: number;
  limit?: number;
}

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState<SearchParams>({
    query: searchParams.get("query") || "",
    color: searchParams.get("color") || "",
    page: Number(searchParams.get("page")) || 1,
    limit: Number(searchParams.get("limit")) || 12,
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalNotes: 0,
    limit: 12,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const buildQueryString = (params: SearchParams) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== "") {
        query.append(key, value.toString());
      }
    });
    return query.toString();
  };

  const fetchNotes = async (params: SearchParams) => {
    try {
      const queryString = buildQueryString(params);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/?${queryString}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch notes");
      }

      const data = await response.json();
      setNotes(data.notes);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast.error("Failed to load notes", {
        style: { background: "#dc2626", color: "white" },
      });
    } finally {
      setLoading(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((params: SearchParams) => {
      const queryString = buildQueryString(params);
      router.push(`/?${queryString}`);
      fetchNotes(params);
    }, 500),
    []
  );

  useEffect(() => {
    fetchNotes(searchQuery);
  }, []);

  const handleSearch = (key: keyof SearchParams, value: string) => {
    const newQuery = {
      ...searchQuery,
      [key]: value,
      page: 1, // Reset page when searching
    };
    setSearchQuery(newQuery);
    debouncedSearch(newQuery);
  };

  const handlePageChange = (newPage: number) => {
    const newQuery = { ...searchQuery, page: newPage };
    setSearchQuery(newQuery);
    fetchNotes(newQuery);
  };

  const refreshNotes = useCallback(() => {
    fetchNotes(searchQuery);
  }, [searchQuery]);

  return (
    <AuthGuard>
      <AppLayout>
        <div className="container mx-auto p-4">
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">My Notes</h1>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                New Note
              </Button>
            </div>
            
            <div className="flex flex-wrap items-start gap-4">
              <div className="flex-1 max-w-md space-y-2">
                <Label htmlFor="search">Search notes</Label>
                <div className="relative">
                  <Input
                    id="search"
                    value={searchQuery.query}
                    onChange={(e) => handleSearch("query", e.target.value)}
                    placeholder="Search in title and content..."
                    className="w-full"
                  />
                  {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Filter by color</Label>
                <div className="flex flex-wrap gap-2 items-center">
                  <button
                    type="button"
                    className={`px-3 py-1 rounded-full text-xs border transition-all ${
                      !searchQuery.color
                        ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => handleSearch("color", "")}
                  >
                    All
                  </button>
                  {NOTE_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        searchQuery.color === color.value
                          ? 'border-black dark:border-white scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => handleSearch("color", color.value)}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Full page loading overlay */}
          {loading && (
            <div className="fixed inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading notes...</span>
              </div>
            </div>
          )}

          {!loading && notes.length === 0 ? (
            <div className="text-center">
              <p className="text-muted-foreground">
                No notes found
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {notes.map((note) => (
                  <Card
                    key={note.id}
                    className="p-4 hover:shadow-md transition-shadow cursor-pointer flex flex-col"
                    style={{ borderBottom: `4px solid ${note.color}` }}
                    onClick={() => setSelectedNote(note)}
                  >
                    <div className="flex-1 space-y-2">
                      <h2 className="text-lg font-semibold">{note.title}</h2>
                      <p className="text-sm line-clamp-3">{note.body}</p>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>
                          By: {note.author?.id === JSON.parse(localStorage.getItem('user') || '{}').id ? 'you' : note.author?.username}
                        </span>
                        <span>
                          {format(new Date(note.createdAt), "dd-MMM-yyyy").toLowerCase()}
                        </span>
                      </div>
                      
                      {note.sharedWith.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Shared with: {note.sharedWith.length} users
                        </div>
                      )}

                      {note.categories?.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-2 border-t">
                          {note.categories.map((category) => (
                            <div
                              key={category.id}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
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
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                  <p className="text-sm text-muted-foreground">
                    Showing {notes.length} of {pagination.totalNotes} notes
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-2">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          <CreateNoteModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onNoteCreated={refreshNotes}
          />

          <NoteDetailsModal
            note={selectedNote}
            isOpen={!!selectedNote}
            onClose={() => {
              setSelectedNote(null);
              refreshNotes();
            }}
          />
        </div>
      </AppLayout>
    </AuthGuard>
  );
}


