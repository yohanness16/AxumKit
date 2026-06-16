"use client";

import { useState, useMemo } from "react";
import { useDashboardStore } from "@/store/dashboard";

const METHOD_BADGES: Record<string, string> = {
  GET: "bg-[#F3F4F6] text-[#374151]",
  POST: "bg-[#D1FAE5] text-[#059669]",
  PUT: "bg-[#FEF3C7] text-[#D97706]",
  PATCH: "bg-[#FEF3C7] text-[#D97706]",
  DELETE: "bg-[#FEE2E2] text-[#DC2626]",
};

const AUTH_BADGES: Record<string, string> = {
  public: "bg-[#F3F4F6] text-[#6B7280]",
  required: "bg-[#FEF3C7] text-[#D97706]",
  admin: "bg-[#374151] text-white",
};

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export default function ApiPage() {
  const endpoints = useDashboardStore((s) => s.endpoints);
  const apiConfig = useDashboardStore((s) => s.apiConfig);
  const addEndpoint = useDashboardStore((s) => s.addEndpoint);
  const deleteEndpoint = useDashboardStore((s) => s.deleteEndpoint);
  const toggleEndpointStatus = useDashboardStore((s) => s.toggleEndpointStatus);
  const setApiConfig = useDashboardStore((s) => s.setApiConfig);

  const [collapsedModels, setCollapsedModels] = useState<Set<string>>(new Set());
  const [defaultSize, setDefaultSize] = useState(apiConfig.pagination.defaultSize);
  const [maxSize, setMaxSize] = useState(apiConfig.pagination.maxSize);
  const [corsEnabled, setCorsEnabled] = useState(apiConfig.cors.enabled);
  const [originsText, setOriginsText] = useState(apiConfig.cors.origins.join(", "));

  // Group endpoints by model
  const grouped = useMemo(() => {
    const map = new Map<string, { model: string; endpoints: { endpoint: typeof endpoints[0]; globalIndex: number }[] }>();
    endpoints.forEach((ep, globalIndex) => {
      const key = ep.model ?? "__custom__";
      if (!map.has(key)) {
        map.set(key, { model: key === "__custom__" ? "Custom" : ep.model!, endpoints: [] });
      }
      map.get(key)!.endpoints.push({ endpoint: ep, globalIndex });
    });
    return Array.from(map.values());
  }, [endpoints]);

  const toggleCollapse = (model: string) => {
    setCollapsedModels((prev) => {
      const next = new Set(prev);
      if (next.has(model)) next.delete(model);
      else next.add(model);
      return next;
    });
  };

  const handleAddCustomEndpoint = () => {
    addEndpoint({
      method: "GET",
      path: `/api/v1/custom-${generateId()}`,
      auth: "public",
      status: "active",
    });
  };

  const handleSavePagination = () => {
    setApiConfig({
      pagination: { defaultSize, maxSize },
    });
  };

  const handleSaveCors = () => {
    setApiConfig({
      cors: {
        enabled: corsEnabled,
        origins: originsText.split(",").map((s) => s.trim()).filter(Boolean),
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6 lg:p-8">
      {/* ─── Header ─── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#111827]">API Endpoints</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Manage auto-generated REST endpoints from your models, add custom routes, and configure API-wide settings.
        </p>
      </div>

      {/* ─── Auto-generated Endpoints ─── */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-[#111827]">Auto-generated Endpoints</h2>
            <p className="mt-0.5 text-xs text-[#6B7280]">
              {endpoints.length} endpoint{endpoints.length !== 1 ? "s" : ""} across {grouped.length} group{grouped.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={handleAddCustomEndpoint}
            className="rounded-lg border border-[#D1D5DB] bg-white px-4 py-2 text-sm font-medium text-[#374151] transition hover:bg-[#F3F4F6] active:scale-[0.98]"
          >
            + Custom Endpoint
          </button>
        </div>

        {/* Grouped endpoint tables */}
        <div className="divide-y divide-[#E5E7EB]">
          {grouped.map(({ model, endpoints: groupEndpoints }) => {
            const isCustom = model === "Custom";
            const isCollapsed = collapsedModels.has(model);
            return (
              <div key={model}>
                {/* Group header */}
                <button
                  onClick={() => toggleCollapse(model)}
                  className="flex w-full items-center gap-3 px-6 py-3 text-left transition hover:bg-[#F9FAFB]"
                >
                  <svg
                    className={`h-4 w-4 text-[#6B7280] transition-transform ${isCollapsed ? "" : "rotate-90"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-sm font-semibold text-[#111827]">{model}</span>
                  <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-xs font-medium text-[#6B7280]">
                    {groupEndpoints.length}
                  </span>
                  {isCustom && (
                    <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-xs font-medium text-[#D97706]">
                      custom
                    </span>
                  )}
                </button>

                {/* Table */}
                {!isCollapsed && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                          <th className="px-6 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                            Method
                          </th>
                          <th className="px-6 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                            Endpoint
                          </th>
                          <th className="px-6 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                            Auth
                          </th>
                          <th className="px-6 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                            Status
                          </th>
                          <th className="px-6 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F3F4F6]">
                        {groupEndpoints.map(({ endpoint, globalIndex }) => (
                          <tr key={`${endpoint.method}-${endpoint.path}-${globalIndex}`} className="transition hover:bg-[#F9FAFB]">
                            {/* Method */}
                            <td className="px-6 py-3">
                              <span
                                className={`inline-block rounded-md px-2.5 py-1 text-xs font-bold ${METHOD_BADGES[endpoint.method] ?? "bg-[#F3F4F6] text-[#374151]"}`}
                              >
                                {endpoint.method}
                              </span>
                            </td>

                            {/* Endpoint */}
                            <td className="px-6 py-3">
                              <code className="rounded bg-[#F3F4F6] px-2 py-0.5 text-sm font-mono text-[#111827]">
                                {endpoint.path}
                              </code>
                            </td>

                            {/* Auth */}
                            <td className="px-6 py-3">
                              <span
                                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${AUTH_BADGES[endpoint.auth]}`}
                              >
                                {endpoint.auth === "required" ? "Required" : endpoint.auth === "admin" ? "Admin" : "Public"}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="px-6 py-3">
                              <span
                                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  endpoint.status === "active"
                                    ? "bg-[#D1FAE5] text-[#059669]"
                                    : "bg-[#F3F4F6] text-[#6B7280]"
                                }`}
                              >
                                {endpoint.status === "active" ? "Active" : "Disabled"}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-3">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => toggleEndpointStatus(globalIndex)}
                                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                                    endpoint.status === "active"
                                      ? "border-[#FEE2E2] text-[#DC2626] hover:bg-[#FEE2E2]"
                                      : "border-[#D1FAE5] text-[#059669] hover:bg-[#D1FAE5]"
                                  }`}
                                  title={endpoint.status === "active" ? "Disable endpoint" : "Enable endpoint"}
                                >
                                  {endpoint.status === "active" ? "Disable" : "Enable"}
                                </button>
                                <button
                                  onClick={() => deleteEndpoint(globalIndex)}
                                  className="rounded-lg border border-[#FEE2E2] px-3 py-1.5 text-xs font-medium text-[#DC2626] transition hover:bg-[#FEE2E2]"
                                  title="Delete endpoint"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Settings Sections ─── */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Pagination Defaults */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-[#111827]">Pagination Defaults</h2>
          <p className="mt-0.5 text-xs text-[#6B7280]">
            Configure default and maximum page sizes for list endpoints.
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#374151]">
                Default Page Size
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={defaultSize}
                onChange={(e) => setDefaultSize(Number(e.target.value))}
                className="w-full rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-2 text-sm text-[#111827] outline-none transition focus:border-[#374151] focus:ring-1 focus:ring-[#374151]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#374151]">
                Max Page Size
              </label>
              <input
                type="number"
                min={1}
                max={1000}
                value={maxSize}
                onChange={(e) => setMaxSize(Number(e.target.value))}
                className="w-full rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-2 text-sm text-[#111827] outline-none transition focus:border-[#374151] focus:ring-1 focus:ring-[#374151]"
              />
            </div>
            <button
              onClick={handleSavePagination}
              className="rounded-lg bg-[#374151] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1F2937] active:scale-[0.98]"
            >
              Save Pagination
            </button>
          </div>
        </div>

        {/* CORS Config */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-[#111827]">CORS Configuration</h2>
          <p className="mt-0.5 text-xs text-[#6B7280]">
            Control cross-origin resource sharing for your API.
          </p>

          <div className="mt-5 space-y-4">
            {/* Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#374151]">Enable CORS</span>
              <button
                onClick={() => setCorsEnabled((v) => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  corsEnabled ? "bg-[#059669]" : "bg-[#D1D5DB]"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    corsEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Origins */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#374151]">
                Allowed Origins
              </label>
              <input
                type="text"
                value={originsText}
                onChange={(e) => setOriginsText(e.target.value)}
                placeholder="http://localhost:3000, https://example.com"
                disabled={!corsEnabled}
                className="w-full rounded-lg border border-[#D1D5DB] bg-[#F9FAFB] px-3 py-2 text-sm text-[#111827] outline-none transition focus:border-[#374151] focus:ring-1 focus:ring-[#374151] disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="mt-1 text-xs text-[#6B7280]">Comma-separated list of allowed origins.</p>
            </div>

            <button
              onClick={handleSaveCors}
              className="rounded-lg bg-[#374151] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1F2937] active:scale-[0.98]"
            >
              Save CORS
            </button>
          </div>
        </div>
      </div>

      {/* ─── Action Buttons ─── */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          className="rounded-lg bg-[#374151] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#1F2937] active:scale-[0.98]"
          onClick={() => alert("OpenAPI generation is not yet implemented.")}
        >
          Generate OpenAPI
        </button>
        <button
          className="rounded-lg border border-[#D1D5DB] bg-white px-5 py-2.5 text-sm font-medium text-[#374151] transition hover:bg-[#F3F4F6] active:scale-[0.98]"
          onClick={() => window.open("/swagger", "_blank")}
        >
          Test in Swagger
        </button>
      </div>
    </div>
  );
}
