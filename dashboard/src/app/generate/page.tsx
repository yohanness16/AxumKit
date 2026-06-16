"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useDashboardStore } from "@/store/dashboard";

// ─── Icon Components ───

function FolderIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  );
}

function FileIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function FolderOpenIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
    </svg>
  );
}

function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function MinusIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
    </svg>
  );
}

function SearchIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function DownloadIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

function FolderOutlineIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  );
}

// ─── Checkbox Item Icons ───

function TableIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M19.125 14.625c.621 0 1.125.504 1.125 1.125" />
    </svg>
  );
}

function RouteIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
  );
}

function ShieldIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function DatabaseIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
    </svg>
  );
}

function CogIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495" />
    </svg>
  );
}

function BeakerIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  );
}

function CodeIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
    </svg>
  );
}

function ContainerIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
    </svg>
  );
}

function DocumentIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

// ─── Types ───

interface GenerateOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  configured: boolean;
}

interface TreeNode {
  name: string;
  type: "file" | "folder";
  children?: TreeNode[];
}

// ─── File Tree Renderer ───

function FileTree({ nodes, depth = 0 }: { nodes: TreeNode[]; depth?: number }) {
  return (
    <div className="font-mono text-sm">
      {nodes.map((node, i) => (
        <React.Fragment key={`${node.name}-${i}`}>
          <div
            className="flex items-center gap-2 py-0.5 hover:bg-[#F3F4F6] rounded px-1"
            style={{ paddingLeft: `${depth * 16 + 4}px` }}
          >
            {node.type === "folder" ? (
              <FolderOpenIcon className="h-4 w-4 text-[#6B7280] shrink-0" />
            ) : (
              <FileIcon className="h-4 w-4 text-[#9CA3AF] shrink-0" />
            )}
            <span className={node.type === "folder" ? "text-[#374151] font-medium" : "text-[#6B7280]"}>
              {node.name}
            </span>
          </div>
          {node.children && <FileTree nodes={node.children} depth={depth + 1} />}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Progress Steps ───

const GENERATION_STEPS = [
  { label: "Generating models...", threshold: 0 },
  { label: "Generating API...", threshold: 25 },
  { label: "Generating auth...", threshold: 50 },
  { label: "Generating frontend...", threshold: 75 },
  { label: "Complete!", threshold: 100 },
];

// ─── Main Page Component ───

export default function GeneratePage() {
  const {
    models,
    endpoints,
    authConfig,
    dbConfig,
    frontendConfig,
    generationStatus,
    generateCode,
    projectName,
    setProjectName,
  } = useDashboardStore();

  const [outputFolder, setOutputFolder] = useState("./output");
  const [progress, setProgress] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, boolean>>({
    models: true,
    api: true,
    auth: true,
    database: true,
    config: true,
    tests: true,
    frontend: true,
    docker: true,
    docs: true,
  });

  // Determine configured status
  const generateOptions: GenerateOption[] = [
    { id: "models", label: "Models + Migrations", icon: <TableIcon />, configured: models.length > 0 },
    { id: "api", label: "API Routes + Handlers", icon: <RouteIcon />, configured: endpoints.length > 0 },
    { id: "auth", label: "Auth Module (JWT + RBAC)", icon: <ShieldIcon />, configured: authConfig.method === "jwt" && !!authConfig.jwt },
    { id: "database", label: "Database Connection", icon: <DatabaseIcon />, configured: !!dbConfig.engine },
    { id: "config", label: "Configuration", icon: <CogIcon />, configured: true },
    { id: "tests", label: "Tests", icon: <BeakerIcon />, configured: true },
    { id: "frontend", label: "Frontend SDK", icon: <CodeIcon />, configured: !!frontendConfig.framework },
    { id: "docker", label: "Docker + CI/CD", icon: <ContainerIcon />, configured: true },
    { id: "docs", label: "README + Docs", icon: <DocumentIcon />, configured: true },
  ];

  const toggleOption = (id: string) => {
    setSelectedOptions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Simulate progress during generation
  useEffect(() => {
    if (generationStatus === "generating") {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
      }, 80);
      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [generationStatus]);

  const currentStep = GENERATION_STEPS.reduce((acc, step) => {
    return progress >= step.threshold ? step : acc;
  }, GENERATION_STEPS[0]);

  // Build the complete project file tree
  const projectFileTree: TreeNode[] = [
    {
      name: projectName || "my-app",
      type: "folder",
      children: [
        { name: "Cargo.toml", type: "file" },
        { name: "README.md", type: "file" },
        { name: ".env.example", type: "file" },
        { name: ".gitignore", type: "file" },
        {
          name: "src",
          type: "folder",
          children: [
            { name: "main.rs", type: "file" },
            { name: "lib.rs", type: "file" },
            {
              name: "models",
              type: "folder",
              children: models.map((m) => ({
                name: `${m.name.toLowerCase()}.rs`,
                type: "file" as const,
              })),
            },
            {
              name: "routes",
              type: "folder",
              children: [
                { name: "mod.rs", type: "file" },
                { name: "users.rs", type: "file" },
                { name: "posts.rs", type: "file" },
                { name: "products.rs", type: "file" },
              ],
            },
            {
              name: "handlers",
              type: "folder",
              children: [
                { name: "mod.rs", type: "file" },
                { name: "users.rs", type: "file" },
                { name: "posts.rs", type: "file" },
                { name: "products.rs", type: "file" },
              ],
            },
            {
              name: "auth",
              type: "folder",
              children: [
                { name: "mod.rs", type: "file" },
                { name: "jwt.rs", type: "file" },
                { name: "rbac.rs", type: "file" },
                { name: "middleware.rs", type: "file" },
              ],
            },
            {
              name: "db",
              type: "folder",
              children: [
                { name: "mod.rs", type: "file" },
                { name: "connection.rs", type: "file" },
                { name: "pool.rs", type: "file" },
              ],
            },
            {
              name: "config",
              type: "folder",
              children: [
                { name: "mod.rs", type: "file" },
                { name: "app.rs", type: "file" },
                { name: "database.rs", type: "file" },
              ],
            },
          ],
        },
        {
          name: "tests",
          type: "folder",
          children: [
            { name: "mod.rs", type: "file" },
            { name: "users_test.rs", type: "file" },
            { name: "auth_test.rs", type: "file" },
            { name: "posts_test.rs", type: "file" },
          ],
        },
        {
          name: "migrations",
          type: "folder",
          children: [
            { name: "001_create_users.sql", type: "file" },
            { name: "002_create_posts.sql", type: "file" },
            { name: "003_create_products.sql", type: "file" },
          ],
        },
        {
          name: "docker",
          type: "folder",
          children: [
            { name: "Dockerfile", type: "file" },
            { name: "docker-compose.yml", type: "file" },
            { name: ".dockerignore", type: "file" },
          ],
        },
        {
          name: "frontend",
          type: "folder",
          children: [
            { name: "package.json", type: "file" },
            { name: "tsconfig.json", type: "file" },
            {
              name: "src",
              type: "folder",
              children: [
                {
                  name: "app",
                  type: "folder",
                  children: [
                    { name: "layout.tsx", type: "file" },
                    { name: "page.tsx", type: "file" },
                    { name: "globals.css", type: "file" },
                  ],
                },
                {
                  name: "api",
                  type: "folder",
                  children: [
                    { name: "client.ts", type: "file" },
                    { name: "users.ts", type: "file" },
                    { name: "posts.ts", type: "file" },
                  ],
                },
                {
                  name: "hooks",
                  type: "folder",
                  children: [
                    { name: "useUsers.ts", type: "file" },
                    { name: "useAuth.ts", type: "file" },
                  ],
                },
                {
                  name: "types",
                  type: "folder",
                  children: [
                    { name: "User.ts", type: "file" },
                    { name: "Post.ts", type: "file" },
                    { name: "api.ts", type: "file" },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  const handleGenerate = useCallback(() => {
    generateCode();
  }, [generateCode]);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#111827]">Code Generator</h1>
        <p className="text-[#6B7280] mt-1">
          Generate your complete AXUMkit project with all configured components.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Configuration */}
          <section className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <h2 className="text-sm font-semibold text-[#111827] uppercase tracking-wider mb-4">
              Project Configuration
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="my-app"
                  className="w-full px-3 py-2.5 rounded-lg border border-[#E5E7EB] bg-white text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#6B7280] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                  Output Folder
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
                    <input
                      type="text"
                      value={outputFolder}
                      onChange={(e) => setOutputFolder(e.target.value)}
                      placeholder="./output"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#E5E7EB] bg-white text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#6B7280] focus:border-transparent"
                    />
                  </div>
                  <button className="px-4 py-2.5 rounded-lg border border-[#E5E7EB] bg-white text-sm font-medium text-[#374151] hover:bg-[#F3F4F6] hover:border-[#D1D5DB] transition-colors">
                    Browse
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* What to Generate */}
          <section className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <h2 className="text-sm font-semibold text-[#111827] uppercase tracking-wider mb-4">
              What to Generate
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {generateOptions.map((option) => {
                const isChecked = selectedOptions[option.id];
                return (
                  <button
                    key={option.id}
                    onClick={() => toggleOption(option.id)}
                    className={`
                      relative flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-150 text-left cursor-pointer
                      ${isChecked
                        ? "border-[#374151] bg-[#F9FAFB]"
                        : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB]"
                      }
                    `}
                  >
                    {/* Checkbox */}
                    <div
                      className={`
                        h-5 w-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors
                        ${isChecked
                          ? "bg-[#374151] border-[#374151]"
                          : "bg-white border-[#D1D5DB]"
                        }
                      `}
                    >
                      {isChecked && <CheckIcon className="h-3 w-3 text-white" />}
                    </div>
                    {/* Icon */}
                    <div className={`${isChecked ? "text-[#374151]" : "text-[#9CA3AF]"}`}>
                      {option.icon}
                    </div>
                    {/* Label + Status */}
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-[#111827] block truncate">
                        {option.label}
                      </span>
                      <div className="flex items-center gap-1 mt-0.5">
                        {option.configured ? (
                          <>
                            <div className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
                            <span className="text-xs text-[#059669]">Configured</span>
                          </>
                        ) : (
                          <>
                            <div className="h-1.5 w-1.5 rounded-full bg-[#9CA3AF]" />
                            <span className="text-xs text-[#9CA3AF]">Not configured</span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Generated Structure */}
          <section className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <h2 className="text-sm font-semibold text-[#111827] uppercase tracking-wider mb-4">
              Generated Structure
            </h2>
            <div className="bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] p-3 max-h-[400px] overflow-y-auto">
              <FileTree nodes={projectFileTree} />
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Status Indicators */}
          <section className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <h2 className="text-sm font-semibold text-[#111827] uppercase tracking-wider mb-4">
              Status
            </h2>
            <div className="space-y-3">
              <StatusBadge
                label="Models"
                value={`${models.length} defined`}
                configured={models.length > 0}
              />
              <StatusBadge
                label="Database"
                value={`${dbConfig.engine} configured`}
                configured={!!dbConfig.engine}
              />
              <StatusBadge
                label="Auth"
                value={`${authConfig.method === "jwt" ? "JWT" : authConfig.method} configured`}
                configured={authConfig.method === "jwt" && !!authConfig.jwt}
              />
              <StatusBadge
                label="API"
                value={`${endpoints.length} endpoints`}
                configured={endpoints.length > 0}
              />
              <StatusBadge
                label="Frontend"
                value={`${frontendConfig.framework} + ${frontendConfig.language === "typescript" ? "TS" : "JS"}`}
                configured={!!frontendConfig.framework}
              />
              <StatusBadge
                label="Tests"
                value="ready"
                configured={true}
              />
            </div>
          </section>

          {/* Generation Progress */}
          {generationStatus === "generating" && (
            <section className="bg-white rounded-xl border border-[#E5E7EB] p-6">
              <h2 className="text-sm font-semibold text-[#111827] uppercase tracking-wider mb-4">
                Progress
              </h2>
              {/* Progress bar */}
              <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-[#374151] rounded-full transition-all duration-200 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-[#6B7280]">{currentStep.label}</p>
              <p className="text-xs text-[#9CA3AF] mt-1">{Math.round(progress)}% complete</p>
            </section>
          )}

          {/* Success State */}
          {generationStatus === "success" && (
            <section className="bg-white rounded-xl border border-[#059669] p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-full bg-[#D1FAE5] flex items-center justify-center">
                  <CheckIcon className="h-4 w-4 text-[#059669]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#059669]">Generation Complete!</h3>
                  <p className="text-xs text-[#6B7280]">All files generated successfully</p>
                </div>
              </div>
            </section>
          )}

          {/* Error State */}
          {generationStatus === "error" && (
            <section className="bg-white rounded-xl border border-[#DC2626] p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-full bg-[#FEE2E2] flex items-center justify-center">
                  <MinusIcon className="h-4 w-4 text-[#DC2626]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#DC2626]">Generation Failed</h3>
                  <p className="text-xs text-[#6B7280]">Check logs for details</p>
                </div>
              </div>
            </section>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGenerate}
              disabled={generationStatus === "generating"}
              className={`
                w-full py-3.5 px-4 rounded-xl text-sm font-semibold transition-colors shadow-sm flex items-center justify-center gap-2
                ${generationStatus === "generating"
                  ? "bg-[#9CA3AF] text-white cursor-not-allowed"
                  : "bg-[#374151] text-white hover:bg-[#1F2937] cursor-pointer"
                }
              `}
            >
              {generationStatus === "generating" ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating...
                </>
              ) : (
                "🚀 Generate All Code"
              )}
            </button>
            <button className="w-full py-3 px-4 rounded-xl border border-[#E5E7EB] bg-white text-sm font-medium text-[#374151] hover:bg-[#F3F4F6] hover:border-[#D1D5DB] transition-colors flex items-center justify-center gap-2">
              <DownloadIcon className="h-4 w-4" />
              {"퍼"} Download ZIP
            </button>
            <button className="w-full py-2.5 px-4 rounded-xl text-sm font-medium text-[#6B7280] hover:text-[#374151] hover:bg-[#F3F4F6] transition-colors flex items-center justify-center gap-2">
              <FolderOutlineIcon className="h-4 w-4" />
              {"📂"} Open Folder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Status Badge Component ───

function StatusBadge({
  label,
  value,
  configured,
}: {
  label: string;
  value: string;
  configured: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB]">
      <span className="text-sm text-[#6B7280]">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-medium text-[#111827]">{value}</span>
        {configured ? (
          <span className="text-[#059669]">✅</span>
        ) : (
          <span className="text-[#9CA3AF]">―</span>
        )}
      </div>
    </div>
  );
}
