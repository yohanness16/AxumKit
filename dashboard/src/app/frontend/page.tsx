"use client";

import React, { useState } from "react";
import { useDashboardStore } from "@/store/dashboard";

// ─── Icon Components ───

function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

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

function ExternalLinkIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );
}

// ─── Framework Icons (simplified SVG logos) ───

function NextJsIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 01-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 00-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.25 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 00-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 01-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 01-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 01.174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 004.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 002.466-2.163 11.944 11.944 0 002.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747-.652-4.506-3.859-8.292-8.208-9.695a12.597 12.597 0 00-2.499-.523A33.119 33.119 0 0011.572 0zm4.069 7.217c.347 0 .408.005.486.047a.473.473 0 01.237.277c.018.06.023 1.365.018 4.304l-.006 4.218-.744-1.14-.746-1.14v-3.066c0-1.982.01-3.097.023-3.15a.478.478 0 01.233-.296c.096-.05.13-.054.5-.054z" />
    </svg>
  );
}

function ReactIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M14.23 12.004a2.236 2.236 0 01-2.235 2.236 2.236 2.236 0 01-2.236-2.236 2.236 2.236 0 012.235-2.236 2.236 2.236 0 012.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38a2.167 2.167 0 00-1.102-.277zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44a23.476 23.476 0 00-3.107-.534 23.476 23.476 0 00-2.036-2.498c1.59-1.45 3.09-2.25 4.105-2.25zm-9.77.01c1.015 0 2.515.797 4.11 2.246-.686.72-1.37 1.537-2.03 2.498a22.87 22.87 0 00-3.113.538 14.63 14.63 0 00-.254-1.42c-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.127zm7.985 3.29c.462.49.912 1.037 1.34 1.62-.43.02-.865.032-1.304.032-.44 0-.874-.012-1.304-.032.428-.583.878-1.13 1.34-1.62zm-5.97.002a22.244 22.244 0 011.34 1.62c-.43.02-.865.032-1.304.032-.44 0-.874-.012-1.304-.032.428-.583.878-1.13 1.34-1.62zm5.97 3.288c.462.49.912 1.037 1.34 1.62-.43.02-.865.032-1.304.032-.44 0-.874-.012-1.304-.032.428-.583.878-1.13 1.34-1.62zm-5.97.002a22.244 22.244 0 011.34 1.62c-.43.02-.865.032-1.304.032-.44 0-.874-.012-1.304-.032.428-.583.878-1.13 1.34-1.62zM12 14.17c.44 0 .874.012 1.304.032-.428.583-.878 1.13-1.34 1.62a22.244 22.244 0 00-1.34-1.62c.43-.02.865-.032 1.304-.032z" />
    </svg>
  );
}

function VueIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 1.61h-9.94L12 5.16 9.94 1.61H0l12 20.78ZM12 14.08 5.16 2.23h4.43L12 6.41l2.41-4.18h4.43Z" />
    </svg>
  );
}

function SvelteIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M10.354 21.125a4.44 4.44 0 01-4.765-1.767 4.109 4.109 0 01-.703-3.107 3.898 3.898 0 01.134-.522l.105-.321.287.21a7.21 7.21 0 002.186 1.092l.208.063-.02.208a1.253 1.253 0 00.226.83 1.337 1.337 0 001.435.533 1.231 1.231 0 00.343-.15l5.59-3.562a1.164 1.164 0 00.524-.778 1.242 1.242 0 00-.211-.937 1.338 1.338 0 00-1.435-.533 1.23 1.23 0 00-.343.15l-2.133 1.36a4.078 4.078 0 01-1.135.499 4.44 4.44 0 01-4.765-1.766 4.108 4.108 0 01-.702-3.108 3.855 3.855 0 011.742-2.582l5.589-3.563a4.072 4.072 0 011.135-.499 4.44 4.44 0 014.765 1.767 4.109 4.109 0 01.703 3.107 3.943 3.943 0 01-.134.522l-.105.321-.287-.21a7.204 7.204 0 00-2.186-1.093l-.208-.063.02-.207a1.255 1.255 0 00-.226-.831 1.337 1.337 0 00-1.435-.532 1.231 1.231 0 00-.343.15L8.62 9.368a1.162 1.162 0 00-.524.778 1.243 1.243 0 00.211.937 1.338 1.338 0 001.435.533 1.235 1.235 0 00.344-.151l2.132-1.36a4.067 4.067 0 011.135-.498 4.44 4.44 0 014.765 1.766 4.108 4.108 0 01.702 3.108 3.857 3.857 0 01-1.742 2.583l-5.589 3.562a4.072 4.072 0 01-1.135.499z" />
    </svg>
  );
}

// ─── Types ───

type Framework = "nextjs" | "react" | "vue" | "svelte";
type Language = "typescript" | "javascript";
type StateLibrary = "tanstack" | "zustand" | "redux" | "none";
type UiLibrary = "tailwind" | "shadcn" | "mui" | "none";

interface FrameworkOption {
  id: Framework;
  label: string;
  icon: React.ReactNode;
  color: string;
}

// ─── File Tree Data ───

interface TreeNode {
  name: string;
  type: "file" | "folder";
  children?: TreeNode[];
}

function getFrameworkFileTree(
  framework: Framework,
  language: Language,
  stateLibrary: StateLibrary,
  uiLibrary: UiLibrary
): TreeNode[] {
  const ext = language === "typescript" ? "ts" : "js";
  const tsxExt = language === "typescript" ? "tsx" : "jsx";

  const baseFiles: TreeNode[] = [
    {
      name: "frontend",
      type: "folder",
      children: [
        { name: `package.json`, type: "file" },
        { name: language === "typescript" ? "tsconfig.json" : "jsconfig.json", type: "file" },
        { name: "README.md", type: "file" },
        ...(uiLibrary === "tailwind"
          ? [
              { name: "tailwind.config.ts", type: "file" as const },
              { name: "postcss.config.js", type: "file" as const },
            ]
          : []),
        ...(uiLibrary === "mui"
          ? [{ name: "theme.ts", type: "file" as const }]
          : []),
        {
          name: "src",
          type: "folder",
          children: [
            ...(framework === "nextjs"
              ? [
                  {
                    name: "app",
                    type: "folder" as const,
                    children: [
                      { name: `layout.${tsxExt}`, type: "file" as const },
                      { name: `page.${tsxExt}`, type: "file" as const },
                      { name: `globals.css`, type: "file" as const },
                      {
                        name: "api",
                        type: "folder" as const,
                        children: [
                          { name: `route.${ext}`, type: "file" as const },
                        ],
                      },
                    ],
                  },
                ]
              : framework === "react" || framework === "vue"
                ? [
                    {
                      name: "components",
                      type: "folder" as const,
                      children: [
                        { name: `App.${framework === "vue" ? "vue" : tsxExt}`, type: "file" as const },
                        { name: `Layout.${framework === "vue" ? "vue" : tsxExt}`, type: "file" as const },
                      ],
                    },
                    {
                      name: "pages",
                      type: "folder" as const,
                      children: [
                        { name: `Index.${framework === "vue" ? "vue" : tsxExt}`, type: "file" as const },
                      ],
                    },
                    { name: `main.${framework === "vue" ? "ts" : tsxExt}`, type: "file" as const },
                  ]
                : [
                    {
                      name: "routes",
                      type: "folder" as const,
                      children: [
                        { name: `+layout.svelte`, type: "file" as const },
                        { name: `+page.svelte`, type: "file" as const },
                      ],
                    },
                    { name: `app.html`, type: "file" as const },
                    { name: `main.${ext}`, type: "file" as const },
                  ]),
            {
              name: "api",
              type: "folder",
              children: [
                { name: `client.${ext}`, type: "file" as const },
                { name: `users.${ext}`, type: "file" as const },
                { name: `posts.${ext}`, type: "file" as const },
                { name: `products.${ext}`, type: "file" as const },
              ],
            },
            {
              name: "hooks",
              type: "folder",
              children: [
                ...(stateLibrary === "tanstack"
                  ? [
                      { name: `useUsers.${ext}`, type: "file" as const },
                      { name: `usePosts.${ext}`, type: "file" as const },
                      { name: `useProducts.${ext}`, type: "file" as const },
                    ]
                  : []),
                { name: `useAuth.${ext}`, type: "file" as const },
              ],
            },
            {
              name: "types",
              type: "folder",
              children: language === "typescript"
                ? [
                    { name: `User.${ext}`, type: "file" as const },
                    { name: `Post.${ext}`, type: "file" as const },
                    { name: `Product.${ext}`, type: "file" as const },
                    { name: `api.${ext}`, type: "file" as const },
                  ]
                : [],
            },
            ...(stateLibrary === "zustand"
              ? [
                  {
                    name: "store",
                    type: "folder" as const,
                    children: [
                      { name: `index.${ext}`, type: "file" as const },
                      { name: `auth.${ext}`, type: "file" as const },
                    ],
                  },
                ]
              : []),
            ...(stateLibrary === "redux"
              ? [
                  {
                    name: "store",
                    type: "folder" as const,
                    children: [
                      { name: `index.${ext}`, type: "file" as const },
                      { name: `slices.${ext}`, type: "file" as const },
                    ],
                  },
                ]
              : []),
            ...(uiLibrary === "shadcn"
              ? [
                  {
                    name: "components",
                    type: "folder" as const,
                    children: [
                      {
                        name: "ui",
                        type: "folder" as const,
                        children: [
                          { name: `button.${tsxExt}`, type: "file" as const },
                          { name: `input.${tsxExt}`, type: "file" as const },
                          { name: `card.${tsxExt}`, type: "file" as const },
                        ],
                      },
                    ],
                  },
                ]
              : []),
          ],
        },
      ],
    },
  ];

  return baseFiles;
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

// ─── Main Page Component ───

export default function FrontendPage() {
  const { frontendConfig, setFrontendConfig, models } = useDashboardStore();
  const [localOutputPath, setLocalOutputPath] = useState(frontendConfig.outputPath);

  const frameworks: FrameworkOption[] = [
    { id: "nextjs", label: "Next.js", icon: <NextJsIcon />, color: "#000000" },
    { id: "react", label: "React", icon: <ReactIcon />, color: "#61DAFB" },
    { id: "vue", label: "Vue", icon: <VueIcon />, color: "#4FC08D" },
    { id: "svelte", label: "Svelte", icon: <SvelteIcon />, color: "#FF3E00" },
  ];

  const stateLibraries: { value: StateLibrary; label: string }[] = [
    { value: "tanstack", label: "TanStack Query" },
    { value: "zustand", label: "Zustand" },
    { value: "redux", label: "Redux Toolkit" },
    { value: "none", label: "None" },
  ];

  const uiLibraries: { value: UiLibrary; label: string }[] = [
    { value: "tailwind", label: "Tailwind CSS" },
    { value: "shadcn", label: "shadcn/ui" },
    { value: "mui", label: "Material UI" },
    { value: "none", label: "None" },
  ];

  const fileTree = getFrameworkFileTree(
    frontendConfig.framework,
    frontendConfig.language,
    frontendConfig.stateLibrary,
    frontendConfig.uiLibrary
  );

  const totalFiles = countFiles(fileTree);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#111827]">Frontend Connector</h1>
        <p className="text-[#6B7280] mt-1">
          Configure and generate a frontend application connected to your AXUMkit API.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Framework Selector */}
          <section className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <h2 className="text-sm font-semibold text-[#111827] uppercase tracking-wider mb-4">
              Framework
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {frameworks.map((fw) => {
                const isSelected = frontendConfig.framework === fw.id;
                return (
                  <button
                    key={fw.id}
                    onClick={() => setFrontendConfig({ framework: fw.id })}
                    className={`
                      relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-150 cursor-pointer
                      ${isSelected
                        ? "border-[#374151] bg-[#F9FAFB] shadow-sm"
                        : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB] hover:bg-[#FAFAFA]"
                      }
                    `}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-[#374151] flex items-center justify-center">
                        <CheckIcon className="h-3 w-3 text-white" />
                      </div>
                    )}
                    <div className="text-[#374151]">{fw.icon}</div>
                    <span className="text-sm font-medium text-[#111827]">{fw.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Language Toggle */}
          <section className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <h2 className="text-sm font-semibold text-[#111827] uppercase tracking-wider mb-4">
              Language
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {(["typescript", "javascript"] as Language[]).map((lang) => {
                const isSelected = frontendConfig.language === lang;
                return (
                  <button
                    key={lang}
                    onClick={() => setFrontendConfig({ language: lang })}
                    className={`
                      flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-150 cursor-pointer
                      ${isSelected
                        ? "border-[#374151] bg-[#F9FAFB] shadow-sm"
                        : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB]"
                      }
                    `}
                  >
                    <span className="text-lg">
                      {lang === "typescript" ? "TS" : "JS"}
                    </span>
                    <div>
                      <span className="text-sm font-medium text-[#111827] block">
                        {lang === "typescript" ? "TypeScript" : "JavaScript"}
                      </span>
                      <span className="text-xs text-[#6B7280]">
                        {lang === "typescript" ? "Type-safe development" : "Flexible & fast"}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="h-5 w-5 rounded-full bg-[#374151] flex items-center justify-center ml-auto">
                        <CheckIcon className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* State Library & UI Library */}
          <section className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <h2 className="text-sm font-semibold text-[#111827] uppercase tracking-wider mb-4">
              Libraries
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* State Library */}
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                  State Management
                </label>
                <select
                  value={frontendConfig.stateLibrary}
                  onChange={(e) => setFrontendConfig({ stateLibrary: e.target.value as StateLibrary })}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#E5E7EB] bg-white text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#6B7280] focus:border-transparent cursor-pointer"
                >
                  {stateLibraries.map((lib) => (
                    <option key={lib.value} value={lib.value}>
                      {lib.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* UI Library */}
              <div>
                <label className="block text-sm font-medium text-[#374151] mb-2">
                  UI Library
                </label>
                <select
                  value={frontendConfig.uiLibrary}
                  onChange={(e) => setFrontendConfig({ uiLibrary: e.target.value as UiLibrary })}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#E5E7EB] bg-white text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#6B7280] focus:border-transparent cursor-pointer"
                >
                  {uiLibraries.map((lib) => (
                    <option key={lib.value} value={lib.value}>
                      {lib.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Output Folder */}
          <section className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <h2 className="text-sm font-semibold text-[#111827] uppercase tracking-wider mb-4">
              Output Folder
            </h2>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={localOutputPath}
                  onChange={(e) => setLocalOutputPath(e.target.value)}
                  onBlur={() => setFrontendConfig({ outputPath: localOutputPath })}
                  placeholder="./frontend"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#E5E7EB] bg-white text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#6B7280] focus:border-transparent"
                />
              </div>
              <button className="px-4 py-2.5 rounded-lg border border-[#E5E7EB] bg-white text-sm font-medium text-[#374151] hover:bg-[#F3F4F6] hover:border-[#D1D5DB] transition-colors">
                Browse
              </button>
            </div>
          </section>
        </div>

        {/* Right Column - File Tree Preview & Actions */}
        <div className="space-y-6">
          {/* File Tree Preview */}
          <section className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#111827] uppercase tracking-wider">
                File Preview
              </h2>
              <span className="text-xs text-[#6B7280] bg-[#F3F4F6] px-2 py-1 rounded-full">
                {totalFiles} files
              </span>
            </div>
            <div className="bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] p-3 max-h-[520px] overflow-y-auto">
              <FileTree nodes={fileTree} />
            </div>
          </section>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button className="w-full py-3 px-4 rounded-xl bg-[#374151] text-white text-sm font-semibold hover:bg-[#1F2937] transition-colors shadow-sm">
              Generate Frontend
            </button>
            <button className="w-full py-3 px-4 rounded-xl border border-[#E5E7EB] bg-white text-sm font-medium text-[#374151] hover:bg-[#F3F4F6] hover:border-[#D1D5DB] transition-colors flex items-center justify-center gap-2">
              <DownloadIcon className="h-4 w-4" />
              Download ZIP
            </button>
            <button className="w-full py-2.5 px-4 rounded-xl text-sm font-medium text-[#6B7280] hover:text-[#374151] hover:bg-[#F3F4F6] transition-colors flex items-center justify-center gap-2">
              <ExternalLinkIcon className="h-4 w-4" />
              Open in VS Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helper to count files ───

function countFiles(nodes: TreeNode[]): number {
  let count = 0;
  for (const node of nodes) {
    if (node.type === "file") count++;
    if (node.children) count += countFiles(node.children);
  }
  return count;
}
