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
  Save,
  X,
  Loader2,
} from "lucide-react";
import { useJournal } from "@/hooks/useJournal";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { AnimatedTag } from "@/components/ui/animated-tag";
import { TypewriterSummary } from "@/components/ui/typewriter-summary";

export default function JournalPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEntryContent, setNewEntryContent] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    entries,
    loading,
    error,
    total,
    createEntry,
    updateEntry,
    deleteEntry,
    setFilters,
    processingEntries,
    completedEntries,
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

  const handleEditEntry = (entry: any) => {
    setEditingEntry(entry.id);
    setEditContent(entry.content);
  };

  const handleSaveEdit = async () => {
    if (!editingEntry || !editContent.trim()) return;

    setIsUpdating(true);
    try {
      await updateEntry(editingEntry, { content: editContent });
      setEditingEntry(null);
      setEditContent("");
    } catch (error) {
      console.error("Failed to update entry:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setEditContent("");
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
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    {total} entries total
                  </p>
                  {processingEntries.size > 0 && (
                    <div className="flex items-center gap-1">
                      <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />
                      <span className="text-xs text-blue-600">
                        {processingEntries.size} processing
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {entries.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card
                    className={`hover:shadow-md transition-all duration-300 ${
                      processingEntries.has(entry.id)
                        ? "bg-blue-50/30 border-blue-200"
                        : ""
                    }`}
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
                          {processingEntries.has(entry.id) ? (
                            <motion.div
                              className="flex items-center gap-2 mb-2"
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                              <span className="text-sm text-blue-600">
                                Processing with AI...
                              </span>
                            </motion.div>
                          ) : (
                            <>
                              {entry.mood && (
                                <motion.div
                                  className="flex items-center gap-2 mb-2"
                                  initial={
                                    completedEntries.has(entry.id)
                                      ? { opacity: 0, x: -10 }
                                      : false
                                  }
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{
                                    duration: completedEntries.has(entry.id)
                                      ? 0.5
                                      : 0,
                                    delay: completedEntries.has(entry.id)
                                      ? 0.2
                                      : 0,
                                  }}
                                >
                                  <span className="text-sm font-medium">
                                    Mood:
                                  </span>
                                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    {entry.mood}
                                  </span>
                                </motion.div>
                              )}
                              {entry.tags && entry.tags.length > 0 && (
                                <div className="flex items-center gap-2 mb-2">
                                  <Tag className="h-4 w-4 text-muted-foreground" />
                                  <div className="flex gap-1">
                                    {entry.tags.map((tag, index) => (
                                      <AnimatedTag
                                        key={index}
                                        tag={tag}
                                        index={index}
                                        delay={0.15}
                                        shouldAnimate={completedEntries.has(
                                          entry.id
                                        )}
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {editingEntry === entry.id ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSaveEdit}
                                disabled={isUpdating || !editContent.trim()}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCancelEdit}
                                disabled={isUpdating}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditEntry(entry)}
                                disabled={editingEntry !== null}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteEntry(entry.id)}
                                disabled={editingEntry !== null}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {editingEntry === entry.id ? (
                        <>
                          <textarea
                            placeholder="Edit your entry..."
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={6}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                          <div className="flex justify-end space-x-2 mt-4">
                            <Button
                              variant="outline"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleSaveEdit}
                              disabled={isUpdating || !editContent.trim()}
                            >
                              {isUpdating ? "Saving..." : "Save Changes"}
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="prose prose-sm max-w-none">
                          <p className="whitespace-pre-wrap">{entry.content}</p>
                        </div>
                      )}
                      {processingEntries.has(entry.id) ? (
                        <motion.div
                          className="mt-4 p-3 bg-blue-50 rounded-lg"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                        >
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                            <p className="text-sm font-medium text-blue-900">
                              Generating AI summary...
                            </p>
                          </div>
                        </motion.div>
                      ) : entry.summary ? (
                        <TypewriterSummary
                          text={entry.summary}
                          speed={25}
                          delay={0.3}
                          shouldAnimate={completedEntries.has(entry.id)}
                        />
                      ) : null}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </>
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
}
