"use client";

import { useState } from "react";
import PluginCard from "@/components/PluginCard";
import useDashboardStore from "@/store/dashboard";

export default function PluginsPage() {
  const { plugins, togglePlugin } = useDashboardStore();
  const [searchQuery, setSearchQuery] = useState("");

  const activeCount = plugins.filter((p) => p.status === "active").length;
  const inactiveCount = plugins.filter((p) => p.status === "inactive").length;
  const errorCount = plugins.filter((p) => p.status === "error").length;

  const filteredPlugins = plugins.filter(
    (plugin) =>
      plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#111827]">Plugin Manager</h1>
        <p className="mt-2 text-[#6B7280]">
          Manage and monitor your installed plugins. Toggle activation states,
          review dependencies, and keep your system running smoothly.
        </p>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-4 rounded-lg border border-[#E5E7EB] bg-white p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            className="rounded-md bg-[#374151] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1F2937]"
          >
            Add Plugin
          </button>

          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#059669]" />
              <span className="font-medium text-[#059669]">
                {activeCount} active
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#9CA3AF]" />
              <span className="font-medium text-[#6B7280]">
                {inactiveCount} inactive
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#DC2626]" />
              <span className="font-medium text-[#DC2626]">
                {errorCount} error
              </span>
            </span>
          </div>
        </div>

        <input
          type="text"
          placeholder="Search plugins..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] placeholder-[#9CA3AF] outline-none transition-colors focus:border-[#6B7280]"
        />
      </div>

      {/* Plugin Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPlugins.map((plugin) => (
          <PluginCard
            key={plugin.name}
            name={plugin.name}
            version={plugin.version}
            description={plugin.description}
            status={plugin.status}
            dependencies={plugin.dependencies}
            onToggle={() => togglePlugin(plugin.name)}
          />
        ))}
      </div>

      {filteredPlugins.length === 0 && (
        <div className="mt-8 rounded-lg border border-[#E5E7EB] bg-white p-8 text-center">
          <p className="text-[#6B7280]">
            {searchQuery
              ? "No plugins match your search."
              : "No plugins installed yet."}
          </p>
        </div>
      )}

      {/* About Plugins Section */}
      <div className="mt-10 rounded-lg border border-[#E5E7EB] bg-white p-6">
        <h2 className="text-lg font-semibold text-[#111827]">
          About Plugins
        </h2>
        <p className="mt-2 text-sm text-[#6B7280]">
          Plugins extend the functionality of your dashboard. Each plugin can be
          independently activated or deactivated. Active plugins are loaded at
          runtime and contribute features to the system. Inactive plugins are
          installed but not loaded. Plugins showing an error status may have
          missing dependencies or failed to initialize properly.
        </p>

        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#059669]" />
            <span className="text-[#374151]">Active</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#9CA3AF]" />
            <span className="text-[#374151]">Inactive</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#DC2626]" />
            <span className="text-[#374151]">Error</span>
          </span>
        </div>
      </div>
    </div>
  );
}
