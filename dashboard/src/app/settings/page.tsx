"use client";

import React, { useState } from "react";

interface FormFieldProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

function FormField({ label, description, children }: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#374151]">{label}</label>
      {description && <p className="mt-0.5 text-xs text-[#9CA3AF]">{description}</p>}
      <div className="mt-2">{children}</div>
    </div>
  );
}

function TextInput({
  placeholder,
  defaultValue,
  type = "text",
}: {
  placeholder?: string;
  defaultValue?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      defaultValue={defaultValue}
      className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] placeholder-[#9CA3AF] focus:border-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#6B7280]"
    />
  );
}

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

const TABS = [
  { id: "general", label: "General" },
  { id: "database", label: "Database" },
  { id: "auth", label: "Auth" },
  { id: "redis", label: "Redis" },
  { id: "api", label: "API" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [saved, setSaved] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [autoMigrate, setAutoMigrate] = useState(true);
  const [emailVerification, setEmailVerification] = useState(false);
  const [rateLimiting, setRateLimiting] = useState(true);
  const [enableCaching, setEnableCaching] = useState(false);
  const [openapiDocs, setOpenapiDocs] = useState(true);
  const [compression, setCompression] = useState(true);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#111827]">Settings</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Configure your AXUMkit application settings across all subsystems.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        {/* Sidebar Tabs */}
        <nav aria-label="Settings sections" className="flex flex-wrap gap-1 lg:flex-col">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B7280] ${
                activeTab === tab.id
                  ? "bg-[#374151]/10 text-[#374151]"
                  : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#374151]"
              }`}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tab-panel-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        <div className="min-w-0">
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-6" role="tabpanel" id={`tab-panel-${activeTab}`}>
            <h2 className="mb-6 text-lg font-semibold text-[#111827]">
              {TABS.find((t) => t.id === activeTab)?.label} Settings
            </h2>

            {activeTab === "general" && (
              <div className="space-y-6">
                <FormField label="Application Name" description="The name displayed in the dashboard header.">
                  <TextInput defaultValue="AXUMkit App" />
                </FormField>
                <FormField label="Environment" description="Current deployment environment.">
                  <select className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] focus:border-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#6B7280]">
                    <option value="development">Development</option>
                    <option value="staging">Staging</option>
                    <option value="production">Production</option>
                  </select>
                </FormField>
                <FormField label="Server Port" description="Port the Axum server listens on.">
                  <TextInput type="number" defaultValue="3000" />
                </FormField>
                <FormField label="Host" description="Bind address for the server.">
                  <TextInput defaultValue="0.0.0.0" />
                </FormField>
                <FormField label="Log Level" description="Minimum log level for application logs.">
                  <select className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] focus:border-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#6B7280]">
                    <option value="trace">Trace</option>
                    <option value="debug">Debug</option>
                    <option value="info">Info</option>
                    <option value="warn">Warning</option>
                    <option value="error">Error</option>
                  </select>
                </FormField>
                <div className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                  <div>
                    <p className="text-sm font-medium text-[#374151]">Debug Mode</p>
                    <p className="text-xs text-[#9CA3AF]">Enable verbose logging and stack traces.</p>
                  </div>
                  <ToggleSwitch checked={debugMode} onToggle={() => setDebugMode(!debugMode)} />
                </div>
              </div>
            )}

            {activeTab === "database" && (
              <div className="space-y-6">
                <FormField label="Database URL" description="Connection string for the PostgreSQL database.">
                  <TextInput type="password" defaultValue="postgres://user:pass@localhost:5432/axumkit" />
                </FormField>
                <FormField label="Max Connections" description="Maximum number of connections in the pool.">
                  <TextInput type="number" defaultValue="10" />
                </FormField>
                <FormField label="Min Connections" description="Minimum idle connections to maintain.">
                  <TextInput type="number" defaultValue="2" />
                </FormField>
                <FormField label="Connection Timeout (ms)" description="Timeout for establishing a new connection.">
                  <TextInput type="number" defaultValue="5000" />
                </FormField>
                <FormField label="Idle Timeout (ms)" description="How long a connection can sit idle before being closed.">
                  <TextInput type="number" defaultValue="600000" />
                </FormField>
                <FormField label="Migrations Path" description="Directory containing SQL migration files.">
                  <TextInput defaultValue="./migrations" />
                </FormField>
                <div className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                  <div>
                    <p className="text-sm font-medium text-[#374151]">Auto Migrate</p>
                    <p className="text-xs text-[#9CA3AF]">Automatically run pending migrations on startup.</p>
                  </div>
                  <ToggleSwitch checked={autoMigrate} onToggle={() => setAutoMigrate(!autoMigrate)} />
                </div>
              </div>
            )}

            {activeTab === "auth" && (
              <div className="space-y-6">
                <FormField label="JWT Secret" description="Secret key used to sign JWT tokens.">
                  <TextInput type="password" defaultValue="********************************" />
                </FormField>
                <FormField label="Token Expiry (hours)" description="How long access tokens remain valid.">
                  <TextInput type="number" defaultValue="24" />
                </FormField>
                <FormField label="Refresh Token Expiry (days)" description="How long refresh tokens remain valid.">
                  <TextInput type="number" defaultValue="30" />
                </FormField>
                <FormField label="Issuer" description="JWT issuer claim.">
                  <TextInput defaultValue="axumkit-app" />
                </FormField>
                <div className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                  <div>
                    <p className="text-sm font-medium text-[#374151]">Require Email Verification</p>
                    <p className="text-xs text-[#9CA3AF]">Require users to verify email before accessing the API.</p>
                  </div>
                  <ToggleSwitch checked={emailVerification} onToggle={() => setEmailVerification(!emailVerification)} />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                  <div>
                    <p className="text-sm font-medium text-[#374151]">Rate Limiting</p>
                    <p className="text-xs text-[#9CA3AF]">Rate limit authentication endpoints.</p>
                  </div>
                  <ToggleSwitch checked={rateLimiting} onToggle={() => setRateLimiting(!rateLimiting)} />
                </div>
                <FormField label="Rate Limit (requests/min)" description="Max auth requests per minute per IP.">
                  <TextInput type="number" defaultValue="10" />
                </FormField>
              </div>
            )}

            {activeTab === "redis" && (
              <div className="space-y-6">
                <FormField label="Redis URL" description="Connection string for the Redis instance.">
                  <TextInput defaultValue="redis://localhost:6379" />
                </FormField>
                <FormField label="Database Number" description="Redis database number (0-15).">
                  <TextInput type="number" defaultValue="0" />
                </FormField>
                <FormField label="Key Prefix" description="Prefix applied to all cache keys.">
                  <TextInput defaultValue="axumkit:" />
                </FormField>
                <FormField label="Default TTL (seconds)" description="Default expiration time for cached entries.">
                  <TextInput type="number" defaultValue="3600" />
                </FormField>
                <FormField label="Max Connections" description="Maximum connections in the Redis pool.">
                  <TextInput type="number" defaultValue="10" />
                </FormField>
                <div className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                  <div>
                    <p className="text-sm font-medium text-[#374151]">Enable Caching</p>
                    <p className="text-xs text-[#9CA3AF]">Use Redis for response caching and session storage.</p>
                  </div>
                  <ToggleSwitch checked={enableCaching} onToggle={() => setEnableCaching(!enableCaching)} />
                </div>
              </div>
            )}

            {activeTab === "api" && (
              <div className="space-y-6">
                <FormField label="API Prefix" description="Base path prefix for all API routes.">
                  <TextInput defaultValue="/api/v1" />
                </FormField>
                <FormField label="CORS Origins" description="Allowed origins for CORS requests (comma-separated).">
                  <TextInput defaultValue="http://localhost:3000,http://localhost:5173" />
                </FormField>
                <FormField label="Request Body Limit (MB)" description="Maximum request body size.">
                  <TextInput type="number" defaultValue="10" />
                </FormField>
                <FormField label="Max Page Size" description="Maximum items per page for paginated endpoints.">
                  <TextInput type="number" defaultValue="100" />
                </FormField>
                <div className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                  <div>
                    <p className="text-sm font-medium text-[#374151]">OpenAPI Docs</p>
                    <p className="text-xs text-[#9CA3AF]">Serve OpenAPI documentation at /api/docs.</p>
                  </div>
                  <ToggleSwitch checked={openapiDocs} onToggle={() => setOpenapiDocs(!openapiDocs)} />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                  <div>
                    <p className="text-sm font-medium text-[#374151]">Response Compression</p>
                    <p className="text-xs text-[#9CA3AF]">Enable gzip compression for API responses.</p>
                  </div>
                  <ToggleSwitch checked={compression} onToggle={() => setCompression(!compression)} />
                </div>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between border-t border-[#E5E7EB] pt-6">
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center rounded-lg bg-[#374151] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1F2937] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B7280] focus-visible:ring-offset-2"
              >
                {saved ? (
                  <>
                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Saved
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
              <button
                type="reset"
                className="text-sm text-[#6B7280] transition-colors hover:text-[#374151]"
              >
                Reset to Defaults
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="mt-6 rounded-xl border border-[#DC2626]/20 bg-[#DC2626]/5 p-6">
            <h3 className="text-sm font-semibold text-[#DC2626]">Danger Zone</h3>
            <p className="mt-1 text-sm text-[#6B7280]">
              These actions are irreversible. Please proceed with caution.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" className="rounded-lg border border-[#DC2626]/20 px-4 py-2 text-sm font-medium text-[#DC2626] hover:bg-[#DC2626]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]">
                Clear All Cache
              </button>
              <button type="button" className="rounded-lg border border-[#DC2626]/20 px-4 py-2 text-sm font-medium text-[#DC2626] hover:bg-[#DC2626]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]">
                Reset All Settings
              </button>
              <button type="button" className="rounded-lg bg-[#DC2626] px-4 py-2 text-sm font-medium text-white hover:bg-[#B91C1C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]">
                Delete All Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
