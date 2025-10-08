import React from 'react';
import { Cpu, Activity, CheckCircle, XCircle } from 'lucide-react';

const DeviceCard = ({ device }) => {
  const isOnline = device.status === 'online';
  
  return (
    <div className="bg-white rounded-lg shadow p-4 border-l-4" 
         style={{ borderLeftColor: isOnline ? '#10b981' : '#ef4444' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5" />
          <h3 className="font-semibold">{device.name}</h3>
        </div>
        {isOnline ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <XCircle className="w-5 h-5 text-red-500" />
        )}
      </div>
      
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-gray-600">Status:</span>
          <span className={`ml-2 font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
            {device.status}
          </span>
        </div>
        
        <div>
          <span className="text-gray-600">Load:</span>
          <span className="ml-2 font-medium">{device.currentLoad}%</span>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${device.currentLoad}%` }}
            />
          </div>
        </div>
        
        <div>
          <span className="text-gray-600">Tasks Completed:</span>
          <span className="ml-2 font-medium">{device.tasksCompleted}</span>
        </div>
      </div>
    </div>
  );
};

export default DeviceCard;