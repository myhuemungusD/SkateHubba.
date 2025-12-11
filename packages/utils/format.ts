export const toDate = (value: unknown): Date | null => {
  if (!value) return null;
  // Handle Firestore Timestamp
  if (typeof (value as { toDate?: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate();
  }
  // Handle millis
  if (typeof value === "number") return new Date(value);
  // Handle Date object
  if (value instanceof Date) return value;
  
  return null;
};

export const formatRelative = (date: Date | null): string => {
  if (!date) return "-";
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};
