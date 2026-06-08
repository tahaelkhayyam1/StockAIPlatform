import React from "react";

export default function UserDetailsModal({ isOpen, onClose, user }) {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">User Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 focus:outline-none">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-4 space-y-4">
          
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-gray-500">ID</span>
            <span className="text-base text-gray-900">{user.id}</span>
          </div>

          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-gray-500">Username</span>
            <span className="text-base text-gray-900">{user.username}</span>
          </div>

          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-gray-500">Email</span>
            <span className="text-base text-gray-900">{user.email}</span>
          </div>

          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-gray-500">Phone</span>
            <span className="text-base text-gray-900">{user.phone || 'N/A'}</span>
          </div>

          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-gray-500">Age</span>
            <span className="text-base text-gray-900">{user.age || 'N/A'}</span>
          </div>

          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-gray-500">Role</span>
            <span className="text-base text-gray-900">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {user.role}
                </span>
            </span>
          </div>

          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-gray-500">Status</span>
            <span className="text-base text-gray-900">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                    user.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                }`}>
                    {user.status}
                </span>
            </span>
          </div>

          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-gray-500">Active</span>
            <span className="text-base text-gray-900">{user.active ? 'Yes' : 'No'}</span>
          </div>

        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
