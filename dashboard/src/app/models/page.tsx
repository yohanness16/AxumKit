"use client";

import React, { useState, useCallback } from "react";
import { useDashboardStore } from "@/store/dashboard";

// ─── Icon Components ───

function PlusIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function EditIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );
}

function TrashIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-5 w-5 text-[#6B7280] transition-transform duration-200 ${open ? "rotate-90" : ""}`}
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

function XIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function DatabaseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
  );
}

// ─── Helpers ───

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

const FIELD_TYPES = ["string", "integer", "float", "boolean", "datetime", "uuid", "text", "json", "enum"] as const;

const RELATIONSHIP_TYPES = ["has_many", "belongs_to", "many_to_many"] as const;

function typeToSql(type: string): string {
  switch (type) {
    case "string": return "VARCHAR(255)";
    case "integer": return "INTEGER";
    case "float": return "FLOAT";
    case "boolean": return "BOOLEAN";
    case "datetime": return "TIMESTAMP";
    case "uuid": return "UUID";
    case "text": return "TEXT";
    case "json": return "JSONB";
    case "enum": return "VARCHAR(255)";
    default: return "TEXT";
  }
}

function generateSql(model: {
  name: string; tableName: string;
  fields: { name: string; type: string; primaryKey: boolean; unique: boolean; nullable: boolean; defaultValue?: string; enumValues?: string[] }[];
  timestamps: boolean; softDelete: boolean;
}): string {
  const lines: string[] = [];
  lines.push(`CREATE TABLE ${model.tableName} (`);

  const fieldLines: string[] = [];

  for (const field of model.fields) {
    let line = `  ${field.name} ${typeToSql(field.type)}`;
    if (field.primaryKey) line += " PRIMARY KEY";
    if (field.unique && !field.primaryKey) line += " UNIQUE";
    if (!field.nullable && !field.primaryKey) line += " NOT NULL";
    if (field.defaultValue) line += ` DEFAULT ${field.defaultValue}`;
    fieldLines.push(line);
  }

  if (model.timestamps) {
    fieldLines.push("  created_at TIMESTAMP NOT NULL DEFAULT NOW()");
    fieldLines.push("  updated_at TIMESTAMP NOT NULL DEFAULT NOW()");
  }

  if (model.softDelete) {
    fieldLines.push("  deleted_at TIMESTAMP NULL");
  }

  lines.push(fieldLines.join(",\n"));
  lines.push(");");

  return lines.join("\n");
}

// ─── Badge Component ───

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "success" | "danger" | "warning" | "muted" | "outline" }) {
  const base = "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium";
  const variants: Record<string, string> = {
    default: "bg-[#374151] text-white",
    success: "bg-[#059669]/10 text-[#059669]",
    danger: "bg-[#DC2626]/10 text-[#DC2626]",
    warning: "bg-[#D97706]/10 text-[#D97706]",
    muted: "bg-[#F3F4F6] text-[#6B7280]",
    outline: "border border-[#E5E7EB] text-[#6B7280]",
  };
  return <span className={`${base} ${variants[variant]}`}>{children}</span>;
}

// ─── Create Model Modal ───

function CreateModelModal({ onClose, onCreate }: { onClose: () => void; onCreate: (model: { name: string; tableName: string; timestamps: boolean; softDelete: boolean }) => void }) {
  const [name, setName] = useState("");
  const [tableName, setTableName] = useState("");
  const [timestamps, setTimestamps] = useState(true);
  const [softDelete, setSoftDelete] = useState(false);

  const handleNameChange = (value: string) => {
    setName(value);
    // Auto-generate table name from model name
    const generated = value
      .replace(/([A-Z])/g, "_$1")
      .toLowerCase()
      .replace(/^_/, "")
      .replace(/__/g, "_");
    setTableName(generated ? `${generated}s` : "");
  };

  const handleSubmit = () => {
    if (!name.trim() || !tableName.trim()) return;
    onCreate({ name: name.trim(), tableName: tableName.trim(), timestamps, softDelete });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-xl border border-[#E5E7EB] bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
          <h2 className="text-lg font-semibold text-[#111827]">Create New Model</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#111827]"
            aria-label="Close modal"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-5 px-6 py-5">
          {/* Model Name */}
          <div>
            <label htmlFor="model-name" className="block text-sm font-medium text-[#374151]">
              Model Name
            </label>
            <input
              id="model-name"
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. User, Post, Product"
              className="mt-1.5 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3.5 py-2.5 text-sm text-[#111827] placeholder-[#9CA3AF] transition-colors focus:border-[#374151] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#374151]"
            />
          </div>

          {/* Table Name */}
          <div>
            <label htmlFor="table-name" className="block text-sm font-medium text-[#374151]">
              Table Name
            </label>
            <input
              id="table-name"
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="e.g. users, posts, products"
              className="mt-1.5 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3.5 py-2.5 font-mono text-sm text-[#111827] placeholder-[#9CA3AF] transition-colors focus:border-[#374151] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#374151]"
            />
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={timestamps}
                onChange={(e) => setTimestamps(e.target.checked)}
                className="h-4 w-4 rounded border-[#D1D5DB] bg-[#F9FAFB] text-[#374151] accent-[#374151] focus:ring-[#374151]"
              />
              <span className="text-sm text-[#374151]">Timestamps (created_at, updated_at)</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={softDelete}
                onChange={(e) => setSoftDelete(e.target.checked)}
                className="h-4 w-4 rounded border-[#D1D5DB] bg-[#F9FAFB] text-[#374151] accent-[#374151] focus:ring-[#374151]"
              />
              <span className="text-sm text-[#374151]">Soft Delete (deleted_at)</span>
            </label>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[#E5E7EB] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#374151] transition-colors hover:bg-[#F3F4F6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#374151] focus-visible:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!name.trim() || !tableName.trim()}
            className="rounded-lg bg-[#374151] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1F2937] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#374151] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Create Model
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Relationship Modal ───

function AddRelationshipModal({
  models, currentModelId, onClose, onAdd,
}: {
  models: { id: string; name: string }[];
  currentModelId: string;
  onClose: () => void;
  onAdd: (rel: { type: "has_many" | "belongs_to" | "many_to_many"; targetModel: string; foreignKey: string; throughTable?: string }) => void;
}) {
  const [type, setType] = useState<"has_many" | "belongs_to" | "many_to_many">("has_many");
  const [targetModel, setTargetModel] = useState("");
  const [foreignKey, setForeignKey] = useState("");
  const [throughTable, setThroughTable] = useState("");

  const otherModels = models.filter((m) => m.id !== currentModelId);

  const handleSubmit = () => {
    if (!targetModel || !foreignKey) return;
    onAdd({
      type,
      targetModel,
      foreignKey,
      ...(type === "many_to_many" && throughTable ? { throughTable } : {}),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-xl border border-[#E5E7EB] bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
          <h2 className="text-lg font-semibold text-[#111827]">Add Relationship</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#111827]"
            aria-label="Close modal"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div>
            <label className="block text-sm font-medium text-[#374151]">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as typeof type)}
              className="mt-1.5 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3.5 py-2.5 text-sm text-[#111827] focus:border-[#374151] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#374151]"
            >
              {RELATIONSHIP_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#374151]">Target Model</label>
            <select
              value={targetModel}
              onChange={(e) => setTargetModel(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3.5 py-2.5 text-sm text-[#111827] focus:border-[#374151] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#374151]"
            >
              <option value="">Select model...</option>
              {otherModels.map((m) => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#374151]">Foreign Key</label>
            <input
              type="text"
              value={foreignKey}
              onChange={(e) => setForeignKey(e.target.value)}
              placeholder="e.g. user_id, author_id"
              className="mt-1.5 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3.5 py-2.5 font-mono text-sm text-[#111827] placeholder-[#9CA3AF] focus:border-[#374151] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#374151]"
            />
          </div>

          {type === "many_to_many" && (
            <div>
              <label className="block text-sm font-medium text-[#374151]">Through Table</label>
              <input
                type="text"
                value={throughTable}
                onChange={(e) => setThroughTable(e.target.value)}
                placeholder="e.g. post_tags"
                className="mt-1.5 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3.5 py-2.5 font-mono text-sm text-[#111827] placeholder-[#9CA3AF] focus:border-[#374151] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#374151]"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[#E5E7EB] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#374151] transition-colors hover:bg-[#F3F4F6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#374151] focus-visible:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!targetModel || !foreignKey}
            className="rounded-lg bg-[#374151] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1F2937] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#374151] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add Relationship
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Model Card ───

function ModelCard({
  model, allModels, onUpdate, onDelete, onAddField, onDeleteField, onAddRelationship, onDeleteRelationship,
}: {
  model: {
    id: string; name: string; tableName: string;
    fields: { id: string; name: string; type: string; enumValues?: string[]; primaryKey: boolean; unique: boolean; nullable: boolean; defaultValue?: string; indexed: boolean; hidden: boolean }[];
    relationships: { id: string; type: string; targetModel: string; foreignKey: string; throughTable?: string }[];
    timestamps: boolean; softDelete: boolean;
  };
  allModels: { id: string; name: string }[];
  onUpdate: (id: string, updates: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
  onAddField: (modelId: string, field: { id: string; name: string; type: string; primaryKey: boolean; unique: boolean; nullable: boolean; defaultValue?: string; indexed: boolean; hidden: boolean }) => void;
  onDeleteField: (modelId: string, fieldId: string) => void;
  onAddRelationship: (modelId: string, rel: { id: string; type: "has_many" | "belongs_to" | "many_to_many"; targetModel: string; foreignKey: string; throughTable?: string }) => void;
  onDeleteRelationship: (modelId: string, relId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showSql, setShowSql] = useState(false);
  const [showAddRelationship, setShowAddRelationship] = useState(false);

  // Add field form state
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState<string>("string");
  const [newFieldNullable, setNewFieldNullable] = useState(false);
  const [newFieldPrimaryKey, setNewFieldPrimaryKey] = useState(false);
  const [newFieldUnique, setNewFieldUnique] = useState(false);
  const [newFieldIndexed, setNewFieldIndexed] = useState(false);
  const [newFieldHidden, setNewFieldHidden] = useState(false);
  const [newFieldDefault, setNewFieldDefault] = useState("");

  // Edit field state
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editFieldName, setEditFieldName] = useState("");
  const [editFieldType, setEditFieldType] = useState<string>("string");
  const [editFieldNullable, setEditFieldNullable] = useState(false);
  const [editFieldUnique, setEditFieldUnique] = useState(false);
  const [editFieldIndexed, setEditFieldIndexed] = useState(false);
  const [editFieldHidden, setEditFieldHidden] = useState(false);
  const [editFieldDefault, setEditFieldDefault] = useState("");

  // Edit model state
  const [editingModel, setEditingModel] = useState(false);
  const [editModelName, setEditModelName] = useState(model.name);
  const [editTableName, setEditTableName] = useState(model.tableName);

  const handleAddField = () => {
    if (!newFieldName.trim()) return;
    onAddField(model.id, {
      id: generateId(),
      name: newFieldName.trim(),
      type: newFieldType,
      primaryKey: newFieldPrimaryKey,
      unique: newFieldUnique,
      nullable: newFieldNullable,
      defaultValue: newFieldDefault || undefined,
      indexed: newFieldIndexed,
      hidden: newFieldHidden,
    });
    setNewFieldName("");
    setNewFieldType("string");
    setNewFieldNullable(false);
    setNewFieldPrimaryKey(false);
    setNewFieldUnique(false);
    setNewFieldIndexed(false);
    setNewFieldHidden(false);
    setNewFieldDefault("");
  };

  const startEditField = (field: { id: string; name: string; type: string; primaryKey: boolean; unique: boolean; nullable: boolean; defaultValue?: string; indexed: boolean; hidden: boolean }) => {
    setEditingFieldId(field.id);
    setEditFieldName(field.name);
    setEditFieldType(field.type);
    setEditFieldNullable(field.nullable);
    setEditFieldUnique(field.unique);
    setEditFieldIndexed(field.indexed);
    setEditFieldHidden(field.hidden);
    setEditFieldDefault(field.defaultValue || "");
  };

  const handleSaveModelEdit = () => {
    if (!editModelName.trim() || !editTableName.trim()) return;
    onUpdate(model.id, { name: editModelName.trim(), tableName: editTableName.trim() });
    setEditingModel(false);
  };

  const handleAddRelationship = (rel: { type: "has_many" | "belongs_to" | "many_to_many"; targetModel: string; foreignKey: string; throughTable?: string }) => {
    onAddRelationship(model.id, { ...rel, id: generateId() });
  };

  const sql = generateSql(model);

  return (
    <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Card Header */}
      <div
        className="flex cursor-pointer items-center justify-between px-6 py-5"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <ChevronIcon open={expanded} />
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-[#111827]">{model.name}</h3>
              {model.timestamps && <Badge variant="muted">timestamps</Badge>}
              {model.softDelete && <Badge variant="warning">soft delete</Badge>}
            </div>
            <p className="mt-0.5 font-mono text-sm text-[#6B7280]">{model.tableName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline">{model.fields.length} fields</Badge>
          <Badge variant="outline">{model.relationships.length} relations</Badge>
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => {
                setEditModelName(model.name);
                setEditTableName(model.tableName);
                setEditingModel(true);
              }}
              className="rounded-lg p-2 text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#374151]"
              aria-label={`Edit ${model.name}`}
            >
              <EditIcon />
            </button>
            <button
              type="button"
              onClick={() => onDelete(model.id)}
              className="rounded-lg p-2 text-[#6B7280] transition-colors hover:bg-[#FEE2E2] hover:text-[#DC2626]"
              aria-label={`Delete ${model.name}`}
            >
              <TrashIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-[#E5E7EB]">
          {/* Edit Model Inline */}
          {editingModel && (
            <div className="border-b border-[#E5E7EB] bg-[#F9FAFB] px-6 py-4">
              <h4 className="mb-3 text-sm font-semibold text-[#374151]">Edit Model</h4>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-[#6B7280]">Model Name</label>
                  <input
                    type="text"
                    value={editModelName}
                    onChange={(e) => setEditModelName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] focus:border-[#374151] focus:outline-none focus:ring-1 focus:ring-[#374151]"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-[#6B7280]">Table Name</label>
                  <input
                    type="text"
                    value={editTableName}
                    onChange={(e) => setEditTableName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 font-mono text-sm text-[#111827] focus:border-[#374151] focus:outline-none focus:ring-1 focus:ring-[#374151]"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingModel(false)}
                    className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm font-medium text-[#374151] hover:bg-[#F3F4F6]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveModelEdit}
                    className="rounded-lg bg-[#374151] px-3 py-2 text-sm font-medium text-white hover:bg-[#1F2937]"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Fields Section */}
          <div className="px-6 py-5">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-[#374151]">Fields</h4>
              <span className="text-xs text-[#9CA3AF]">{model.fields.length} total</span>
            </div>

            {/* Fields Table */}
            <div className="overflow-x-auto rounded-lg border border-[#E5E7EB]">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                    <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Field</th>
                    <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Type</th>
                    <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Constraints</th>
                    <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {model.fields.map((field) => (
                    <tr key={field.id} className="transition-colors hover:bg-[#F9FAFB]">
                      <td className="px-4 py-3">
                        {editingFieldId === field.id ? (
                          <input
                            type="text"
                            value={editFieldName}
                            onChange={(e) => setEditFieldName(e.target.value)}
                            className="w-full rounded border border-[#D1D5DB] bg-white px-2 py-1 font-mono text-sm text-[#111827] focus:border-[#374151] focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-[#111827]">{field.name}</span>
                            {field.hidden && <Badge variant="warning">hidden</Badge>}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingFieldId === field.id ? (
                          <select
                            value={editFieldType}
                            onChange={(e) => setEditFieldType(e.target.value)}
                            className="rounded border border-[#D1D5DB] bg-white px-2 py-1 text-xs text-[#111827] focus:border-[#374151] focus:outline-none"
                          >
                            {FIELD_TYPES.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        ) : (
                          <Badge>{field.type}</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingFieldId === field.id ? (
                          <div className="flex flex-wrap gap-2">
                            <label className="flex items-center gap-1 text-xs text-[#6B7280]">
                              <input type="checkbox" checked={editFieldNullable} onChange={(e) => setEditFieldNullable(e.target.checked)} className="h-3 w-3 accent-[#374151]" />
                              NULL
                            </label>
                            <label className="flex items-center gap-1 text-xs text-[#6B7280]">
                              <input type="checkbox" checked={editFieldUnique} onChange={(e) => setEditFieldUnique(e.target.checked)} className="h-3 w-3 accent-[#374151]" />
                              UNIQUE
                            </label>
                            <label className="flex items-center gap-1 text-xs text-[#6B7280]">
                              <input type="checkbox" checked={editFieldIndexed} onChange={(e) => setEditFieldIndexed(e.target.checked)} className="h-3 w-3 accent-[#374151]" />
                              INDEX
                            </label>
                            <label className="flex items-center gap-1 text-xs text-[#6B7280]">
                              <input type="checkbox" checked={editFieldHidden} onChange={(e) => setEditFieldHidden(e.target.checked)} className="h-3 w-3 accent-[#374151]" />
                              HIDDEN
                            </label>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {field.primaryKey && <Badge variant="warning">PK</Badge>}
                            {field.unique && !field.primaryKey && <Badge variant="success">UNIQUE</Badge>}
                            {!field.nullable && !field.primaryKey && <Badge variant="muted">NOT NULL</Badge>}
                            {field.nullable && <Badge variant="outline">NULL</Badge>}
                            {field.indexed && <Badge variant="outline">INDEXED</Badge>}
                            {field.defaultValue && <Badge variant="muted">DEFAULT: {field.defaultValue}</Badge>}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingFieldId === field.id ? (
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                // Use the store's updateField
                                const { updateField } = useDashboardStore.getState();
                                updateField(model.id, field.id, {
                                  name: editFieldName,
                                  type: editFieldType,
                                  nullable: editFieldNullable,
                                  unique: editFieldUnique,
                                  indexed: editFieldIndexed,
                                  hidden: editFieldHidden,
                                  defaultValue: editFieldDefault || undefined,
                                });
                                setEditingFieldId(null);
                              }}
                              className="rounded px-2 py-1 text-xs font-medium text-[#059669] hover:bg-[#ECFDF5]"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingFieldId(null)}
                              className="rounded px-2 py-1 text-xs font-medium text-[#6B7280] hover:bg-[#F3F4F6]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => startEditField(field)}
                              className="rounded p-1.5 text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#374151]"
                              aria-label={`Edit ${field.name}`}
                            >
                              <EditIcon />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteField(model.id, field.id)}
                              className="rounded p-1.5 text-[#6B7280] transition-colors hover:bg-[#FEE2E2] hover:text-[#DC2626]"
                              aria-label={`Delete ${field.name}`}
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Field Inline Form */}
            <div className="mt-4 rounded-lg border border-dashed border-[#D1D5DB] bg-[#F9FAFB] p-4">
              <h5 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Add Field</h5>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <input
                  type="text"
                  placeholder="Field name"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] placeholder-[#9CA3AF] focus:border-[#374151] focus:outline-none focus:ring-1 focus:ring-[#374151]"
                />
                <select
                  value={newFieldType}
                  onChange={(e) => setNewFieldType(e.target.value)}
                  className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] focus:border-[#374151] focus:outline-none focus:ring-1 focus:ring-[#374151]"
                >
                  {FIELD_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Default value (optional)"
                  value={newFieldDefault}
                  onChange={(e) => setNewFieldDefault(e.target.value)}
                  className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] placeholder-[#9CA3AF] focus:border-[#374151] focus:outline-none focus:ring-1 focus:ring-[#374151]"
                />
                <button
                  type="button"
                  onClick={handleAddField}
                  disabled={!newFieldName.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#374151] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1F2937] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#374151] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <PlusIcon />
                  Add Field
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-[#6B7280]">
                  <input
                    type="checkbox"
                    checked={newFieldPrimaryKey}
                    onChange={(e) => setNewFieldPrimaryKey(e.target.checked)}
                    className="h-4 w-4 rounded border-[#D1D5DB] accent-[#374151]"
                  />
                  Primary Key
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-[#6B7280]">
                  <input
                    type="checkbox"
                    checked={newFieldUnique}
                    onChange={(e) => setNewFieldUnique(e.target.checked)}
                    className="h-4 w-4 rounded border-[#D1D5DB] accent-[#374151]"
                  />
                  Unique
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-[#6B7280]">
                  <input
                    type="checkbox"
                    checked={newFieldNullable}
                    onChange={(e) => setNewFieldNullable(e.target.checked)}
                    className="h-4 w-4 rounded border-[#D1D5DB] accent-[#374151]"
                  />
                  Nullable
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-[#6B7280]">
                  <input
                    type="checkbox"
                    checked={newFieldIndexed}
                    onChange={(e) => setNewFieldIndexed(e.target.checked)}
                    className="h-4 w-4 rounded border-[#D1D5DB] accent-[#374151]"
                  />
                  Indexed
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-[#6B7280]">
                  <input
                    type="checkbox"
                    checked={newFieldHidden}
                    onChange={(e) => setNewFieldHidden(e.target.checked)}
                    className="h-4 w-4 rounded border-[#D1D5DB] accent-[#374151]"
                  />
                  Hidden
                </label>
              </div>
            </div>
          </div>

          {/* Relationships Section */}
          {model.relationships.length > 0 && (
            <div className="border-t border-[#E5E7EB] px-6 py-5">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-[#374151]">Relationships</h4>
                <span className="text-xs text-[#9CA3AF]">{model.relationships.length} total</span>
              </div>
              <div className="space-y-2">
                {model.relationships.map((rel) => (
                  <div
                    key={rel.id}
                    className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="muted">{rel.type.replace(/_/g, " ")}</Badge>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-[#111827]">{model.name}</span>
                        <span className="text-[#6B7280]">{"->"}</span>
                        <span className="font-medium text-[#111827]">{rel.targetModel}</span>
                      </div>
                      <span className="font-mono text-xs text-[#6B7280]">via {rel.foreignKey}</span>
                      {rel.throughTable && (
                        <span className="font-mono text-xs text-[#9CA3AF]">through {rel.throughTable}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteRelationship(model.id, rel.id)}
                      className="rounded p-1.5 text-[#6B7280] transition-colors hover:bg-[#FEE2E2] hover:text-[#DC2626]"
                      aria-label={`Delete relationship to ${rel.targetModel}`}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions Footer */}
          <div className="flex flex-wrap items-center gap-3 border-t border-[#E5E7EB] px-6 py-4">
            <button
              type="button"
              onClick={() => setShowAddRelationship(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2 text-sm font-medium text-[#374151] transition-colors hover:bg-[#F3F4F6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#374151] focus-visible:ring-offset-2"
            >
              <LinkIcon />
              Add Relationship
            </button>
            <button
              type="button"
              onClick={() => setShowSql(!showSql)}
              className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3.5 py-2 text-sm font-medium text-[#374151] transition-colors hover:bg-[#F3F4F6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#374151] focus-visible:ring-offset-2"
            >
              <CodeIcon />
              {showSql ? "Hide SQL" : "Generate SQL"}
            </button>
          </div>

          {/* SQL Preview */}
          {showSql && (
            <div className="border-t border-[#E5E7EB] bg-[#1F2937] px-6 py-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#9CA3AF]">SQL Preview</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(sql);
                  }}
                  className="rounded px-2 py-1 text-xs text-[#9CA3AF] transition-colors hover:bg-[#374151] hover:text-white"
                >
                  Copy
                </button>
              </div>
              <pre className="overflow-x-auto font-mono text-sm text-[#E5E7EB]">
                <code>{sql}</code>
              </pre>
            </div>
          )}

          {/* Add Relationship Modal */}
          {showAddRelationship && (
            <AddRelationshipModal
              models={allModels}
              currentModelId={model.id}
              onClose={() => setShowAddRelationship(false)}
              onAdd={handleAddRelationship}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───

export default function ModelsPage() {
  const {
    models, addModel, updateModel, deleteModel, addField, deleteField,
    addRelationship, deleteRelationship,
  } = useDashboardStore();

  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateModel = useCallback(
    (data: { name: string; tableName: string; timestamps: boolean; softDelete: boolean }) => {
      addModel({
        id: generateId(),
        name: data.name,
        tableName: data.tableName,
        timestamps: data.timestamps,
        softDelete: data.softDelete,
        fields: [],
        relationships: [],
      });
    },
    [addModel]
  );

  const handleAddField = useCallback(
    (modelId: string, field: { id: string; name: string; type: string; primaryKey: boolean; unique: boolean; nullable: boolean; defaultValue?: string; indexed: boolean; hidden: boolean }) => {
      addField(modelId, field);
    },
    [addField]
  );

  const handleDeleteField = useCallback(
    (modelId: string, fieldId: string) => {
      deleteField(modelId, fieldId);
    },
    [deleteField]
  );

  const handleAddRelationship = useCallback(
    (modelId: string, rel: { id: string; type: "has_many" | "belongs_to" | "many_to_many"; targetModel: string; foreignKey: string; throughTable?: string }) => {
      addRelationship(modelId, rel);
    },
    [addRelationship]
  );

  const handleDeleteRelationship = useCallback(
    (modelId: string, relId: string) => {
      deleteRelationship(modelId, relId);
    },
    [deleteRelationship]
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#374151] text-white">
              <DatabaseIcon />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#111827]">Data Models</h1>
              <p className="mt-0.5 text-sm text-[#6B7280]">
                Define and manage your database schema models, fields, and relationships.
              </p>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#374151] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#1F2937] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#374151] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F9FAFB]"
        >
          <PlusIcon />
          Create New Model
        </button>
      </div>

      {/* Stats Bar */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm">
          <span className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">Total Models</span>
          <p className="mt-0.5 text-2xl font-bold text-[#111827]">{models.length}</p>
        </div>
        <div className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm">
          <span className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">Total Fields</span>
          <p className="mt-0.5 text-2xl font-bold text-[#111827]">
            {models.reduce((sum, m) => sum + m.fields.length, 0)}
          </p>
        </div>
        <div className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 shadow-sm">
          <span className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">Total Relations</span>
          <p className="mt-0.5 text-2xl font-bold text-[#111827]">
            {models.reduce((sum, m) => sum + m.relationships.length, 0)}
          </p>
        </div>
      </div>

      {/* Model Cards */}
      {models.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#D1D5DB] bg-white py-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F3F4F6]">
            <DatabaseIcon />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-[#111827]">No models yet</h3>
          <p className="mt-1 text-sm text-[#6B7280]">Get started by creating your first data model.</p>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#374151] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1F2937] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#374151] focus-visible:ring-offset-2"
          >
            <PlusIcon />
            Create New Model
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {models.map((model) => (
            <ModelCard
              key={model.id}
              model={model}
              allModels={models.map((m) => ({ id: m.id, name: m.name }))}
              onUpdate={updateModel}
              onDelete={deleteModel}
              onAddField={handleAddField}
              onDeleteField={handleDeleteField}
              onAddRelationship={handleAddRelationship}
              onDeleteRelationship={handleDeleteRelationship}
            />
          ))}
        </div>
      )}

      {/* Create Model Modal */}
      {showCreateModal && (
        <CreateModelModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateModel}
        />
      )}
    </div>
  );
}
