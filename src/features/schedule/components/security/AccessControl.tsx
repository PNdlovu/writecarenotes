import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { scheduleAPI } from '../../api/schedule-api';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  users: number;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'schedule' | 'attendance' | 'reports' | 'settings' | 'admin';
  isEnabled: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  lastActive: Date;
  status: 'active' | 'inactive' | 'suspended';
}

export const AccessControl: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const { data: roles } = useQuery<Role[]>(
    ['roles'],
    () => scheduleAPI.getRoles()
  );

  const { data: users } = useQuery<User[]>(
    ['users'],
    () => scheduleAPI.getUsers()
  );

  const createRoleMutation = useMutation(
    (role: Partial<Role>) => scheduleAPI.createRole(role),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('roles');
      },
    }
  );

  const updateRoleMutation = useMutation(
    (role: Role) => scheduleAPI.updateRole(role),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('roles');
      },
    }
  );

  const updateUserRolesMutation = useMutation(
    ({ userId, roles }: { userId: string; roles: string[] }) =>
      scheduleAPI.updateUserRoles(userId, roles),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
      },
    }
  );

  const updateUserStatusMutation = useMutation(
    ({ userId, status }: { userId: string; status: User['status'] }) =>
      scheduleAPI.updateUserStatus(userId, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
      },
    }
  );

  const renderRoleCard = (role: Role) => (
    <div
      key={role.id}
      className={`
        p-6 rounded-lg border border-gray-200
        ${selectedRole === role.id ? 'ring-2 ring-blue-500' : ''}
        cursor-pointer hover:bg-gray-50 transition-all duration-200
      `}
      onClick={() => setSelectedRole(role.id)}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium">{role.name}</h3>
          <p className="text-sm text-gray-500">{role.description}</p>
        </div>
        <span className="text-sm text-gray-500">
          {role.users} {role.users === 1 ? 'user' : 'users'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {role.permissions.slice(0, 4).map((permission) => (
          <div
            key={permission.id}
            className={`text-sm ${
              permission.isEnabled ? 'text-green-600' : 'text-gray-400'
            }`}
          >
            <span className="material-icons-outlined text-sm mr-1">
              {permission.isEnabled ? 'check_circle' : 'remove_circle_outline'}
            </span>
            {permission.name}
          </div>
        ))}
        {role.permissions.length > 4 && (
          <div className="text-sm text-blue-600">
            +{role.permissions.length - 4} more
          </div>
        )}
      </div>
    </div>
  );

  const renderPermissionEditor = (role: Role) => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <input
            type="text"
            value={role.name}
            onChange={(e) =>
              updateRoleMutation.mutate({ ...role, name: e.target.value })
            }
            className="text-xl font-medium bg-transparent border-b border-gray-300 focus:border-blue-500 focus:ring-0"
          />
          <input
            type="text"
            value={role.description}
            onChange={(e) =>
              updateRoleMutation.mutate({
                ...role,
                description: e.target.value,
              })
            }
            className="mt-1 block w-full text-sm text-gray-500 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:ring-0"
          />
        </div>
        <button
          onClick={() => setSelectedRole(null)}
          className="text-gray-500 hover:text-gray-700"
        >
          <span className="material-icons-outlined">close</span>
        </button>
      </div>

      <div className="grid gap-4">
        {Object.entries(
          role.permissions.reduce((acc, curr) => {
            acc[curr.category] = acc[curr.category] || [];
            acc[curr.category].push(curr);
            return acc;
          }, {} as Record<string, Permission[]>)
        ).map(([category, permissions]) => (
          <div key={category} className="space-y-2">
            <h4 className="font-medium capitalize">{category}</h4>
            <div className="space-y-2">
              {permissions.map((permission) => (
                <label
                  key={permission.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <div className="font-medium">{permission.name}</div>
                    <div className="text-sm text-gray-500">
                      {permission.description}
                    </div>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permission.isEnabled}
                      onChange={(e) =>
                        updateRoleMutation.mutate({
                          ...role,
                          permissions: role.permissions.map((p) =>
                            p.id === permission.id
                              ? { ...p, isEnabled: e.target.checked }
                              : p
                          ),
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderUserList = () => (
    <div className="space-y-4">
      {users?.map((user) => (
        <div
          key={user.id}
          className={`
            p-4 rounded-lg border border-gray-200
            ${selectedUser === user.id ? 'ring-2 ring-blue-500' : ''}
            cursor-pointer hover:bg-gray-50 transition-all duration-200
          `}
          onClick={() => setSelectedUser(user.id)}
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium">{user.name}</h4>
              <div className="text-sm text-gray-500">{user.email}</div>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={user.status}
                onChange={(e) =>
                  updateUserStatusMutation.mutate({
                    userId: user.id,
                    status: e.target.value as User['status'],
                  })
                }
                onClick={(e) => e.stopPropagation()}
                className={`text-sm rounded-full px-3 py-1 ${
                  user.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : user.status === 'inactive'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="mt-3">
            <div className="text-sm text-gray-500 mb-1">Assigned Roles</div>
            <div className="flex flex-wrap gap-2">
              {roles
                ?.filter((role) => user.roles.includes(role.id))
                .map((role) => (
                  <span
                    key={role.id}
                    className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                  >
                    {role.name}
                  </span>
                ))}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedUser(user.id);
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Edit Roles
              </button>
            </div>
          </div>

          <div className="mt-2 text-xs text-gray-500">
            Last active: {new Date(user.lastActive).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );

  const renderUserRoleEditor = (user: User) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Edit Roles for {user.name}</h3>
          <button
            onClick={() => setSelectedUser(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            <span className="material-icons-outlined">close</span>
          </button>
        </div>

        <div className="space-y-2">
          {roles?.map((role) => (
            <label
              key={role.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
            >
              <div>
                <div className="font-medium">{role.name}</div>
                <div className="text-sm text-gray-500">{role.description}</div>
              </div>
              <input
                type="checkbox"
                checked={user.roles.includes(role.id)}
                onChange={(e) => {
                  const newRoles = e.target.checked
                    ? [...user.roles, role.id]
                    : user.roles.filter((r) => r !== role.id);
                  updateUserRolesMutation.mutate({
                    userId: user.id,
                    roles: newRoles,
                  });
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setSelectedUser(null)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Roles</h2>
            <button
              onClick={() =>
                createRoleMutation.mutate({
                  name: 'New Role',
                  description: 'Role description',
                  permissions: [],
                })
              }
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Add Role
            </button>
          </div>
          <div className="space-y-4">
            {roles?.map(renderRoleCard)}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Users</h2>
          {renderUserList()}
        </div>
      </div>

      {selectedRole && roles && (
        <div className="bg-white rounded-lg shadow p-6">
          {renderPermissionEditor(roles.find((r) => r.id === selectedRole)!)}
        </div>
      )}

      {selectedUser && users && (
        renderUserRoleEditor(users.find((u) => u.id === selectedUser)!)
      )}
    </div>
  );
};
