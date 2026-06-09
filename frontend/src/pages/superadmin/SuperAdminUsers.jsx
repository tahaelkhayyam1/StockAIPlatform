import React, { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../../auth/auth";
import CreateUserModal from "../../components/CreateUserModal";
import UserDetailsModal from "../../components/UserDetailsModal";
import EditUserModal from "../../components/EditUserModal";

export default function SuperAdminUsers() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [viewMode, setViewMode] = useState("ACTIVE"); // ACTIVE or ARCHIVED
  
  const [selectedIds, setSelectedIds] = useState([]);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);

  const [editUser, setEditUser] = useState(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  const [confirmModal, setConfirmModal] = useState(null);
  const [toast, setToast] = useState(null);

  const token = getToken();
  const headers = { Authorization: `Bearer ${token}` };

  const loadUsers = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/admin/users/search", {
        headers,
        params: {
          search: search || undefined,
          role: roleFilter || undefined,
          archived: viewMode === "ARCHIVED",
          page: page,
          size: 10
        }
      });
      setUsers(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (e) {
      console.error("Failed to load users", e);
    }
  };

  useEffect(() => {
    loadUsers();
    setSelectedIds([]); // reset selection on filter change
  }, [page, search, roleFilter, viewMode]);

  const showToast = (message, isError = false) => {
      setToast({ message, isError });
      setTimeout(() => setToast(null), 4000);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(users.map(u => u.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    await axios.post("http://localhost:8080/api/admin/users/bulk-approve", selectedIds, { headers });
    setSelectedIds([]);
    loadUsers();
    showToast("Selected users approved successfully.");
  };

  const handleBulkDisable = async () => {
    if (selectedIds.length === 0) return;
    await axios.post("http://localhost:8080/api/admin/users/bulk-disable", selectedIds, { headers });
    setSelectedIds([]);
    loadUsers();
    showToast("Selected users disabled successfully.");
  };

  const confirmDelete = (id) => {
      setConfirmModal({
          id,
          action: 'delete',
          title: 'Delete Permanently?',
          message: 'Are you sure you want to permanently delete this user? This action cannot be undone.',
          isDestructive: true
      });
  };

  const confirmResetPassword = (id) => {
      setConfirmModal({
          id,
          action: 'reset_password',
          title: 'Reset Password?',
          message: 'Are you sure you want to reset this user\'s password? A temporary password will be generated.',
          isDestructive: false
      });
  };

  const executeConfirmAction = async () => {
      if (!confirmModal) return;
      const { id, action } = confirmModal;
      setConfirmModal(null);

      try {
          if (action === 'delete') {
              await axios.delete(`http://localhost:8080/api/admin/users/${id}`, { headers });
              showToast("User deleted permanently.");
          } else if (action === 'reset_password') {
              const res = await axios.post(`http://localhost:8080/api/admin/users/${id}/reset-password`, {}, { headers });
              // Display temporary password in a special sticky toast
              setToast({ message: `Password reset successfully! Temporary Password: ${res.data}`, isError: false, duration: 10000 });
              setTimeout(() => setToast(null), 10000);
              return; // skip the default toast timeout
          }
          loadUsers();
      } catch (e) {
          showToast(`Failed to ${action.replace('_', ' ')}.`, true);
      }
  };

  const changeRole = async (id, role) => {
    await axios.post(`http://localhost:8080/api/admin/users/${id}/role`, { role }, { headers });
    loadUsers();
    showToast("User role updated successfully.");
  };

  const handleCreateUser = async (formData) => {
    try {
      let profilePictureUrl = null;
      if (formData.profilePictureFile) {
          const uploadData = new FormData();
          uploadData.append("file", formData.profilePictureFile);
          const uploadRes = await axios.post("http://localhost:8080/api/images/upload", uploadData, {
              headers: { 'Content-Type': 'multipart/form-data', ...headers }
          });
          profilePictureUrl = uploadRes.data.url;
      }

      const payload = { ...formData, profilePicture: profilePictureUrl };
      delete payload.profilePictureFile; // remove the file object before sending JSON

      await axios.post("http://localhost:8080/api/admin/users", payload, { headers });
      setCreateModalOpen(false);
      showToast("User provisioned successfully.");
      loadUsers();
    } catch (err) {
      if (err.response && err.response.data) {
        showToast(err.response.data, true);
      } else {
        showToast("Failed to create user.", true);
      }
    }
  };

  const handleEditSubmit = async (id, formData) => {
    try {
      await axios.put(`http://localhost:8080/api/admin/users/${id}`, formData, { headers });
      if (formData.role && (!editUser || editUser.role !== formData.role)) {
          await axios.post(`http://localhost:8080/api/admin/users/${id}/role`, { role: formData.role }, { headers });
      }
      setEditModalOpen(false);
      showToast("User updated successfully.");
      loadUsers();
    } catch (err) {
      showToast("Failed to update user.", true);
    }
  };

  const openEdit = (u) => {
    setEditUser(u);
    setEditModalOpen(true);
  };

  const handleExport = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/admin/users/export", {
        headers,
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "users_export.csv");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      showToast("Export completed.");
    } catch (err) {
      showToast("Failed to export users.", true);
    }
  };

  const openDetails = async (id) => {
    try {
      const res = await axios.get(`http://localhost:8080/api/admin/users/${id}`, { headers });
      setSelectedUser(res.data);
      setDetailsModalOpen(true);
    } catch (e) {
      showToast("Failed to load user details.", true);
    }
  };

  const toggleArchive = async (id) => {
      try {
          if (viewMode === "ACTIVE") {
              await axios.post(`http://localhost:8080/api/admin/users/${id}/archive`, {}, { headers });
              showToast("User archived.");
          } else {
              await axios.post(`http://localhost:8080/api/admin/users/${id}/unarchive`, {}, { headers });
              showToast("User unarchived.");
          }
          loadUsers();
      } catch(e) {
          showToast("Failed to change archive status.", true);
      }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 relative">
      {/* Toast Notification */}
      {toast && (
          <div className="fixed top-4 right-4 z-[60] animate-in slide-in-from-top-2 fade-in duration-200">
              <div className={`px-6 py-3 rounded-xl shadow-lg border flex items-center gap-3 ${toast.isError ? 'bg-red-50 border-red-100 text-red-800' : 'bg-green-50 border-green-100 text-green-800'}`}>
                  {toast.isError ? (
                      <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  ) : (
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  )}
                  <span className="font-semibold text-sm whitespace-pre-wrap">{toast.message}</span>
              </div>
          </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        <div className="flex space-x-3">
            <button 
                onClick={handleExport}
                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md shadow-sm font-medium transition-colors flex items-center"
            >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                Export CSV
            </button>
            <button 
                onClick={() => setCreateModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm font-medium transition-colors"
            >
                + Provision User
            </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Tab Selection */}
        <div className="flex border-b border-gray-200">
            <button 
                onClick={() => { setViewMode("ACTIVE"); setPage(0); }}
                className={`px-6 py-3 text-sm font-medium transition-colors ${viewMode === "ACTIVE" ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-gray-50 text-gray-500 hover:text-gray-700'}`}
            >
                Active Users
            </button>
            <button 
                onClick={() => { setViewMode("ARCHIVED"); setPage(0); }}
                className={`px-6 py-3 text-sm font-medium transition-colors ${viewMode === "ARCHIVED" ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-gray-50 text-gray-500 hover:text-gray-700'}`}
            >
                Archived Users
            </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-4 w-full sm:w-auto">
            <input 
              type="text" 
              placeholder="Search email or username..." 
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select 
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="WORKSHOP">Workshop</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="SUPPLIER">Supplier</option>
            </select>
          </div>

          {selectedIds.length > 0 && viewMode === "ACTIVE" && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">{selectedIds.length} selected</span>
              <button onClick={handleBulkApprove} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm transition-colors">Approve Selected</button>
              <button onClick={handleBulkDisable} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm transition-colors">Disable Selected</button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                <th className="p-3 w-10">
                  <input type="checkbox" onChange={handleSelectAll} checked={users.length > 0 && selectedIds.length === users.length} className="rounded text-blue-600 focus:ring-blue-500" />
                </th>
                <th className="p-3 font-medium">Username</th>
                <th className="p-3 font-medium">Email</th>
                <th className="p-3 font-medium">Role</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3">
                    <input type="checkbox" checked={selectedIds.includes(u.id)} onChange={() => handleSelect(u.id)} className="rounded text-blue-600 focus:ring-blue-500" />
                  </td>
                  <td className="p-3 text-sm text-gray-900 font-medium">{u.username}</td>
                  <td className="p-3 text-sm text-gray-500">{u.email}</td>
                  <td className="p-3 text-sm">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-sm">
                     <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        u.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        u.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                    }`}>
                      {u.status}
                    </span>
                    {!u.active && u.status === 'ACTIVE' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 ml-2">Disabled</span>
                    )}
                  </td>
                  <td className="p-3 text-sm text-right">
                    <div className="relative inline-block text-left dropdown-container">
                      <button 
                        onClick={() => setActiveDropdown(activeDropdown === u.id ? null : u.id)} 
                        className="text-gray-400 hover:text-gray-600 focus:outline-none p-1 rounded-md hover:bg-gray-100"
                      >
                         <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/></svg>
                      </button>
                      
                      {activeDropdown === u.id && (
                         <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-40 divide-y divide-gray-100">
                            <div className="py-1">
                                <button onClick={() => { openDetails(u.id); setActiveDropdown(null); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">View Details</button>
                                <button onClick={() => { openEdit(u); setActiveDropdown(null); }} className="block w-full text-left px-4 py-2 text-sm text-indigo-600 hover:bg-gray-100">Edit User</button>
                            </div>
                            <div className="py-1">
                                {u.status !== 'ACTIVE' && (
                                    <button onClick={async () => { await axios.post(`http://localhost:8080/api/admin/users/${u.id}/approve`, {}, { headers }); loadUsers(); showToast("User approved."); setActiveDropdown(null); }} className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-100">Approve Account</button>
                                )}
                                <button onClick={async () => { await axios.post(`http://localhost:8080/api/admin/users/${u.id}/${u.active ? 'disable' : 'enable'}`, {}, { headers }); loadUsers(); showToast(`User ${u.active ? 'disabled' : 'enabled'}.`); setActiveDropdown(null); }} className={`block w-full text-left px-4 py-2 text-sm ${u.active ? 'text-orange-600' : 'text-emerald-600'} hover:bg-gray-100`}>
                                  {u.active ? 'Disable Account' : 'Enable Account'}
                                </button>
                                <button onClick={() => { toggleArchive(u.id); setActiveDropdown(null); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                  {u.archived ? 'Restore User' : 'Archive User'}
                                </button>
                            </div>
                            <div className="py-1">
                                <button onClick={() => { confirmResetPassword(u.id); setActiveDropdown(null); }} className="block w-full text-left px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50">Reset Password</button>
                                <button onClick={() => { confirmDelete(u.id); setActiveDropdown(null); }} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Delete Permanently</button>
                            </div>
                         </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-gray-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between bg-white">
          <span className="text-sm text-gray-700">
            Page <span className="font-medium">{page + 1}</span> of <span className="font-medium">{totalPages || 1}</span>
          </span>
          <div className="flex gap-2">
            <button 
              disabled={page === 0} 
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <button 
              disabled={page >= totalPages - 1} 
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <CreateUserModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setCreateModalOpen(false)} 
        onCreate={handleCreateUser} 
      />

      <UserDetailsModal 
        isOpen={isDetailsModalOpen} 
        onClose={() => setDetailsModalOpen(false)} 
        user={selectedUser} 
      />

      <EditUserModal 
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        user={editUser}
        onEdit={handleEditSubmit}
      />

      {/* Confirmation Modal */}
      {confirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-200">
              <div className={`mx-auto flex items-center justify-center h-14 w-14 rounded-full mb-4 ${confirmModal.isDestructive ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                  {confirmModal.isDestructive ? (
                      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  ) : (
                      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                  )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{confirmModal.title}</h3>
              <p className="text-sm text-gray-500 mb-8">{confirmModal.message}</p>
              <div className="flex justify-center gap-3">
                <button onClick={() => setConfirmModal(null)} className="flex-1 px-4 py-2.5 font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
                <button onClick={executeConfirmAction} className={`flex-1 px-4 py-2.5 font-semibold text-white rounded-xl transition-colors shadow-sm ${confirmModal.isDestructive ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' : 'bg-yellow-600 hover:bg-yellow-700 shadow-yellow-600/20'}`}>
                    Confirm
                </button>
              </div>
            </div>
          </div>
      )}
    </div>
  );
}