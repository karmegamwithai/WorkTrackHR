import React, { useState } from 'react';
import { Calendar, Plus, Clock, CheckCircle2, XCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { Employee, LeaveRequest, LeaveType } from '../../types';

interface MyLeavesTabProps {
  employee: Employee;
  leaves: LeaveRequest[];
  setLeaves: React.Dispatch<React.SetStateAction<LeaveRequest[]>>;
  notify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const MyLeavesTab: React.FC<MyLeavesTabProps> = ({
  employee,
  leaves,
  setLeaves,
  notify,
}) => {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>('CASUAL');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');

  const myLeaves = leaves.filter((l) => l.employeeId === employee.id);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      notify('Please enter a brief reason for your leave.', 'error');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      notify('End date cannot be earlier than start date.', 'error');
      return;
    }

    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const newRequest: LeaveRequest = {
      id: `leave-${Date.now()}`,
      employeeId: employee.id,
      leaveType,
      startDate,
      endDate,
      daysCount: diffDays,
      reason: reason.trim(),
      status: 'PENDING',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setLeaves((prev) => [newRequest, ...prev]);
    setIsApplyModalOpen(false);
    setReason('');
    notify(`Leave request for ${diffDays} day(s) submitted for manager review.`);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Leave Requests & Quotas</h2>
          <p className="text-xs text-slate-500">
            Submit time-off requests, monitor manager approvals, and track quota balances
          </p>
        </div>

        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Quota Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs uppercase font-bold text-slate-400">Casual Leave</span>
          <p className="text-3xl font-black text-indigo-600 mt-1 tabular-nums font-mono">
            {employee.leaveBalance?.casual || 0} <span className="text-sm font-semibold">days</span>
          </p>
          <span className="text-[11px] text-slate-500 font-medium">Available casual allocation</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs uppercase font-bold text-slate-400">Sick Leave</span>
          <p className="text-3xl font-black text-emerald-600 mt-1 tabular-nums font-mono">
            {employee.leaveBalance?.sick || 0} <span className="text-sm font-semibold">days</span>
          </p>
          <span className="text-[11px] text-slate-500 font-medium">Health recovery quota</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs uppercase font-bold text-slate-400">Paid Annual Vacation</span>
          <p className="text-3xl font-black text-purple-600 mt-1 tabular-nums font-mono">
            {employee.leaveBalance?.paid || 0} <span className="text-sm font-semibold">days</span>
          </p>
          <span className="text-[11px] text-slate-500 font-medium">Accrued annual vacation</span>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4">My Submitted Requests</h3>

        <div className="space-y-3">
          {myLeaves.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No leave applications submitted yet.
            </div>
          ) : (
            myLeaves.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{req.leaveType} Leave</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        req.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <div className="text-slate-600 font-mono">
                    {req.startDate} to {req.endDate} ({req.daysCount} day{req.daysCount > 1 ? 's' : ''})
                  </div>

                  <p className="text-slate-700 italic">"{req.reason}"</p>

                  {req.reviewRemarks && (
                    <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-1.5">
                      <MessageSquare className="w-3 h-3 text-slate-400" />
                      <span>
                        Manager Remarks: <strong className="text-slate-800">{req.reviewRemarks}</strong>
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-slate-400 text-[11px] font-medium shrink-0">
                  Applied on {req.createdAt}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Apply Leave Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">Apply for Time Off</h3>
            <p className="text-xs text-slate-500 mb-4">
              Submit your request to HR and your shift supervisor
            </p>

            <form onSubmit={handleApply} className="space-y-4 text-xs">
              <div>
                <label className="block uppercase font-bold text-slate-600 mb-1">Leave Category</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                >
                  <option value="CASUAL">Casual Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="PAID">Annual Paid Vacation</option>
                  <option value="UNPAID">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase font-bold text-slate-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block uppercase font-bold text-slate-600 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase font-bold text-slate-600 mb-1">Reason / Notes</label>
                <textarea
                  required
                  rows={3}
                  placeholder="State the purpose of your leave request..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
