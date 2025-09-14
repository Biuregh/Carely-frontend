import { useEffect, useState, useContext } from "react";

import { UserContext } from "../../contexts/UserContext";

import * as userService from "../../services/userService";

const Dashboard = () => {
  const { user } = useContext(UserContext);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await userService.index();
        setUsers(fetchedUsers);
      } catch (err) {
        console.log(err);
      }
    };
    if (user && (user.role === "admin" || user.role === "reception")) {
      fetchUsers();
    }
  }, [user]);

  return (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div className="w-full max-w-3xl bg-white shadow rounded-lg p-6 md:p-8">
      <h1 className="text-2xl font-semibold text-teal-600 mb-4 text-center">
        Welcome, {user.username}
      </h1>
      <p className="text-gray-600 text-sm mb-6 text-center">
        This is the dashboard page where you can see a list of all the users.
      </p>

      <ul className="space-y-2">
        {users.map((user) => (
          <li
            key={user._id}
            className="border rounded px-4 py-2 bg-gray-50 text-gray-800 hover:bg-gray-100 transition-colors"
          >
            {user.username}
          </li>
        ))}
      </ul>
    </div>
  </div>
);
};

export default Dashboard;
