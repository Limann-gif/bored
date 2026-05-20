import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { UserDto } from '../types';

export const UserList: React.FC = () => {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Call the backend endpoint when the page mounts
    apiService.getUsers()
      .then((response) => {
        setUsers(response.data); // Pull data from your wrapper format
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Something went wrong');
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading data from backend...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div>
      <h2>Users from C# Backend</h2>
      <ul>
        {users.map((user) => (
          <li key={user.username}>
            <strong>{user.username}</strong> — {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
};