"use client";

import React, { useState } from "react";
import StatusBadge from "@/components/StatusBadge";

interface Field {
  name: string;
  type: string;
  nullable: boolean;
  primary: boolean;
}

interface Model {
  name: string;
  fields: Field[];
}

const MODELS: Model[] = [
  {
    name: "User",
    fields: [
      { name: "id", type: "UUID", nullable: false, primary: true },
      { name: "email", type: "VARCHAR(255)", nullable: false, primary: false },
      { name: "name", type: "VARCHAR(100)", nullable: true, primary: false },
      { name: "role", type: "VARCHAR(50)", nullable: false, primary: false },
    ],
  },
  {
    name: "Post",
    fields: [
      { name: "id", type: "UUID", nullable: false, primary: true },
      { name: "title", type: "VARCHAR(200)", nullable: false, primary: false },
      { name: "content", type: "TEXT", nullable: true, primary: false },
      { name: "author_id", type: "UUID", nullable: false, primary: false },
    ],
  },
  {
    name: "Product",
    fields: [
      { name: "id", type: "UUID", nullable: false, primary: true },
      { name: "name", type: "VARCHAR(200)", nullable: false, primary: false },
      { name: "price", type: "DECIMAL(10,2)", nullable: false, primary: false },
      { name: "category", type: "VARCHAR(100)", nullable: true, primary: false },
    ],
  },
];

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 text-[#64748b] transition-transform duration-200 ${open ? "rotate-90" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

interface ModelEditorProps {
  model: Model;
  onClose: () => void;
}

function ModelEditor({ model, onClose }: ModelEditorProps) {
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState("VARCHAR(255)");
  const [newFieldNullable, setNewFieldNullable] = useState(false);

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--foreground)]">{model.name} Model</h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-[#64748b] transition-colors hover:bg-[var(--card-hover)] hover:text-[var(--foreground)]"
          aria-label="Close editor"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <p className="mt-1 text-sm text-[#64748b]">Fields: {model.fields.length}</p>

      {/* Field List */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wider text-[#64748b]">
              <th className="pb-2 pr-4 font-medium">Field</th>
              <th className="pb-2 pr-4 font-medium">Type</th>
              <th className="pb-2 pr-4 font-medium">Constraints</th>
              <th className="pb-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {model.fields.map((field) => (
              <tr key={field.name} className="group">
                <td className="py-2.5 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-[var(--foreground)]">{field.name}</span>
                    {field.primary && (
                      <span className="rounded bg-[#f59e0b]/15 px-1.5 py-0.5 text-xs font-medium text-[#f59e0b]">
                        PK
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-2.5 pr-4 font-mono text-xs text-[#94a3b8]">{field.type}</td>
                <td className="py-2.5 pr-4">
                  <div className="flex gap-1.5">
                    {!field.nullable && (
                      <span className="rounded bg-[#3b82f6]/15 px-1.5 py-0.5 text-xs font-medium text-[#3b82f6]">
                        NOT NULL
                      </span>
                    )}
                    {field.nullable && (
                      <span className="rounded bg-[#64748b]/15 px-1.5 py-0.5 text-xs font-medium text-[#64748b]">
                        NULL
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-2.5">
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      className="rounded p-1 text-[#64748b] transition-colors hover:bg-[var(--card-hover)] hover:text-[#3b82f6]"
                      aria-label={`Edit ${field.name}`}
                    >
                      <EditIcon />
                    </button>
                    <button
                      type="button"
                      className="rounded p-1 text-[#64748b] transition-colors hover:bg-[var(--card-hover)] hover:text-[#ef4444]"
                      aria-label={`Delete ${field.name}`}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Field Form */}
      <div className="mt-4 border-t border-[var(--border)] pt-4">
        <h4 className="text-sm font-medium text-[var(--foreground)]">Add Field</h4>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-4">
          <input
            type="text"
            placeholder="Field name"
            value={newFieldName}
            onChange={(e) => setNewFieldName(e.target.value)}
            className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder-[#475569] focus:border-[#3b82f6] focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
          />
          <select
            value={newFieldType}
            onChange={(e) => setNewFieldType(e.target.value)}
            className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[#3b82f6] focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
          >
            <option value="VARCHAR(255)">VARCHAR(255)</option>
            <option value="TEXT">TEXT</option>
            <option value="INTEGER">INTEGER</option>
            <option value="DECIMAL(10,2)">DECIMAL(10,2)</option>
            <option value="BOOLEAN">BOOLEAN</option>
            <option value="UUID">UUID</option>
            <option value="TIMESTAMP">TIMESTAMP</option>
            <option value="JSONB">JSONB</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-[#94a3b8]">
            <input
              type="checkbox"
              checked={newFieldNullable}
              onChange={(e) => setNewFieldNullable(e.target.checked)}
              className="h-4 w-4 rounded border-[var(--border)] bg-[var(--background)] text-[#3b82f6] focus:ring-[#3b82f6]"
            />
            Nullable
          </label>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#3b82f6] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2563eb] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]"
          >
            <PlusIcon />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ModelsPage() {
  const [expandedModel, setExpandedModel] = useState<string | null>(null);

  const toggleModel = (name: string) => {
    setExpandedModel((prev) => (prev === name ? null : name));
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Data Models</h1>
          <p className="mt-1 text-sm text-[#64748b]">
            Define and manage your database schema models and their fields.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-[#3b82f6] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2563eb] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
        >
          <PlusIcon />
          Create Model
        </button>
      </div>

      {/* Models Table */}
      <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--card)]">
        <table className="w-full text-left text-sm" role="table">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#64748b]" scope="col">
                Model
              </th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#64748b]" scope="col">
                Fields
              </th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#64748b]" scope="col">
                Status
              </th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-[#64748b]" scope="col">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {MODELS.map((model) => (
              <tr key={model.name} className="transition-colors hover:bg-[var(--card-hover)]">
                <td className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => toggleModel(model.name)}
                    className="flex items-center gap-2 font-medium text-[var(--foreground)] transition-colors hover:text-[#3b82f6]"
                    aria-expanded={expandedModel === model.name}
                  >
                    <ChevronIcon open={expandedModel === model.name} />
                    <span className="font-mono">{model.name}</span>
                  </button>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm text-[#94a3b8]">{model.fields.length} fields</span>
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status="active" />
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleModel(model.name)}
                      className="rounded-lg p-1.5 text-[#64748b] transition-colors hover:bg-[var(--card-hover)] hover:text-[#3b82f6]"
                      aria-label={`Edit ${model.name} fields`}
                    >
                      <EditIcon />
                    </button>
                    <button
                      type="button"
                      className="rounded-lg p-1.5 text-[#64748b] transition-colors hover:bg-[var(--card-hover)] hover:text-[#ef4444]"
                      aria-label={`Delete ${model.name}`}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Field Editor Panel */}
      {expandedModel && (
        <div className="mt-6">
          <ModelEditor
            model={MODELS.find((m) => m.name === expandedModel)!}
            onClose={() => setExpandedModel(null)}
          />
        </div>
      )}
    </div>
  );
}
