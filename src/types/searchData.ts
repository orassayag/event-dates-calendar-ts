export interface SearchResult {
  searchKey: string;
  totalMatches: number;
  fileMatches: FileMatch[];
}

export interface FileMatch {
  fileName: string;
  lineNumber: number;
  lineContent: string;
}
