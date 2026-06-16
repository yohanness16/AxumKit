"use client";

import React, { useState } from "react";
import { useDashboardStore } from "@/store/dashboard";

// ─── Inline SVG Icon Components ───

function PostgreSQLIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2C6.48 2 2 4.69 2 8c0 2.06 1.66 3.88 4.2 5.04L4.5 21h3l1.4-5.66C9.9 15.56 10.94 15.68 12 15.68s2.1-.12 3.1-.34L16.5 21h3l-1.7-7.96C20.34 11.88 22 10.06 22 8c0-3.31-4.48-6-10-6z" />
      <circle cx="12" cy="8" r="2" />
    </svg>
  );
}

function MySQLIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <ellipse cx="12" cy="12" rx="10" ry="4" />
      <path d="M2 12c0 2.21 4.48 4 10 4s10-1.79 10-4" />
      <path d="M2 12v6c0 2.21 4.48 4 10 4s10-1.79 10-4v-6" />
    </svg>
  );
}

function SQLiteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" />
      <path d="M12 22V12" />
      <path d="M3 7l9 5 9-5" />
      <path d="M12 12l9-5" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ─── Toggle Switch ───

function ToggleSwitch({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onToggle}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B7280] focus-visible:ring-offset-2 ${
        checked ? "bg-[#374151]" : "bg-[#D1D5DB]"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-[18px]" : "translate-x-[3px]"
        }`}
        aria-hidden="true"
      />
    </button>
  );
}

// ─── Engine Card Data ───

type DbEngine = "postgresql" | "mysql" | "sqlite";

interface EngineCard {
  id: DbEngine;
  name: string;
  description: string;
  icon: React.FC<{ className?: string }>;
}

const ENGINES: EngineCard[] = [
  {
    id: "postgresql",
    name: "PostgreSQL",
    description: "Advanced open-source relational database",
    icon: PostgreSQLIcon,
  },
  {
    id: "mysql",
    name: "MySQL",
    description: "Popular open-source relational database",
    icon: MySQLIcon,
  },
  {
    id: "sqlite",
    name: "SQLite",
    description: "Lightweight file-based embedded database",
    icon: SQLiteIcon,
  },
];

// ─── Mock Table Data ───

interface TableRow {
  name: string;
  fields: number;
  relationships: number;
  status: string;
}

const MOCK_TABLES: TableRow[] = [
  { name: "users", fields: 6, relationships: 2, status: "Active" },
  { name: "posts", fields: 5, relationships: 1, status: "Active" },
  { name: "products", fields: 5, relationships: 0, status: "Active" },
];

// ─── Page Component ───

export default function DatabasePage() {
  const { dbConfig, setDbConfig, testDbConnection } = useDashboardStore();
  const [testing, setTesting] = useState(false);

  const handleEngineSelect = (engine: DbEngine) => {
    setDbConfig({ engine });
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      await testDbConnection();
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#111827]">Database Configuration</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Configure your database engine, connection settings, and manage migrations.
        </p>
      </div>

      <div className="space-y-6">
        {/* ── DB Engine Selector ── */}
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#6B7280]">
            Database Engine
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {ENGINES.map((engine) => {
              const isSelected = dbConfig.engine === engine.id;
              const Icon = engine.icon;
              return (
                <button
                  key={engine.id}
                  type="button"
                  onClick={() => handleEngineSelect(engine.id)}
                  className={`group relative flex flex-col items-start rounded-xl border-2 p-5 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B7280] focus-visible:ring-offset-2 ${
                    isSelected
                      ? "border-[#374151] bg-[#F9FAFB]"
                      : "border-[#E5E7EB] bg-white hover:border-[#D1D5DB]"
                  }`}
                >
                  {/* Checkmark badge */}
                  {isSelected && (
                    <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#374151]">
                      <CheckIcon className="h-3 w-3 text-white" />
                    </span>
                  )}

                  <Icon
                    className={`mb-3 h-8 w-8 ${
                      isSelected ? "text-[#374151]" : "text-[#9CA3AF] group-hover:text-[#6B7280]"
                    }`}
                  />
                  <span
                    className={`text-sm font-semibold ${
                      isSelected ? "text-[#111827]" : "text-[#374151]"
                    }`}
                  >
                    {engine.name}
                  </span>
                  <span className="mt-1 text-xs text-[#9CA3AF]">{engine.description}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Connection Settings ── */}
        <section className="rounded-xl border border-[#E5E7EB] bg-white p-6">
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-[#6B7280]">
            Connection Settings
          </h2>

          <div className="space-y-5">
            {/* Connection String */}
            <div>
              <label className="block text-sm font-medium text-[#374151]">
                Connection String
              </label>
              <p className="mt-0.5 text-xs text-[#9CA3AF]">
                Full connection URL for your {ENGINES.find((e) => e.id === dbConfig.engine)?.name} database.
              </p>
              <input
                type="text"
                value={dbConfig.connectionString}
                onChange={(e) => setDbConfig({ connectionString: e.target.value })}
                placeholder={
                  dbConfig.engine === "postgresql"
                    ? "postgres://user:password@localhost:5432/mydb"
                    : dbConfig.engine === "mysql"
                    ? "mysql://user:password@localhost:3306/mydb"
                    : "sqlite://./mydb.sqlite"
                }
                className="mt-2 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 font-mono text-sm text-[#111827] placeholder-[#9CA3AF] focus:border-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#6B7280]"
              />
            </div>

            {/* Pool Size & Timeout row */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[#374151]">
                  Pool Size
                </label>
                <p className="mt-0.5 text-xs text-[#9CA3AF]">
                  Maximum number of connections in the pool.
                </p>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={dbConfig.poolSize}
                  onChange={(e) => setDbConfig({ poolSize: Number(e.target.value) })}
                  className="mt-2 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] focus:border-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#6B7280]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#374151]">
                  Timeout
                </label>
                <p className="mt-0.5 text-xs text-[#9CA3AF]">
                  Connection timeout duration.
                </p>
                <div className="relative mt-2">
                  <input
                    type="number"
                    min={1}
                    max={300}
                    value={dbConfig.timeout}
                    onChange={(e) => setDbConfig({ timeout: Number(e.target.value) })}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 pr-16 text-sm text-[#111827] focus:border-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#6B7280]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#9CA3AF]">
                    seconds
                  </span>
                </div>
              </div>
            </div>

            {/* Auto-migrate toggle */}
            <div className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <div>
                <p className="text-sm font-medium text-[#374151]">Auto Migrate</p>
                <p className="text-xs text-[#9CA3AF]">
                  Automatically run pending migrations on startup.
                </p>
              </div>
              <ToggleSwitch
                checked={dbConfig.autoMigrate}
                onToggle={() => setDbConfig({ autoMigrate: !dbConfig.autoMigrate })}
              />
            </div>
          </div>
        </section>

        {/* ── Test Connection ── */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="inline-flex items-center rounded-lg bg-[#374151] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1F2937] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B7280] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {testing ? (
                <>
                  <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Test Connection"
              )}
            </button>

            {/* Connection status badge */}
            {dbConfig.connected ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D1FAE5] px-3 py-1 text-xs font-medium text-[#059669]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
                Connected &mdash; 12ms avg latency
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-medium text-[#6B7280]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#9CA3AF]" />
                Not connected
              </span>
            )}
          </div>
        </section>

        {/* ── Connected Tables (only when connected) ── */}
        {dbConfig.connected && (
          <section className="rounded-xl border border-[#E5E7EB] bg-white">
            <div className="border-b border-[#E5E7EB] px-6 py-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#6B7280]">
                Connected Tables
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                      Table Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                      Fields
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                      Relationships
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {MOCK_TABLES.map((table) => (
                    <tr key={table.name} className="hover:bg-[#F9FAFB]">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-medium text-[#111827]">
                          {table.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#6B7280]">{table.fields}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#6B7280]">{table.relationships}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D1FAE5] px-2.5 py-0.5 text-xs font-medium text-[#059669]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
                          {table.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── Action Buttons ── */}
        <section className="flex flex-wrap gap-3">
          <button
            type="button"
            className="inline-flex items-center rounded-lg border border-[#D1D5DB] bg-white px-5 py-2.5 text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B7280] focus-visible:ring-offset-2"
          >
            Generate Migrations
          </button>
          <button
            type="button"
            className="inline-flex items-center rounded-lg bg-[#374151] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1F2937] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B7280] focus-visible:ring-offset-2"
          >
            Run Migrations
          </button>
          <button
            type="button"
            className="inline-flex items-center rounded-lg px-5 py-2.5 text-sm font-medium text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#374151] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B7280] focus-visible:ring-offset-2"
          >
            View Schema
          </button>
        </section>
      </div>
    </div>
  );
}
