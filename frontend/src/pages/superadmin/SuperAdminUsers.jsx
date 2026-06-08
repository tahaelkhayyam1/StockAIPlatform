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
  };

  const handleBulkDisable = async () => {
    if (selectedIds.length === 0) return;
    await axios.post("http://localhost:8080/api/admin/users/bulk-disable", selectedIds, { headers });
    setSelectedIds([]);
    loadUsers();
  };

  const deleteUser = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this user?")) {
      await axios.delete(`http://localhost:8080/api/admin/users/${id}`, { headers });
      loadUsers();
    }
  };

  const changeRole = async (id, role) => {
    await axios.post(`http://localhost:8080/api/admin/users/${id}/role`, { role }, { headers });
    loadUsers();
  };

  const handleCreateUser = async (formData) => {
    try {
      await axios.post("http://localhost:8080/api/admin/users", formData, { headers });
      setCreateModalOpen(false);
      loadUsers();
    } catch (err) {
      if (err.response && err.response.data) {
        alert(err.response.data);
      } else {
        alert("Failed to create user.");
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
      loadUsers();
    } catch (err) {
      alert("Failed to update user.");
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
    } catch (err) {
      alert("Failed to export users.");
    }
  };

  const openDetails = async (id) => {
    const res = await axios.get(`http://localhost:8080/api/admin/users/${id}`, { headers });
    setSelectedUser(res.data);
    setDetailsModalOpen(true);
  };

  const toggleArchive = async (id) => {
      // Archive or Unarchive user
      // Note: We don't have an unarchive endpoint, but we can call enable or approve
      // Let's call a new PUT /api/admin/users/{id} to update archived if we had it, or we can just call an endpoint.
      // Wait, there is no unarchive endpoint in the backend right now!
      // Let's assume we can call an unarchive endpoint or just use the DB directly. Let's add it in the backend later if needed, but wait! The user said "if a user is archived we should have archibe section to see em". 
      // I'll add an unarchive endpoint `/users/{id}/unarchive` in AdminController.
      try {
          if (viewMode === "ACTIVE") {
              await axios.post(`http://localhost:8080/api/admin/users/${id}/archive`, {}, { headers });
          } else {
              await axios.post(`http://localhost:8080/api/admin/users/${id}/unarchive`, {}, { headers });
          }
          loadUsers();
      } catch(e) {
          alert("Failed to change archive status");
      }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
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
                         <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 divide-y divide-gray-100">
                            <div className="py-1">
                                <button onClick={() => { openDetails(u.id); setActiveDropdown(null); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">View Details</button>
                                <button onClick={() => { openEdit(u); setActiveDropdown(null); }} className="block w-full text-left px-4 py-2 text-sm text-indigo-600 hover:bg-gray-100">Edit User</button>
                            </div>
                            <div className="py-1">
                                {u.status !== 'ACTIVE' && (
                                    <button onClick={async () => { await axios.post(`http://localhost:8080/api/admin/users/${u.id}/approve`, {}, { headers }); loadUsers(); setActiveDropdown(null); }} className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-100">Approve Account</button>
                                )}
                                <button onClick={async () => { await axios.post(`http://localhost:8080/api/admin/users/${u.id}/${u.active ? 'disable' : 'enable'}`, {}, { headers }); loadUsers(); setActiveDropdown(null); }} className={`block w-full text-left px-4 py-2 text-sm ${u.active ? 'text-orange-600' : 'text-emerald-600'} hover:bg-gray-100`}>
                                  {u.active ? 'Disable Account' : 'Enable Account'}
                                </button>
                                <button onClick={() => { toggleArchive(u.id); setActiveDropdown(null); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                  {u.archived ? 'Restore User' : 'Archive User'}
                                </button>
                            </div>
                            <div className="py-1">
                                <button onClick={async () => {
                                    if(window.confirm("Are you sure you want to reset this user's password?")) {
                                        try {
                                            const res = await axios.post(`http://localhost:8080/api/admin/users/${u.id}/reset-password`, {}, { headers });
                                            alert(`Password reset successfully!\nTemporary Password: ${res.data}`);
                                            setActiveDropdown(null);
                                        } catch (e) {
                                            alert("Failed to reset password");
                                        }
                                    }
                                }} className="block w-full text-left px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50">Reset Password</button>
                                <button onClick={() => { deleteUser(u.id); setActiveDropdown(null); }} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Delete Permanently</button>
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
    </div>
  );
}