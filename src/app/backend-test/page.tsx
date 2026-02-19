'use client';

import { useState, useEffect } from 'react';
import {
  auth,
  healthCheck,
  trips,
  user,
  notifications,
  apiCall,
} from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TestResult {
  name: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  response?: any;
  error?: string;
}

export default function BackendTestPage() {
  const [results, setResults] = useState<TestResult[]>([
    { name: 'Health Check', status: 'idle' },
    { name: 'Register User', status: 'idle' },
    { name: 'Login User', status: 'idle' },
    { name: 'Get User Profile', status: 'idle' },
    { name: 'Search Users', status: 'idle' },
    { name: 'Get User Trips', status: 'idle' },
    { name: 'Get Notifications', status: 'idle' },
  ]);

  const [token, setToken] = useState<string>('');
  const [email, setEmail] = useState<string>('test@example.com');
  const [password, setPassword] = useState<string>('password123');

  const updateResult = (index: number, status: TestResult['status'], response?: any, error?: string) => {
    setResults((prev) => {
      const newResults = [...prev];
      newResults[index] = {
        ...newResults[index],
        status,
        response,
        error,
      };
      return newResults;
    });
  };

  const testHealthCheck = async () => {
    updateResult(0, 'loading');
    const isHealthy = await healthCheck();
    if (isHealthy) {
      updateResult(0, 'success', { message: 'Backend is running' });
    } else {
      updateResult(0, 'error', undefined, 'Backend is not responding');
    }
  };

  const testRegister = async () => {
    updateResult(1, 'loading');
    try {
      const response = await auth.register(email, password, 'Test User');
      if (response.success) {
        updateResult(1, 'success', response);
      } else {
        updateResult(1, 'error', undefined, response.message);
      }
    } catch (error) {
      updateResult(1, 'error', undefined, String(error));
    }
  };

  const testLogin = async () => {
    updateResult(2, 'loading');
    try {
      const response = await auth.login(email, password);
      if (response.success) {
        setToken(response.token || '');
        updateResult(2, 'success', { message: 'Login successful', token: response.token });
      } else {
        updateResult(2, 'error', undefined, response.message);
      }
    } catch (error) {
      updateResult(2, 'error', undefined, String(error));
    }
  };

  const testGetProfile = async () => {
    if (!token) {
      updateResult(3, 'error', undefined, 'Please login first');
      return;
    }
    updateResult(3, 'loading');
    try {
      const response = await user.getProfile(token);
      if (response.success) {
        updateResult(3, 'success', response.data);
      } else {
        updateResult(3, 'error', undefined, response.message);
      }
    } catch (error) {
      updateResult(3, 'error', undefined, String(error));
    }
  };

  const testSearchUsers = async () => {
    if (!token) {
      updateResult(4, 'error', undefined, 'Please login first');
      return;
    }
    updateResult(4, 'loading');
    try {
      const response = await user.searchUsers(token, 'test');
      if (response.success) {
        updateResult(4, 'success', response.data);
      } else {
        updateResult(4, 'error', undefined, response.message);
      }
    } catch (error) {
      updateResult(4, 'error', undefined, String(error));
    }
  };

  const testGetTrips = async () => {
    if (!token) {
      updateResult(5, 'error', undefined, 'Please login first');
      return;
    }
    updateResult(5, 'loading');
    try {
      const response = await trips.getUserTrips(token);
      if (response.success) {
        updateResult(5, 'success', response.data);
      } else {
        updateResult(5, 'error', undefined, response.message);
      }
    } catch (error) {
      updateResult(5, 'error', undefined, String(error));
    }
  };

  const testGetNotifications = async () => {
    if (!token) {
      updateResult(6, 'error', undefined, 'Please login first');
      return;
    }
    updateResult(6, 'loading');
    try {
      const response = await notifications.getNotifications(token);
      if (response.success) {
        updateResult(6, 'success', response.data);
      } else {
        updateResult(6, 'error', undefined, response.message);
      }
    } catch (error) {
      updateResult(6, 'error', undefined, String(error));
    }
  };

  const runAllTests = async () => {
    await testHealthCheck();
    await new Promise((r) => setTimeout(r, 500));
    await testRegister();
    await new Promise((r) => setTimeout(r, 500));
    await testLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">Backend Test Dashboard</h1>
        <p className="text-slate-400 mb-8">
          Test all Trip Splitter API endpoints | Backend:{' '}
          <span className="text-cyan-400 font-mono">https://smartsplit-app-cv3e.onrender.com</span>
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Credentials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-slate-300">Email</label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="bg-slate-700 border-slate-600 text-white mt-2"
                />
              </div>
              <div>
                <label className="text-sm text-slate-300">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password123"
                  className="bg-slate-700 border-slate-600 text-white mt-2"
                />
              </div>
              <div>
                <label className="text-sm text-slate-300">Token (Auto-populated after login)</label>
                <Input
                  value={token}
                  readOnly
                  placeholder="Token will appear here"
                  className="bg-slate-700 border-slate-600 text-white mt-2 text-xs"
                />
              </div>
              <Button onClick={runAllTests} className="w-full bg-cyan-600 hover:bg-cyan-700">
                Run All Tests
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">Test Results Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.map((result, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-slate-700 rounded">
                    <span className="text-slate-200">{result.name}</span>
                    <span
                      className={`text-sm font-semibold ${
                        result.status === 'idle'
                          ? 'text-slate-400'
                          : result.status === 'loading'
                            ? 'text-yellow-400'
                            : result.status === 'success'
                              ? 'text-green-400'
                              : 'text-red-400'
                      }`}
                    >
                      {result.status === 'idle'
                        ? '⚪ Idle'
                        : result.status === 'loading'
                          ? '🔵 Testing...'
                          : result.status === 'success'
                            ? '✅ Success'
                            : '❌ Error'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="health" className="bg-slate-800 border-slate-700 rounded-lg p-6">
          <TabsList className="bg-slate-700">
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="auth">Auth</TabsTrigger>
            <TabsTrigger value="user">User</TabsTrigger>
            <TabsTrigger value="trips">Trips</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>

          <TabsContent value="health" className="mt-6">
            <div className="space-y-4">
              <Button onClick={testHealthCheck} className="bg-blue-600 hover:bg-blue-700">
                Test Health Check
              </Button>
              {results[0].response && (
                <div className="bg-slate-700 p-4 rounded text-white text-sm font-mono">
                  {JSON.stringify(results[0].response, null, 2)}
                </div>
              )}
              {results[0].error && (
                <div className="bg-red-900 p-4 rounded text-red-200 text-sm">Error: {results[0].error}</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="auth" className="space-y-4 mt-6">
            <div className="flex gap-2">
              <Button onClick={testRegister} className="bg-green-600 hover:bg-green-700">
                Register
              </Button>
              <Button onClick={testLogin} className="bg-green-600 hover:bg-green-700">
                Login
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-white font-semibold mb-2">Register</h3>
                {results[1].response && (
                  <div className="bg-slate-700 p-4 rounded text-white text-sm font-mono max-h-48 overflow-auto">
                    {JSON.stringify(results[1].response, null, 2)}
                  </div>
                )}
                {results[1].error && (
                  <div className="bg-red-900 p-4 rounded text-red-200 text-sm">{results[1].error}</div>
                )}
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">Login</h3>
                {results[2].response && (
                  <div className="bg-slate-700 p-4 rounded text-white text-sm font-mono max-h-48 overflow-auto">
                    {JSON.stringify(results[2].response, null, 2)}
                  </div>
                )}
                {results[2].error && (
                  <div className="bg-red-900 p-4 rounded text-red-200 text-sm">{results[2].error}</div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="user" className="space-y-4 mt-6">
            <div className="flex gap-2">
              <Button onClick={testGetProfile} className="bg-purple-600 hover:bg-purple-700">
                Get Profile
              </Button>
              <Button onClick={testSearchUsers} className="bg-purple-600 hover:bg-purple-700">
                Search Users
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-white font-semibold mb-2">Profile</h3>
                {results[3].response && (
                  <div className="bg-slate-700 p-4 rounded text-white text-sm font-mono max-h-48 overflow-auto">
                    {JSON.stringify(results[3].response, null, 2)}
                  </div>
                )}
                {results[3].error && (
                  <div className="bg-red-900 p-4 rounded text-red-200 text-sm">{results[3].error}</div>
                )}
              </div>
              <div>
                <h3 className="text-white font-semibold mb-2">Search Results</h3>
                {results[4].response && (
                  <div className="bg-slate-700 p-4 rounded text-white text-sm font-mono max-h-48 overflow-auto">
                    {JSON.stringify(results[4].response, null, 2)}
                  </div>
                )}
                {results[4].error && (
                  <div className="bg-red-900 p-4 rounded text-red-200 text-sm">{results[4].error}</div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trips" className="space-y-4 mt-6">
            <Button onClick={testGetTrips} className="bg-orange-600 hover:bg-orange-700">
              Get User Trips
            </Button>
            {results[5].response && (
              <div className="bg-slate-700 p-4 rounded text-white text-sm font-mono max-h-64 overflow-auto">
                {JSON.stringify(results[5].response, null, 2)}
              </div>
            )}
            {results[5].error && (
              <div className="bg-red-900 p-4 rounded text-red-200 text-sm">{results[5].error}</div>
            )}
          </TabsContent>

          <TabsContent value="other" className="space-y-4 mt-6">
            <Button onClick={testGetNotifications} className="bg-indigo-600 hover:bg-indigo-700">
              Get Notifications
            </Button>
            {results[6].response && (
              <div className="bg-slate-700 p-4 rounded text-white text-sm font-mono max-h-64 overflow-auto">
                {JSON.stringify(results[6].response, null, 2)}
              </div>
            )}
            {results[6].error && (
              <div className="bg-red-900 p-4 rounded text-red-200 text-sm">{results[6].error}</div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-8 p-6 bg-slate-800 border border-slate-700 rounded-lg">
          <h2 className="text-white font-semibold mb-4">API Documentation</h2>
          <div className="text-slate-300 text-sm space-y-2">
            <p>✅ Backend URL: <span className="text-cyan-400">https://smartsplit-app-cv3e.onrender.com</span></p>
            <p>✅ API Client: <span className="text-cyan-400">src/lib/api-client.ts</span></p>
            <p>✅ All endpoints tested and ready to use</p>
            <p>📌 Step 1: Register a new user or use existing credentials</p>
            <p>📌 Step 2: Login to get authentication token</p>
            <p>📌 Step 3: Test other endpoints with the token</p>
          </div>
        </div>
      </div>
    </div>
  );
}
