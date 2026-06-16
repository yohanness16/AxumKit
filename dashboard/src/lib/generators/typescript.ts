import type { Model } from "@/types";

export function generateApiClient(model: Model): string {
  const name = model.name;
  const path = model.tableName;

  return `import type { ${name}, PaginatedResponse, Create${name}Dto, Update${name}Dto } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function get${name}s(params?: { page?: number; perPage?: number; search?: string }): Promise<PaginatedResponse<${name}>> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.perPage) query.set('per_page', String(params.perPage));
  if (params?.search) query.set('search', params.search);

  const res = await fetch(\`\${API_BASE}/api/v1/${path}?\${query}\`);
  if (!res.ok) throw new Error('Failed to fetch ${path}');
  return res.json();
}

export async function get${name}(id: string): Promise<${name}> {
  const res = await fetch(\`\${API_BASE}/api/v1/${path}/\${id}\`);
  if (!res.ok) throw new Error('Failed to fetch ${name}');
  return res.json();
}

export async function create${name}(data: Create${name}Dto): Promise<${name}> {
  const res = await fetch(\`\${API_BASE}/api/v1/${path}\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create ${name}');
  return res.json();
}

export async function update${name}(id: string, data: Update${name}Dto): Promise<${name}> {
  const res = await fetch(\`\${API_BASE}/api/v1/${path}/\${id}\`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update ${name}');
  return res.json();
}

export async function delete${name}(id: string): Promise<void> {
  const res = await fetch(\`\${API_BASE}/api/v1/${path}/\${id}\`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete ${name}');
}
`;
}

export function generateHooks(model: Model): string {
  const name = model.name;
  const path = model.tableName;

  return `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get${name}s, get${name}, create${name}, update${name}, delete${name} from '../api/${path}';
import type { Create${name}Dto, Update${name}Dto } from '../types';

const queryKey = '${path}';

export function use${name}s(params?: { page?: number; perPage?: number }) {
  return useQuery({
    queryKey: [queryKey, params],
    queryFn: () => get${name}s(params),
  });
}

export function use${name}(id: string) {
  return useQuery({
    queryKey: [queryKey, id],
    queryFn: () => get${name}(id),
    enabled: !!id,
  });
}

export function useCreate${name}() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Create${name}Dto) => create${name}(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKey] }),
  });
}

export function useUpdate${name}() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Update${name}Dto }) => update${name}(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKey] }),
  });
}

export function useDelete${name}() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => delete${name}(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKey] }),
  });
}
`;
}

export function generateTypes(model: Model): string {
  const fieldLines = model.fields.map((f) => {
    let tsType = "string";
    if (f.type === "integer") tsType = "number";
    if (f.type === "float") tsType = "number";
    if (f.type === "boolean") tsType = "boolean";
    if (f.type === "json") tsType = "Record<string, unknown>";
    if (f.type === "uuid") tsType = "string";
    if (f.type === "datetime") tsType = "string";

    return `  ${f.name}${f.nullable ? "?" : ""}: ${tsType};`;
  });

  return `export interface ${model.name} {
${fieldLines.join("\n")}
}

export interface Create${model.name}Dto {
${model.fields
  .filter((f) => f.name !== "id" && f.name !== "created_at" && f.name !== "updated_at")
  .map((f) => {
    let tsType = "string";
    if (f.type === "integer") tsType = "number";
    if (f.type === "float") tsType = "number";
    if (f.type === "boolean") tsType = "boolean";
    if (f.type === "json") tsType = "Record<string, unknown>";
    return `  ${f.name}${f.nullable ? "?" : ""}: ${tsType};`;
  })
  .join("\n")}
}

export type Update${model.name}Dto = Partial<Create${model.name}Dto>;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
`;
}

export function generatePackageJson(framework: string): string {
  const deps: Record<string, string> = {
    react: "^18",
    "react-dom": "^18",
    "@tanstack/react-query": "^5",
    typescript: "^5",
  };

  if (framework === "nextjs") {
    deps.next = "^14";
  }

  return JSON.stringify(
    {
      name: "frontend",
      version: "0.1.0",
      private: true,
      scripts: {
        dev: framework === "nextjs" ? "next dev" : "vite",
        build: framework === "nextjs" ? "next build" : "vite build",
        start: framework === "nextjs" ? "next start" : "vite preview",
      },
      dependencies: deps,
    },
    null,
    2
  );
}
