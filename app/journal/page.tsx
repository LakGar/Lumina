"use client";

import { useState } from "react";
import ProtectedLayout from "@/components/layout/protected-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  Tag,
} from "lucide-react";
import { useJournal } from "@/hooks/useJournal";
import { format } from "date-fns";

export default function JournalPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEntryContent, setNewEntryContent] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const {
    entries,
    loading,
    error,
    total,
    createEntry,
    deleteEntry,
    setFilters,
  } = useJournal({ limit: 20 });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters({ search: value });
  };

  const handleCreateEntry = async () => {
    if (!newEntryContent.trim()) return;

    setIsCreating(true);
    try {
      await createEntry({ content: newEntryContent });
      setNewEntryContent("");
      setShowCreateForm(false);
    } catch (error) {
      console.error("Failed to create entry:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      try {
        await deleteEntry(id);
      } catch (error) {
        console.error("Failed to delete entry:", error);
      }
    }
  };

  if (loading && entries.length === 0) {
    return (
      <ProtectedLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Journal</h1>
              <p className="text-muted-foreground">
                Capture your thoughts, feelings, and experiences
              </p>
            </div>
          </div>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading entries...</p>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Journal</h1>
            <p className="text-muted-foreground">
              Capture your thoughts, feelings, and experiences
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Entry
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Entry</CardTitle>
              <CardDescription>
                Write your thoughts and feelings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                placeholder="What's on your mind today?"
                value={newEntryContent}
                onChange={(e) => setNewEntryContent(e.target.value)}
                rows={6}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewEntryContent("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateEntry}
                  disabled={isCreating || !newEntryContent.trim()}
                >
                  {isCreating ? "Creating..." : "Create Entry"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {entries.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Your Journal Entries</CardTitle>
                <CardDescription>
                  All your personal thoughts and reflections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="mx-auto h-16 w-16 mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No entries yet</h3>
                  <p className="mb-4">
                    Start your journaling journey by creating your first entry
                  </p>
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Write Your First Entry
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {total} entries total
                </p>
              </div>

              {entries.map((entry) => (
                <Card
                  key={entry.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {format(
                              new Date(entry.createdAt),
                              "MMM d, yyyy 'at' h:mm a"
                            )}
                          </span>
                        </div>
                        {entry.mood && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium">Mood:</span>
                            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {entry.mood}
                            </span>
                          </div>
                        )}
                        {entry.tags.length > 0 && (
                          <div className="flex items-center gap-2 mb-2">
                            <Tag className="h-4 w-4 text-muted-foreground" />
                            <div className="flex gap-1">
                              {entry.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // TODO: Implement edit functionality
                            console.log("Edit entry:", entry.id);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEntry(entry.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap">{entry.content}</p>
                    </div>
                    {entry.summary && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 mb-1">
                          AI Summary:
                        </p>
                        <p className="text-sm text-blue-800">{entry.summary}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
}
