'use client';

import { Briefcase, Plus } from 'lucide-react';
import Link from 'next/link';

export default function AgencyJobsPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">My Jobs</h1>
          <p className="text-gray-500">Manage the jobs you've posted on TradeMatch.</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors">
          <Plus size={20} />
          Post New Job
        </button>
      </div>

      <div className="bg-white rounded-2xl p-16 border border-gray-200 text-center shadow-sm">
        <Briefcase size={48} className="text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No active jobs</h3>
        <p className="text-gray-500 max-w-md mx-auto mb-6">You haven't posted any jobs yet. Post a job to start receiving applications from verified workers.</p>
        <button className="px-6 py-3 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100 transition-colors inline-flex items-center gap-2">
          <Plus size={18} />
          Create First Job
        </button>
      </div>
    </div>
  );
}
