'use client';
import React, { useState } from 'react';

export default function SettingsPage() {
  // state untuk form settings
  const [settings, setSettings] = useState({
    apiKey: '123-ABC-XYZ',
    notificationEmail: 'admin@example.com',
    maxDevices: 50,
    alertThreshold: 220,
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // simpan ke server
    alert('Settings saved: ' + JSON.stringify(settings, null, 2));
  }

  return (
    <div
      className="flex flex-col rounded-2xl p-8 mx-auto mr-8"
      style={{
        background:
          "linear-gradient(90deg, rgba(6,11,40,0.74) 0%, rgba(10,14,35,0.71) 100%)",
      }}
    >
      <h2 className="text-2xl font-semibold mb-4">System Settings</h2>
      <p className="mb-6 text-slate-300">
        Konfigurasi global sistem. Ubah API Key, email notifikasi, dan batas device.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
        <div>
          <label className="block text-sm mb-1">API Key</label>
          <input
            type="text"
            name="apiKey"
            value={settings.apiKey}
            onChange={handleChange}
            className="w-full p-2 rounded bg-slate-800 border border-slate-600"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Notification Email</label>
          <input
            type="email"
            name="notificationEmail"
            value={settings.notificationEmail}
            onChange={handleChange}
            className="w-full p-2 rounded bg-slate-800 border border-slate-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Max Devices per User</label>
            <input
              type="number"
              name="maxDevices"
              value={settings.maxDevices}
              onChange={handleChange}
              className="w-full p-2 rounded bg-slate-800 border border-slate-600"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700"
        >
          Save Settings
        </button>
      </form>
    </div>
  );
}
