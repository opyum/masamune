export interface GeneratedFile {
  filename: string;
  content: string;
}

export function parseGeneratedFiles(output: string): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const regex = /FILE_START:\s*(.+?)\n([\s\S]*?)FILE_END:\s*\1/g;
  let match;

  while ((match = regex.exec(output)) !== null) {
    files.push({
      filename: match[1].trim(),
      content: match[2].trim(),
    });
  }

  return files;
}

export function validateGeneratedFiles(files: GeneratedFile[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Must have at least index.html
  if (!files.find((f) => f.filename === "index.html")) {
    errors.push("Missing index.html");
  }

  // Each HTML file should have basic structure
  for (const file of files) {
    if (file.filename.endsWith(".html")) {
      if (!file.content.includes("<!DOCTYPE html>") && !file.content.includes("<!doctype html>")) {
        errors.push(`${file.filename}: Missing DOCTYPE`);
      }
      if (!file.content.includes("<title>")) {
        errors.push(`${file.filename}: Missing <title> tag`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
