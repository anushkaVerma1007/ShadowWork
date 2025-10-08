import React, { useState, useEffect } from 'react';
import { Activity, Upload } from 'lucide-react';
import DeviceCard from '../components/DeviceCard';
import JobCard from '../components/JobCard';
import { getDevices, getJobs, submitJob } from '../services/api';
import socket from '../utils/socket';

const Dashboard = () => {
  const [devices, setDevices] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [taskType, setTaskType] = useState('compress');
  const [inputData, setInputData] = useState('');
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    loadData();

    socket.on('device-update', (data) => {
      if (data.devices) setDevices(data.devices);
    });

    socket.on('new-job', () => {
      loadJobs();
    });

    socket.on('job-completed', (data) => {
      addLog(`Job ${data.jobId} completed!`, 'success');
      loadJobs();
    });

    socket.on('chunk-completed', () => {
      loadJobs();
    });

    return () => {
      socket.off('device-update');
      socket.off('new-job');
      socket.off('job-completed');
      socket.off('chunk-completed');
    };
  }, []);

  const loadData = async () => {
    await loadDevices();
    await loadJobs();
  };

  const loadDevices = async () => {
    try {
      const response = await getDevices();
      setDevices(response.data.devices);
    } catch (error) {
      console.error('Error loading devices:', error);
    }
  };

  const loadJobs = async () => {
    try {
      const response = await getJobs();
      setJobs(response.data.jobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const handleSubmitJob = async () => {
    if (!inputData.trim()) {
      addLog('Please enter input data', 'error');
      return;
    }

    try {
      const response = await submitJob({
        type: taskType,
        inputData,
        chunkCount: Math.ceil(inputData.length / 50),
      });
      
      addLog(`Job ${response.data.job.jobId} submitted!`, 'success');
      setInputData('');
      loadJobs();
    } catch (error) {
      addLog('Error submitting job', 'error');
      console.error(error);
    }
  };

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [{ timestamp, message, type }, ...prev].slice(0, 20));
  };

  const onlineDevices = devices.filter(d => d.status === 'online').length;
  const activeJobs = jobs.filter(j => j.status === 'processing').length;
  const completedJobs = jobs.filter(j => j.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
            <Activity className="w-10 h-10" />
            ShadowWork
          </h1>
          <p className="text-gray-600 mt-2">Distributed Computing Platform</p>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm">Online Devices</h3>
            <p className="text-3xl font-bold text-green-600">{onlineDevices}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm">Active Jobs</h3>
            <p className="text-3xl font-bold text-blue-600">{activeJobs}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm">Completed Jobs</h3>
            <p className="text-3xl font-bold text-purple-600">{completedJobs}</p>
          </div>
        </div>

        {/* Job Submission */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Submit New Job
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Type
              </label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="compress">Compress Data</option>
                <option value="hash">Hash Computation</option>
                <option value="filter">Data Filtering</option>
                <option value="transform">Transform Data</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Input Data
              </label>
              <textarea
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                placeholder="Enter data to process..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="4"
              />
            </div>
            
            <button
              onClick={handleSubmitJob}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Submit Job
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Devices */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Connected Devices</h2>
            <div className="space-y-4">
              {devices.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No devices connected</p>
              ) : (
                devices.map(device => (
                  <DeviceCard key={device.deviceId} device={device} />
                ))
              )}
            </div>
          </div>

          {/* Jobs */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Recent Jobs</h2>
            <div className="space-y-4">
              {jobs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No jobs yet</p>
              ) : (
                jobs.slice(0, 10).map(job => (
                  <JobCard key={job.jobId} job={job} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Activity Logs</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet...</p>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className={`mb-1 ${
                  log.type === 'error' ? 'text-red-400' : 
                  log.type === 'success' ? 'text-green-400' : 
                  'text-gray-400'
                }`}>
                  [{log.timestamp}] {log.message}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;