import { Entry } from "@/data/types";
import { formatDate } from "@/lib/utils";
import { getTagByName } from "@/lib/tags";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

// Helper component to display a tag with async color loading
function TagDisplay({ tagName }: { tagName: string }) {
  const [tagColor, setTagColor] = useState('#3B82F6');
  
  useEffect(() => {
    const loadTag = async () => {
      try {
        const tag = await getTagByName(tagName);
        if (tag) {
          setTagColor(tag.color);
        }
      } catch (error) {
        console.error('Failed to load tag:', error);
      }
    };
    loadTag();
  }, [tagName]);
  
  return (
    <span
      className="px-2 py-1 text-xs rounded-full text-white"
      style={{ 
        backgroundColor: tagColor,
        color: 'white'
      }}
    >
      {tagName}
    </span>
  );
}

interface EntryCardProps {
  entry: Entry;
  isSelected?: boolean;
  onClick?: () => void;
}

export function EntryCard({ entry, isSelected = false, onClick }: EntryCardProps) {
  const handleClick = () => {
    onClick?.();
  };

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4 cursor-pointer hover:shadow-md transition-all border-2 border-transparent",
        isSelected && "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg"
      )}
      onClick={handleClick}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 truncate flex-1">
          {entry.title}
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
          {formatDate(entry.updatedAt)}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
        {entry.summary}
      </p>
      
      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {entry.tags.map((tagName, index) => (
            <TagDisplay key={index} tagName={tagName} />
          ))}
        </div>
      )}
    </div>
  );
}
