import { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import "./ManageUsers.css";
import AdminSideBar from "./AdminSideBar";

const AdminManageUsers = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = useParams();

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:3000/get-users");
      if (!response.ok) throw new Error("Failed to fetch users");

      const data = await response.json();
      console.log("Users Data:", data);
      const combinedUsers = [...(data.buyers || []), ...(data.sellers || [])];
      console.log("Combined Users:", combinedUsers);
      setUsers(combinedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();

    if (location.state?.refresh) {
      fetchUsers();
      navigate(`/admin-manage-users/${email}`, { state: {} });
    }

    const interval = setInterval(fetchUsers, 10000);
    return () => clearInterval(interval);
  }, [location, navigate]);

  const handleDelete = async (userId) => {
    try {
      const response = await fetch(`http://localhost:3000/delete-user/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete user");

      setUsers(users.filter((user) => user._id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // Function to convert isMember boolean to a readable string
  const getMembershipStatus = (isMember) => {
    if (isMember === true) return "Active";
    if (isMember === false) return "Inactive";
    return "Unknown";
  };

  return (
    <div className="app">
      <nav className="sidebar">
        <AdminSideBar activeLink={location.pathname} email={email} />
      </nav>
      <div className="main-content">
        <div className="manage-users">
          <h2>Manage Users</h2>
          <button className="refresh-button" onClick={fetchUsers}>
            Refresh
          </button>
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Membership Status</th>
                <th>Operations</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.firstName} {user.lastName}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`user-role ${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className={`membership-status ${user.isMember ? "active" : "inactive"}`}>
                      {getMembershipStatus(user.isMember)}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="update-button"
                          onClick={() => navigate(`/edit-user/${user._id}`)}
                        >
                          Update
                        </button>
                        <button 
                          className="delete-button"
                          onClick={() => handleDelete(user._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="empty-message">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminManageUsers;