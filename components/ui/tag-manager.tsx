"use client";

import { useState, useEffect } from "react";
import { Tag } from "@/data/types";
import { getAllTags, createTag, updateTag, deleteTag, getTagColors } from "@/lib/tags";
import { Plus, Edit2, Trash2, Save, X, Tag as TagIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagManagerProps {
  onTagsUpdate?: () => void;
  className?: string;
  refreshKey?: number;
}

export function TagManager({ onTagsUpdate, className, refreshKey }: TagManagerProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3B82F6");
  const [editTagName, setEditTagName] = useState("");
  const [editTagColor, setEditTagColor] = useState("");


  const colors = getTagColors();

  const refreshTags = async () => {
    try {
      const updatedTags = await getAllTags();
      setTags([...updatedTags]); // Force new array reference
    } catch (error) {
      console.error('Failed to refresh tags:', error);
    }
  };

  // Load tags on component mount
  useEffect(() => {
    const loadTags = async () => {
      try {
        const updatedTags = await getAllTags();
        setTags([...updatedTags]);
      } catch (error) {
        console.error('Failed to load tags:', error);
        setTags([]);
      }
    };
    loadTags();
  }, []);

  // Refresh tags when refreshKey changes
  useEffect(() => {
    if (refreshKey !== undefined && refreshKey > 0) {
      const loadTags = async () => {
        try {
          const updatedTags = await getAllTags();
          setTags([...updatedTags]);
        } catch (error) {
          console.error('Failed to refresh tags:', error);
        }
      };
      loadTags();
    }
  }, [refreshKey]);

  const handleCreateTag = async () => {
    if (newTagName.trim()) {
      try {
        await createTag(newTagName.trim(), newTagColor);
        setNewTagName("");
        setNewTagColor("#3B82F6");
        setIsCreating(false);
        // Refresh tags locally
        const updatedTags = await getAllTags();
        setTags([...updatedTags]);
        onTagsUpdate?.();
      } catch (error) {
        console.error('Failed to create tag:', error);
      }
    }
  };

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag.id);
    setEditTagName(tag.name);
    setEditTagColor(tag.color);
  };

  const handleUpdateTag = async (tagId: string) => {
    if (editTagName.trim()) {
      try {
        await updateTag(tagId, { name: editTagName.trim(), color: editTagColor });
        setEditingTag(null);
        setEditTagName("");
        setEditTagColor("");
        const updatedTags = await getAllTags();
        setTags([...updatedTags]);
        onTagsUpdate?.();
      } catch (error) {
        console.error('Failed to update tag:', error);
      }
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (confirm("Are you sure you want to delete this tag?")) {
      try {
        await deleteTag(tagId);
        const updatedTags = await getAllTags();
        setTags([...updatedTags]);
        onTagsUpdate?.();
      } catch (error) {
        console.error('Failed to delete tag:', error);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingTag(null);
    setEditTagName("");
    setEditTagColor("");
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setNewTagName("");
    setNewTagColor("#3B82F6");
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <TagIcon size={20} />
          Tags
        </h3>
        <button
          onClick={() => setIsCreating(true)}
          className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          title="Create new tag"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Create New Tag */}
      {isCreating && (
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Tag name"
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setNewTagColor(color)}
                className={cn(
                  "w-6 h-6 rounded-full border-2 transition-all",
                  newTagColor === color
                    ? "border-gray-900 dark:border-gray-100 scale-110"
                    : "border-gray-300 dark:border-gray-600"
                )}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreateTag}
              disabled={!newTagName.trim()}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save size={14} />
              Create
            </button>
            <button
              onClick={handleCancelCreate}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              <X size={14} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tags List */}
      <div className="space-y-2">
        {tags.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No tags created yet</p>
        ) : (
          tags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {editingTag === tag.id ? (
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={editTagName}
                    onChange={(e) => setEditTagName(e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <div className="flex flex-wrap gap-1">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setEditTagColor(color)}
                        className={cn(
                          "w-5 h-5 rounded-full border transition-all",
                          editTagColor === color
                            ? "border-gray-900 dark:border-gray-100 scale-110"
                            : "border-gray-300 dark:border-gray-600"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleUpdateTag(tag.id)}
                      disabled={!editTagName.trim()}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Save size={10} />
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                    >
                      <X size={10} />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 flex-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {tag.name}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditTag(tag)}
                      className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                      title="Edit tag"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setTimeout(() => {
                          handleDeleteTag(tag.id);
                        }, 50);
                      }}
                      className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                      title="Delete tag"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}