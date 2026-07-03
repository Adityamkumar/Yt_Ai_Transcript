export function escapeRegex(query: string): string {
  return query.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
}
