export type FindFileParams = {
  primaryPath: string;
  fallbackPath: string;
  onFallback?: (path: string) => void;
};
