import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role, User } from '../types';
import { api } from '../services/api';

interface RoleContextType {
  role: Role;
  currentUser: User | null;
  allUsers: User[];
  setRole: (role: Role) => void;
  setCurrentUser: (user: User) => void;
  switchUserById: (userId: string) => void;
}

const defaultStudent: User = {
  id: 'student-1',
  name: 'Aarav Sharma',
  email: 'aarav.sharma@campus.edu',
  role: 'STUDENT',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav',
  departmentId: 'dept-cse',
  department: { id: 'dept-cse', name: 'Computer Science and Engineering' },
};

const RoleContext = createContext<RoleContextType>({
  role: 'STUDENT',
  currentUser: defaultStudent,
  allUsers: [defaultStudent],
  setRole: () => {},
  setCurrentUser: () => {},
  switchUserById: () => {},
});

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<Role>(() => {
    const saved = localStorage.getItem('lablink_demo_role');
    return (saved as Role) || 'STUDENT';
  });

  const [currentUser, setCurrentUserState] = useState<User | null>(() => {
    const saved = localStorage.getItem('lablink_demo_user');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return defaultStudent;
  });

  const [allUsers, setAllUsers] = useState<User[]>([defaultStudent]);

  useEffect(() => {
    // Fetch all demo profiles from backend
    api.getUsers()
      .then(users => {
        if (users.length > 0) {
          setAllUsers(users);
          // If no current user or current user does not match active role, select first of that role
          if (!currentUser || currentUser.role !== role) {
            const matching = users.find(u => u.role === role) || users[0];
            setCurrentUserState(matching);
            localStorage.setItem('lablink_demo_user', JSON.stringify(matching));
          }
        }
      })
      .catch(err => {
        console.warn('Could not load remote demo users, using fallback defaults', err);
      });
  }, []);

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    localStorage.setItem('lablink_demo_role', newRole);

    // Pick first user matching new role
    const matching = allUsers.find(u => u.role === newRole);
    if (matching) {
      setCurrentUserState(matching);
      localStorage.setItem('lablink_demo_user', JSON.stringify(matching));
    }
  };

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    setRoleState(user.role);
    localStorage.setItem('lablink_demo_role', user.role);
    localStorage.setItem('lablink_demo_user', JSON.stringify(user));
  };

  const switchUserById = (userId: string) => {
    const found = allUsers.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
    }
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        currentUser,
        allUsers,
        setRole,
        setCurrentUser,
        switchUserById,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);
