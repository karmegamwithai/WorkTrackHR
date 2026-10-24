import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  Search,
  Filter,
  User,
  AlertCircle,
} from 'lucide-react';
import {
  AttendanceRecord,
  Department,
  Employee,
  LeaveRequest,
  LeaveStatus,
} from '../../types';

interface LeaveRequestsTabProps {
  leaves: LeaveRequest[];
  setLeaves: React.Dispatch<React.SetStateAction<LeaveRequest[]>>;
  employees: Employee[];
  departments: Department[];
  attendance: AttendanceRecord[];
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  notify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const LeaveRequestsTab: React.FC<LeaveRequestsTabProps> = ({
  leaves,
  setLeaves,
  employees,
  departments,
  attendance,
  setAttendance,
  notify,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [reviewModalLeave, setReviewModalLeave] = useState<LeaveRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [reviewRemarks, setReviewRemarks] = useState('');

  const filteredLeaves = leaves.filter((l) => {
    if (statusFilter === 'ALL') return true;
    return l.status === statusFilter;
  });

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalLeave) return;

    const emp = employees.find((e) => e.id === reviewModalLeave.employeeId);

    // Update leave request status
    setLeaves((prev) =>
      prev.map((l) =>
        l.id === reviewModalLeave.id
          ? {
              ...l,
              status: reviewAction,
              reviewedBy: 'admin@worktrack.io (HR Admin)',
              reviewRemarks: reviewRemarks.trim(),
            }
          : l
      )
    );

    // If Approved, reflect automatically in Attendance records across requested date span!
    if (reviewAction === 'APPROVED') {
      const start = new Date(reviewModalLeave.startDate);
      const end = new Date(reviewModalLeave.endDate);
      const newAttendanceRecords: AttendanceRecord[] = [];

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        // Check if attendance record already exists for this date
        const existing = attendance.find(
          (a) => a.employeeId === reviewModalLeave.employeeId && a.attendanceDate === dateStr
        );

        if (existing) {
          setAttendance((prev) =>
            prev.map((a) =>
              a.id === existing.id
                ? { ...a, status: 'ON_LEAVE', checkIn: null, checkOut: null, workingMinutes: 0 }
                : a
            )
          );
        } else {
          newAttendanceRecords.push({
            id: `att-leave-${Date.now()}-${dateStr}`,
            employeeId: reviewModalLeave.employeeId,
            shiftId: emp?.assignedShiftId || 'shift-gen',
            attendanceDate: dateStr,
            checkIn: null,
            checkOut: null,
            workingMinutes: 0,
            lateMinutes: 0,
            overtimeMinutes: 0,
            status: 'ON_LEAVE',
            notes: `Approved ${reviewModalLeave.leaveType} leave`,
          });
        }
      }

      if (newAttendanceRecords.length > 0) {
        setAttendance((prev) => [...prev, ...newAttendanceRecords]);
      }
    }

    notify(
      `Leave request ${reviewAction.toLowerCase()} for ${emp?.fullName || 'employee'}.${
        reviewAction === 'APPROVED' ? ' Attendance records marked as ON_LEAVE.' : ''
      }`
    );

    setReviewModalLeave(null);
    setReviewRemarks('');
  };

  const pendingCount = leaves.filter((l) => l.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Leave Management</h2>
          <p className="text-xs text-slate-500">
            Review time-off requests, allocate leave entitlements, and automate attendance schedule sync
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition ${
              statusFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Requests ({leaves.length})
          </button>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1.5 rounded-lg transition ${
              statusFilter === 'PENDING'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending Review ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('APPROVED')}
            className={`px-3 py-1.5 rounded-lg transition ${
              statusFilter === 'APPROVED'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setStatusFilter('REJECTED')}
            className={`px-3 py-1.5 rounded-lg transition ${
              statusFilter === 'REJECTED'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Leaves Card List */}
      <div className="space-y-3.5">
        {filteredLeaves.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/80 text-slate-400 text-xs">
            No leave requests in this category.
          </div>
        ) : (
          filteredLeaves.map((req) => {
            const emp = employees.find((e) => e.id === req.employeeId);
            const dept = departments.find((d) => d.id === emp?.departmentId);

            return (
              <div
                key={req.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:border-slate-300"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-bold text-slate-900 text-sm">{emp?.fullName}</span>
                    <span className="text-slate-400 font-mono text-xs">{emp?.employeeCode}</span>
                    <span className="text-slate-500 text-xs">· {dept?.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                        req.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : req.status === 'REJECTED'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      {req.startDate} to {req.endDate} ({req.daysCount} day{req.daysCount > 1 ? 's' : ''})
                    </span>
                    <span>
                      Type: <strong className="text-slate-800">{req.leaveType}</strong>
                    </span>
                    <span className="text-slate-400 text-[11px]">Applied on {req.createdAt}</span>
                  </div>

                  <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                    "{req.reason}"
                  </p>

                  {req.reviewRemarks && (
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-0.5">
                      <MessageSquare className="w-3 h-3 text-slate-400" />
                      <span>
                        HR Note: <strong className="text-slate-700">{req.reviewRemarks}</strong>
                      </span>
                    </div>
                  )}
                </div>

                {req.status === 'PENDING' ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setReviewModalLeave(req);
                        setReviewAction('APPROVED');
                        setReviewRemarks('Approved under standard annual policy.');
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => {
                        setReviewModalLeave(req);
                        setReviewAction('REJECTED');
                        setReviewRemarks('Shift staffing quota already filled for these dates.');
                      }}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition border border-rose-200/80 flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-right shrink-0 text-xs text-slate-400 font-medium">
                    Reviewed by {req.reviewedBy?.split(' ')[0]}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Review Confirmation Modal */}
      {reviewModalLeave && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {reviewAction === 'APPROVED' ? 'Approve Time Off' : 'Decline Time Off'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {reviewAction === 'APPROVED'
                ? 'This will approve the leave and automatically record ON_LEAVE status on the attendance calendar.'
                : 'Provide feedback to the employee explaining why this request cannot be approved.'}
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block uppercase font-bold text-slate-600 mb-1">
                  Manager Feedback / Remarks
                </label>
                <textarea
                  required
                  rows={3}
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReviewModalLeave(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white font-bold rounded-xl transition shadow-xs ${
                    reviewAction === 'APPROVED'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Confirm {reviewAction === 'APPROVED' ? 'Approval' : 'Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
