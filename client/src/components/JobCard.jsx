import React from 'react';
import { Zap, CheckCircle, Clock, XCircle } from 'lucide-react';

const JobCard = ({ job }) => {
  const getStatusIcon = () => {
    switch (job.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const progress = (job.completedChunks / job.totalChunks) * 100;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          <h3 className="font-semibold">{job.type.toUpperCase()}</h3>
        </div>
        {getStatusIcon()}
      </div>
      
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-gray-600">Job ID:</span>
          <span className="ml-2 font-mono text-xs">{job.jobId.slice(0, 8)}...</span>
        </div>
        
        <div>
          <span className="text-gray-600">Progress:</span>
          <span className="ml-2 font-medium">{job.completedChunks}/{job.totalChunks} chunks</span>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        <div>
          <span className="text-gray-600">Created:</span>
          <span className="ml-2">{new Date(job.createdAt).toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

export default JobCard;