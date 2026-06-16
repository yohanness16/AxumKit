"use client";

import React, { useState } from "react";

interface FileTreeNode {
  name: string;
  type: "file" | "folder";
  children?: FileTreeNode[];
}

interface FileTreeProps {
  nodes: FileTreeNode[];
  defaultExpanded?: boolean;
}

function FileIcon() {
  return (
    <svg className="h-4 w-4 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function FolderIcon({ open }: { open: boolean }) {
  return (
    <svg className="h-4 w-4 text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      {open ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5l-7.5 7.5-7.5-7.5M10.5 19.5v-17.25" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
      )}
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-3.5 w-3.5 text-[#9CA3AF] transition-transform duration-200 ${open ? "rotate-90" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

function FileTreeNodeComponent({ node, depth = 0, defaultExpanded = false }: { node: FileTreeNode; depth?: number; defaultExpanded?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);
  const isFolder = node.type === "folder";

  return (
    <div>
      <button
        type="button"
        onClick={() => isFolder && setIsOpen(!isOpen)}
        className={`flex w-full items-center gap-2 rounded px-2 py-1 text-left text-sm font-mono hover:bg-[#F3F4F6] ${
          isFolder ? "cursor-pointer" : "cursor-default"
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {isFolder ? (
          <>
            <ChevronIcon open={isOpen} />
            <FolderIcon open={isOpen} />
          </>
        ) : (
          <>
            <span className="w-3.5" />
            <FileIcon />
          </>
        )}
        <span className={isFolder ? "text-[#374151] font-medium" : "text-[#6B7280]"}>
          {node.name}
        </span>
      </button>
      {isFolder && isOpen && node.children && (
        <div>
          {node.children.map((child, index) => (
            <FileTreeNodeComponent key={`${child.name}-${index}`} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileTree({ nodes, defaultExpanded = false }: FileTreeProps) {
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3 font-mono text-sm">
      {nodes.map((node, index) => (
        <FileTreeNodeComponent key={`${node.name}-${index}`} node={node} defaultExpanded={defaultExpanded} />
      ))}
    </div>
  );
}

export type { FileTreeNode };
