import React, { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../../auth/auth";
import CreateUserModal from "../../components/CreateUserModal";
import UserDetailsModal from "../../components/UserDetailsModal";
import EditUserModal from "../../components/EditUserModal";
import { Eye, Edit, Trash2, Key, CheckCircle, XCircle } from "lucide-react";
import useTablePagination from "../../hooks/useTablePagination";
import TableSearch from "../../components/ui/TableSearch";
import TablePagination from "../../components/ui/TablePagination";

export default function SuperAdminUsers() {
  const [users, setUsers] = useState([]);
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

  const {
      currentData: paginatedUsers,
      searchQuery,
      setSearchQuery,
      currentPage,
      setCurrentPage,
      totalPages,
      rowsPerPage,
      setRowsPerPage,
      totalElements
  } = useTablePagination(users, ['username', 'email', 'role'], 10);

  const token = getToken();
  const headers = { Authorization: `Bearer ${token}` };

  const loadUsers = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/admin/users/search", {
        headers,
        params: {
          archived: viewMode === "ARCHIVED",
          size: 10000
        }
      });
      setUsers(res.data.content);
    } catch (e) {
      console.error("Failed to load users", e);
    }
  };

  useEffect(() => {
    loadUsers();
    setSelectedIds([]); // reset selection on filter change
  }, [viewMode]);

  const showToast = (message, isError = false) => {
      setToast({ message, isError });
      setTimeout(() => setToast(null), 4000);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(paginatedUsers.map(u => u.id));
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
              setToast({ message: `Password reset successfully! Temporary Password: ${res.data}`, isError: false, duration: 10000 });
              setTimeout(() => setToast(null), 10000);
              return;
          }
          loadUsers();
      } catch (e) {
          showToast(`Failed to ${action.replace('_', ' ')}.`, true);
      }
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
      delete payload.profilePictureFile;

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
      {toast && (
          <div className="fixed top-4 right-4 z-[60] animate-in slide-in-from-top-2 fade-in duration-200">
              <div className={`px-6 py-3 rounded-xl shadow-lg border flex items-center gap-3 ${toast.isError ? 'bg-red-50 border-red-100 text-red-800' : 'bg-green-50 border-green-100 text-green-800'}`}>
                  {toast.isError ? (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  ) : (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  )}
                  <span className="font-semibold text-sm whitespace-pre-wrap">{toast.message}</span>
              </div>
          </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        <div className="flex space-x-3">
            <button onClick={handleExport} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md shadow-sm font-medium transition-colors flex items-center">
                Export CSV
            </button>
            <button onClick={() => setCreateModalOpen(true)} className="bg-[#0055A5] hover:bg-[#004080] text-white px-4 py-2 rounded-md shadow-sm font-medium transition-colors">
                + Provision User
            </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-12">
        <div className="flex border-b border-gray-200">
            <button 
                onClick={() => { setViewMode("ACTIVE"); setCurrentPage(0); }}
                className={`px-6 py-3 text-sm font-medium transition-colors ${viewMode === "ACTIVE" ? 'bg-white text-[#0055A5] border-b-2 border-[#0055A5]' : 'bg-gray-50 text-gray-500 hover:text-gray-700'}`}
            >
                Active Users
            </button>
            <button 
                onClick={() => { setViewMode("ARCHIVED"); setCurrentPage(0); }}
                className={`px-6 py-3 text-sm font-medium transition-colors ${viewMode === "ARCHIVED" ? 'bg-white text-[#0055A5] border-b-2 border-[#0055A5]' : 'bg-gray-50 text-gray-500 hover:text-gray-700'}`}
            >
                Archived Users
            </button>
        </div>

        <TableSearch 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            placeholder="Search users by name, email, or role..."
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
        />

        {selectedIds.length > 0 && viewMode === "ACTIVE" && (
            <div className="p-4 bg-blue-50 border-b border-blue-100 flex items-center gap-4">
              <span className="text-sm text-blue-800 font-medium">{selectedIds.length} selected</span>
              <button onClick={handleBulkApprove} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm transition-colors">Approve</button>
              <button onClick={handleBulkDisable} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm transition-colors">Disable</button>
            </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-3 w-10">
                  <input type="checkbox" onChange={handleSelectAll} checked={paginatedUsers.length > 0 && selectedIds.length === paginatedUsers.length} className="rounded text-[#0055A5] focus:ring-[#0055A5]" />
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3">
                    <input type="checkbox" checked={selectedIds.includes(u.id)} onChange={() => handleSelect(u.id)} className="rounded text-[#0055A5] focus:ring-[#0055A5]" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{u.username}</div>
                    <div className="text-sm text-gray-500">{u.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{u.role}</td>
                  <td className="px-6 py-4">
                     <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        u.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative inline-block text-left">
                      <button onClick={() => setActiveDropdown(activeDropdown === u.id ? null : u.id)} className="text-gray-400 hover:text-gray-600">
                         <Eye className="w-5 h-5" />
                      </button>
                      {activeDropdown === u.id && (
                         <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-40">
                            <button onClick={() => { openDetails(u.id); setActiveDropdown(null); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">View Details</button>
                            <button onClick={() => { openEdit(u); setActiveDropdown(null); }} className="block w-full text-left px-4 py-2 text-sm text-[#0055A5] hover:bg-gray-100">Edit</button>
                            <button onClick={() => { confirmResetPassword(u.id); setActiveDropdown(null); }} className="block w-full text-left px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50">Reset Password</button>
                            <button onClick={() => { toggleArchive(u.id); setActiveDropdown(null); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Archive/Restore</button>
                            <button onClick={() => { confirmDelete(u.id); setActiveDropdown(null); }} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Delete</button>
                         </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedUsers.length === 0 && (
                <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">No users found matching your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <TablePagination 
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            totalElements={totalElements}
        />
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