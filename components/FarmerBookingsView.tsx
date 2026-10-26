import React, { useState, useMemo } from 'react';
import { FarmerBooking, Machine, MachineStatus, CHC } from '../types';
import {
  CalendarPlus,
  Search,
  CheckCircle2,
  Clock,
  Tractor,
  Send,
  User,
  MapPin,
  Sparkles,
  Filter,
  Trash2,
} from 'lucide-react';

interface FarmerBookingsViewProps {
  bookings: FarmerBooking[];
  machines: Machine[];
  chcs: CHC[];
  onOpenNewBooking: () => void;
  onUpdateBookingStatus: (bookingId: string, status: FarmerBooking['status'], machineId?: string) => void;
  onSelectMachine: (machine: Machine) => void;
  onDeleteBooking?: (bookingId: string) => void;
}

export const FarmerBookingsView: React.FC<FarmerBookingsViewProps> = ({
  bookings,
  machines,
  chcs,
  onOpenNewBooking,
  onUpdateBookingStatus,
  onSelectMachine,
  onDeleteBooking,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | FarmerBooking['status']>('All');
  const [assigningBookingId, setAssigningBookingId] = useState<string | null>(null);
  const [selectedMachineId, setSelectedMachineId] = useState<string>('');
  const [confirmDeleteBookingId, setConfirmDeleteBookingId] = useState<string | null>(null);

  const chcMap = useMemo(() => new Map(chcs.map(c => [c.id, c])), [chcs]);

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      if (statusFilter !== 'All' && b.status !== statusFilter) return false;
      const chc = chcMap.get(b.assignedChcId);
      const matchesSearch =
        b.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.requiredMachineType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (chc && chc.name.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesSearch;
    });
  }, [bookings, statusFilter, searchTerm, chcMap]);

  // Overall statistics
  const stats = useMemo(() => {
    const total = bookings.length;
    const completed = bookings.filter(b => b.status === 'Completed').length;
    const inProgress = bookings.filter(b => b.status === 'In Progress' || b.status === 'Dispatched').length;
    const pending = bookings.filter(b => b.status === 'Pending').length;
    const totalAcres = bookings.reduce((sum, b) => sum + b.farmSizeAcres, 0);
    const fulfilledRate = total > 0 ? Math.round(((completed + inProgress) / total) * 100) : 0;
    return { total, completed, inProgress, pending, totalAcres, fulfilledRate };
  }, [bookings]);

  const getStatusBadge = (status: FarmerBooking['status']) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Approved':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Dispatched':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'In Progress':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Completed':
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleConfirmDispatch = (booking: FarmerBooking) => {
    if (!selectedMachineId) return;
    onUpdateBookingStatus(booking.id, 'Dispatched', selectedMachineId);
    setAssigningBookingId(null);
    setSelectedMachineId('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Custom Hiring Center (CHC) Equipment Bookings
          </h2>
          <p className="text-xs text-slate-500">
            Farmer demand queue and field machine dispatch pipeline for in-situ residue management
          </p>
        </div>

        <button
          onClick={onOpenNewBooking}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs whitespace-nowrap self-start md:self-auto"
        >
          <CalendarPlus className="h-4 w-4" />
          New Farmer Hire Request
        </button>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Total Booking Requests</p>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {stats.total}
          </p>
          <p className="text-xs text-slate-400 mt-1">{stats.totalAcres} total farm acres</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Pending Review</p>
          <p className="text-2xl font-bold font-mono text-amber-600 mt-1 tabular-nums">
            {stats.pending}
          </p>
          <p className="text-xs text-slate-400 mt-1">Awaiting CHC approval</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Active In Field</p>
          <p className="text-2xl font-bold font-mono text-emerald-600 mt-1 tabular-nums">
            {stats.inProgress}
          </p>
          <p className="text-xs text-slate-400 mt-1">Dispatched or working</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-500 font-medium">Fulfillment Rate</p>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {stats.fulfilledRate}%
          </p>
          <p className="text-xs text-slate-400 mt-1">{stats.completed} cleared successfully</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search farmer, village, or machine..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs overflow-x-auto w-full sm:w-auto">
          {(['All', 'Pending', 'Approved', 'Dispatched', 'In Progress', 'Completed'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table / List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {filteredBookings.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No farmer hiring bookings found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">Farmer & Location</th>
                  <th className="px-4 py-3">Crop & Acres</th>
                  <th className="px-4 py-3">Machine Requested</th>
                  <th className="px-4 py-3">Assigned CHC Hub</th>
                  <th className="px-4 py-3">Urgency</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map(booking => {
                  const chc = chcMap.get(booking.assignedChcId);
                  const assignedMachine = machines.find(m => m.id === booking.assignedMachineId);

                  return (
                    <tr key={booking.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Farmer & Location */}
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-900">{booking.farmerName}</p>
                        <p className="text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          {booking.village}, {booking.district}
                        </p>
                        <p className="text-slate-400 font-mono text-[11px] mt-0.5">{booking.phone}</p>
                      </td>

                      {/* Crop & Acres */}
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-slate-800 font-mono tabular-nums">
                          {booking.farmSizeAcres} Acres
                        </p>
                        <p className="text-slate-500 text-[11px] mt-0.5">{booking.cropType}</p>
                      </td>

                      {/* Machine Requested */}
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-slate-900">{booking.requiredMachineType}</p>
                        {assignedMachine && (
                          <button
                            onClick={() => onSelectMachine(assignedMachine)}
                            className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 mt-0.5 font-medium"
                          >
                            <Tractor className="h-3 w-3" />
                            {assignedMachine.name}
                          </button>
                        )}
                      </td>

                      {/* Assigned CHC */}
                      <td className="px-4 py-3.5">
                        <p className="text-slate-800 font-medium">{chc?.name || 'Central Hub'}</p>
                        <p className="text-slate-500 text-[11px]">{chc?.contactPerson} ({chc?.phone})</p>
                      </td>

                      {/* Urgency */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`font-medium ${
                            booking.urgency.includes('Immediate')
                              ? 'text-rose-600 font-semibold'
                              : 'text-slate-600'
                          }`}
                        >
                          {booking.urgency}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-md border text-xs font-medium ${getStatusBadge(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        {booking.status === 'Pending' && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onUpdateBookingStatus(booking.id, 'Approved')}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-xs transition-colors"
                            >
                              Approve
                            </button>
                          </div>
                        )}

                        {booking.status === 'Approved' && (
                          <div>
                            {assigningBookingId === booking.id ? (
                              <div className="flex items-center gap-1.5 justify-end">
                                <select
                                  value={selectedMachineId}
                                  onChange={e => setSelectedMachineId(e.target.value)}
                                  className="text-xs bg-slate-50 border border-slate-300 rounded p-1 text-slate-800"
                                >
                                  <option value="">Select machine...</option>
                                  {machines
                                    .filter(m => m.status === MachineStatus.Idle)
                                    .map(m => (
                                      <option key={m.id} value={m.id}>
                                        {m.name} ({m.type})
                                      </option>
                                    ))}
                                </select>
                                <button
                                  onClick={() => handleConfirmDispatch(booking)}
                                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setAssigningBookingId(null)}
                                  className="px-1.5 py-1 text-slate-500 hover:text-slate-700 text-xs"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setAssigningBookingId(booking.id)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium text-xs transition-colors"
                              >
                                Dispatch Machine
                              </button>
                            )}
                          </div>
                        )}

                        {booking.status === 'Dispatched' && (
                          <button
                            onClick={() => onUpdateBookingStatus(booking.id, 'In Progress')}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium text-xs transition-colors"
                          >
                            Mark In Field
                          </button>
                        )}

                        {booking.status === 'In Progress' && (
                          <button
                            onClick={() => onUpdateBookingStatus(booking.id, 'Completed')}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded font-medium text-xs transition-colors"
                          >
                            Mark Completed
                          </button>
                        )}

                        {booking.status === 'Completed' && (
                          <span className="text-slate-400 text-xs flex items-center justify-end gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            Fulfilled
                          </span>
                        )}

                        {onDeleteBooking && (
                          <span className="inline-block ml-2 align-middle">
                            {confirmDeleteBookingId === booking.id ? (
                              <span className="inline-flex items-center gap-1 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                <span className="text-[10px] text-rose-700">Delete?</span>
                                <button
                                  onClick={() => {
                                    onDeleteBooking(booking.id);
                                    setConfirmDeleteBookingId(null);
                                  }}
                                  className="px-1.5 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteBookingId(null)}
                                  className="px-1 text-slate-500 text-[10px]"
                                >
                                  No
                                </button>
                              </span>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteBookingId(booking.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                title="Cancel / Remove Booking"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
