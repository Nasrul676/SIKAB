// app/zkteco-test/page.tsx
"use client"; // This is a Client Component to interact with APIs

import React, { useState } from 'react';

interface DeviceInfo {
  serialNumber?: string;
  firmwareVersion?: string;
  // userCount?: number;
  // logCount?: number;
}

interface AttendanceRecord {
  deviceUserId: string; // Or number, depending on your device/library version
  recordTime: string;   // ISO Date string
  status: number;
  // Add other fields as per your device's log structure
}

export default function ZktecoTestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const handleFetchApi = async (action: string) => {
    setIsLoading(true);
    setError(null);
    setActionMessage(null);
    setDeviceInfo(null);
    setAttendanceLogs(null);

    try {
      const response = await fetch(`/api/zkteco/${action}`);
      // Check if the response is OK (status in the range 200-299)
      if (!response.ok) {
        // Try to parse the error response from the server
        let errorData;
        try {
            errorData = await response.json();
        } catch (parseError) {
            // If parsing JSON fails, use the status text
            throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
        }
        // Use the message from the parsed error data, or a default
        throw new Error(errorData.message || `API request failed for action '${action}' with status ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setActionMessage(String(result.message || `Action '${action}' successful.`));
        if (action === 'getInfo' && result.data) {
          setDeviceInfo(result.data);
        } else if (action === 'getAttendance' && result.data) {
          setAttendanceLogs(result.data);
        }
      } else {
        // Ensure setError is always called with a string
        setError(String(result.message || `Action '${action}' failed. Check server logs for details.`));
        console.error("API Error (result.success is false):", result.error || result.message);
      }
    } catch (err: any) {
      console.error(`Fetch error for action '${action}':`, err);
      // Ensure setError is always called with a string
      setError(String(err.message || 'An unknown error occurred while fetching data.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">ZKTeco Device Test</h1>

      <div className="space-y-4 mb-8">
        <button
          onClick={() => handleFetchApi('getInfo')}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? 'Loading Device Info...' : 'Get Device Info'}
        </button>
        <button
          onClick={() => handleFetchApi('getAttendance')}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          {isLoading ? 'Loading Attendance...' : 'Get Attendance Logs'}
        </button>
        {/* Add buttons for other actions here */}
      </div>

      {isLoading && <p className="text-center text-gray-600">Loading data from device, please wait...</p>}
      {error && <p className="text-center text-red-500 bg-red-100 p-3 rounded border border-red-300" role="alert">Error: {error}</p>}
      {actionMessage && !error && <p className="text-center text-green-600 bg-green-100 p-3 rounded border border-green-300" role="status">{actionMessage}</p>}

      {deviceInfo && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">Device Information:</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded overflow-x-auto">
            {JSON.stringify(deviceInfo, null, 2)}
          </pre>
        </div>
      )}

      {attendanceLogs && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">Attendance Logs ({attendanceLogs.length} records):</h2>
          <div className="max-h-96 overflow-y-auto text-sm">
            {attendanceLogs.length > 0 ? (
              <ul className="space-y-1">
                {attendanceLogs.slice(0, 20).map((log, index) => ( // Display first 20 logs for brevity
                  <li key={index} className="p-2 bg-white border rounded shadow-sm">
                    User ID: {log.deviceUserId}, Time: {new Date(log.recordTime).toLocaleString()}, Status: {log.status}
                  </li>
                ))}
                {attendanceLogs.length > 20 && <li>And {attendanceLogs.length - 20} more records...</li>}
              </ul>
            ) : (
              <p>No attendance logs found or returned.</p>
            )}
          </div>
        </div>
      )}
       <p className="mt-8 text-xs text-gray-500 text-center">
        Note: This is a basic example. Ensure your Next.js server can reach the ZKTeco device on its network.
        Fetching all attendance logs can be slow and memory-intensive.
      </p>
    </div>
  );
}

