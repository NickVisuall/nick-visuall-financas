export const syncDocumentsSchema = `
CREATE TABLE IF NOT EXISTS sync_documents (
  sync_code TEXT PRIMARY KEY,
  payload TEXT NOT NULL,
  updated_at TEXT NOT NULL
)
`;
