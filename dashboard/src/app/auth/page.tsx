"use client";

import React, { useState } from "react";
import { useDashboardStore } from "@/store/dashboard";

const AUTH_METHODS = [
  { id: "jwt" as const, name: "JWT", description: "JSON Web Tokens with stateless auth", icon: "key" },
  { id: "sessions" as const, name: "Sessions", description: "Server-side session management", icon: "server" },
  { id: "oauth2" as const, name: "OAuth2", description: "Third-party OAuth2 provider integration", icon: "shield" },
  { id: "api_keys" as const, name: "API Keys", description: "Simple API key authentication", icon: "lock" },
];

const ALGORITHMS = ["HS256", "HS384", "HS512", "RS256"] as const;

const METHOD_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  GET: { bg: "#F3F4F6", text: "#374151", border: "#D1D5DB" },
  POST: { bg: "#FEF3C7", text: "#92400E", border: "#FCD34D" },
  PUT: { bg: "#F3F4F6", text: "#374151", border: "#D1D5DB" },
  DELETE: { bg: "#FEE2E2", text: "#991B1B", border: "#FCA5A5" },
  PATCH: { bg: "#EDE9FE", text: "#5B21B6", border: "#C4B5FD" },
};

function AuthMethodIcon({ icon, className }: { icon: string; className?: string }) {
  const baseClass = className || "h-6 w-6";

  switch (icon) {
    case "key":
      return (
        <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
        </svg>
      );
    case "server":
      return (
        <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
        </svg>
      );
    case "shield":
      return (
        <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      );
    case "lock":
      return (
        <svg className={baseClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      );
    default:
      return null;
  }
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function PencilIcon() {
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

function PlusIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function AuthPage() {
  const {
    authConfig,
    setJwtConfig,
    generateJwtSecret,
    addRole,
    updateRole,
    deleteRole,
    addProtectedRoute,
    deleteProtectedRoute,
  } = useDashboardStore();

  const [saved, setSaved] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [editingRoleName, setEditingRoleName] = useState("");
  const [newRouteMethod, setNewRouteMethod] = useState("GET");
  const [newRoutePath, setNewRoutePath] = useState("");
  const [newRoutePermission, setNewRoutePermission] = useState("");

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleGenerateAuthCode = async () => {
    setGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setGenerating(false);
  };

  const handleAddRole = () => {
    const id = Date.now().toString(36);
    addRole({ name: `New Role ${id.slice(-4)}`, permissions: ["read.own"], inherits: [] });
  };

  const handleStartEditRole = (name: string) => {
    setEditingRole(name);
    setEditingRoleName(name);
  };

  const handleSaveEditRole = (originalName: string) => {
    if (editingRoleName.trim() && editingRoleName !== originalName) {
      updateRole(originalName, { name: editingRoleName.trim() });
    }
    setEditingRole(null);
    setEditingRoleName("");
  };

  const handleAddRoute = () => {
    if (!newRoutePath.trim()) return;
    addProtectedRoute({
      method: newRouteMethod,
      path: newRoutePath.trim(),
      requiredPermission: newRoutePermission.trim() || "auth.required",
    });
    setNewRoutePath("");
    setNewRoutePermission("");
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#111827]">Authentication</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Configure authentication methods, user roles, and route protection for your AXUMkit application.
        </p>
      </div>

      <div className="space-y-6">
        {/* Auth Method Selector */}
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#6B7280]">
            Auth Method
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {AUTH_METHODS.map((method) => {
              const isSelected = authConfig.method === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  className={`group relative flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B7280] focus-visible:ring-offset-2 ${
                    isSelected
                      ? "border-[#374151] bg-[#F9FAFB]"
                      : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB]"
                  }`}
                  aria-pressed={isSelected}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                      isSelected ? "bg-[#374151] text-white" : "bg-[#F3F4F6] text-[#6B7280]"
                    }`}
                  >
                    <AuthMethodIcon icon={method.icon} className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#111827]">{method.name}</p>
                    <p className="mt-0.5 text-xs text-[#6B7280]">{method.description}</p>
                  </div>
                  {isSelected && (
                    <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#374151] text-white">
                      <CheckIcon className="h-3 w-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* JWT Configuration */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
          <h2 className="mb-6 text-lg font-semibold text-[#111827]">JWT Configuration</h2>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Algorithm */}
            <div>
              <label className="block text-sm font-medium text-[#374151]">Algorithm</label>
              <p className="mt-0.5 text-xs text-[#9CA3AF]">Signing algorithm for JWT tokens.</p>
              <select
                value={authConfig.jwt.algorithm}
                onChange={(e) =>
                  setJwtConfig({ algorithm: e.target.value as typeof ALGORITHMS[number] })
                }
                className="mt-2 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] focus:border-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#6B7280]"
              >
                {ALGORITHMS.map((alg) => (
                  <option key={alg} value={alg}>
                    {alg}
                  </option>
                ))}
              </select>
            </div>

            {/* Issuer */}
            <div>
              <label className="block text-sm font-medium text-[#374151]">Issuer</label>
              <p className="mt-0.5 text-xs text-[#9CA3AF]">The &quot;iss&quot; claim in generated tokens.</p>
              <input
                type="text"
                value={authConfig.jwt.issuer}
                onChange={(e) => setJwtConfig({ issuer: e.target.value })}
                placeholder="my-app"
                className="mt-2 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] placeholder-[#9CA3AF] focus:border-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#6B7280]"
              />
            </div>

            {/* Secret Key */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#374151]">Secret Key</label>
              <p className="mt-0.5 text-xs text-[#9CA3AF]">Used to sign and verify JWT tokens. Keep this secure.</p>
              <div className="mt-2 flex gap-2">
                <input
                  type="password"
                  value={authConfig.jwt.secret}
                  onChange={(e) => setJwtConfig({ secret: e.target.value })}
                  placeholder="Enter or generate a secret key"
                  className="flex-1 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 font-mono text-sm text-[#111827] placeholder-[#9CA3AF] focus:border-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#6B7280]"
                />
                <button
                  type="button"
                  onClick={generateJwtSecret}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B7280] focus-visible:ring-offset-2"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                  </svg>
                  Generate Random
                </button>
              </div>
            </div>

            {/* Access TTL */}
            <div>
              <label className="block text-sm font-medium text-[#374151]">Access Token TTL</label>
              <p className="mt-0.5 text-xs text-[#9CA3AF]">How long access tokens remain valid.</p>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={authConfig.jwt.accessTTL}
                  onChange={(e) => setJwtConfig({ accessTTL: parseInt(e.target.value) || 15 })}
                  className="w-24 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] focus:border-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#6B7280]"
                />
                <span className="text-sm text-[#6B7280]">minutes</span>
              </div>
            </div>

            {/* Refresh TTL */}
            <div>
              <label className="block text-sm font-medium text-[#374151]">Refresh Token TTL</label>
              <p className="mt-0.5 text-xs text-[#9CA3AF]">How long refresh tokens remain valid.</p>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={authConfig.jwt.refreshTTL}
                  onChange={(e) => setJwtConfig({ refreshTTL: parseInt(e.target.value) || 7 })}
                  className="w-24 rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] focus:border-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#6B7280]"
                />
                <span className="text-sm text-[#6B7280]">days</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Roles */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#111827]">User Roles</h2>
              <p className="mt-0.5 text-sm text-[#6B7280]">
                Define roles and their associated permissions.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddRole}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B7280] focus-visible:ring-offset-2"
            >
              <PlusIcon />
              Add Role
            </button>
          </div>

          <div className="overflow-hidden rounded-lg border border-[#E5E7EB]">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F9FAFB]">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                    Permissions
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {authConfig.roles.map((role) => (
                  <tr key={role.name} className="transition-colors hover:bg-[#F9FAFB]">
                    <td className="px-4 py-3">
                      {editingRole === role.name ? (
                        <input
                          type="text"
                          value={editingRoleName}
                          onChange={(e) => setEditingRoleName(e.target.value)}
                          onBlur={() => handleSaveEditRole(role.name)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEditRole(role.name);
                            if (e.key === "Escape") {
                              setEditingRole(null);
                              setEditingRoleName("");
                            }
                          }}
                          autoFocus
                          className="w-full rounded border border-[#6B7280] px-2 py-1 text-sm text-[#111827] focus:outline-none focus:ring-1 focus:ring-[#6B7280]"
                        />
                      ) : (
                        <span className="text-sm font-medium text-[#111827]">{role.name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {role.permissions.map((perm) => (
                          <span
                            key={perm}
                            className="inline-flex items-center rounded-md bg-[#F3F4F6] px-2 py-0.5 text-xs font-medium text-[#374151]"
                          >
                            {perm}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartEditRole(role.name)}
                          className="rounded-md p-1.5 text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#374151] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B7280]"
                          aria-label={`Edit ${role.name}`}
                        >
                          <PencilIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteRole(role.name)}
                          className="rounded-md p-1.5 text-[#6B7280] transition-colors hover:bg-[#FEE2E2] hover:text-[#DC2626] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]"
                          aria-label={`Delete ${role.name}`}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {authConfig.roles.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-sm text-[#9CA3AF]">
                      No roles configured. Click &quot;Add Role&quot; to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Protected Routes */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#111827]">Protected Routes</h2>
              <p className="mt-0.5 text-sm text-[#6B7280]">
                Define which routes require specific permissions.
              </p>
            </div>
          </div>

          {/* Add Route Form */}
          <div className="mb-4 rounded-lg border border-dashed border-[#D1D5DB] bg-[#F9FAFB] p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              Add Route Protection
            </p>
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-[#6B7280]">Method</label>
                <select
                  value={newRouteMethod}
                  onChange={(e) => setNewRouteMethod(e.target.value)}
                  className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] focus:border-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#6B7280]"
                >
                  {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-[#6B7280]">Route Path</label>
                <input
                  type="text"
                  value={newRoutePath}
                  onChange={(e) => setNewRoutePath(e.target.value)}
                  placeholder="/api/v1/resource"
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] placeholder-[#9CA3AF] focus:border-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#6B7280]"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-[#6B7280]">Required Permission</label>
                <input
                  type="text"
                  value={newRoutePermission}
                  onChange={(e) => setNewRoutePermission(e.target.value)}
                  placeholder="resource.read"
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] placeholder-[#9CA3AF] focus:border-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#6B7280]"
                />
              </div>
              <button
                type="button"
                onClick={handleAddRoute}
                disabled={!newRoutePath.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#374151] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1F2937] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B7280] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <PlusIcon />
                Add
              </button>
            </div>
          </div>

          {/* Routes Table */}
          <div className="overflow-hidden rounded-lg border border-[#E5E7EB]">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F9FAFB]">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                    Method
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                    Route
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                    Required Permission
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {authConfig.protectedRoutes.map((route, index) => {
                  const colors = METHOD_COLORS[route.method] || METHOD_COLORS.GET;
                  return (
                    <tr key={`${route.method}-${route.path}-${index}`} className="transition-colors hover:bg-[#F9FAFB]">
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold"
                          style={{
                            backgroundColor: colors.bg,
                            color: colors.text,
                            borderColor: colors.border,
                          }}
                        >
                          {route.method}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm text-[#111827]">{route.path}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-md bg-[#F3F4F6] px-2 py-0.5 text-xs font-medium text-[#374151]">
                          {route.requiredPermission}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => deleteProtectedRoute(index)}
                            className="rounded-md p-1.5 text-[#6B7280] transition-colors hover:bg-[#FEE2E2] hover:text-[#DC2626] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]"
                            aria-label={`Delete route ${route.method} ${route.path}`}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {authConfig.protectedRoutes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-[#9CA3AF]">
                      No protected routes configured. Add one above to restrict access.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-6">
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center rounded-lg bg-[#374151] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1F2937] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B7280] focus-visible:ring-offset-2"
          >
            {saved ? (
              <>
                <CheckIcon className="mr-2 h-4 w-4" />
                Saved
              </>
            ) : (
              "Save Auth Config"
            )}
          </button>
          <button
            type="button"
            onClick={handleGenerateAuthCode}
            disabled={generating}
            className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-5 py-2.5 text-sm font-medium text-[#374151] transition-colors hover:bg-[#F9FAFB] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B7280] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {generating ? (
              <>
                <SpinnerIcon />
                Generating...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                </svg>
                Generate Auth Code
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
