"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";

// Skeleton loader component
const SkeletonLoader = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, index) => (
      <div key={index} className="animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
        <div className="h-6 bg-gray-300 rounded w-2/4"></div>
      </div>
    ))}
  </div>
);

export default function Dashboard() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("todo");
  const [loading, setLoading] = useState(true); // Loading state
  const [allUsers, setAllUsers] = useState([]); // All users (for admin dropdown)
  const [assignedUserId, setAssignedUserId] = useState(""); // Selected user ID (for admin)
  const [isAdmin, setIsAdmin] = useState(false); // Track if the user is admin

  // Fetch all users for admin dropdown when isAdmin changes
  useEffect(() => {
    if (!isAdmin) return;

    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        setAllUsers(data.users || []);
        // Set default assigned user to current user if possible
        if (data.users && data.users.length > 0) {
          setAssignedUserId(data.users[0].id);
        }
      })
      .catch(console.error);
  }, [isAdmin]);

  // Fetch logged in user and tasks
  useEffect(() => {
    const fetchUserAndTasks = async () => {
      setLoading(true);
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        console.error("User not authenticated:", error);
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(user);

      // Check admin status and fetch tasks accordingly
      const { data: adminData, error: adminError } = await supabase
        .from("admins")
        .select("*")
        .eq("user_id", user.id)
        .single();

      const admin = !adminError && adminData !== null;
      setIsAdmin(admin);

      // Fetch tasks based on admin or normal user
      const { data: taskData, error: taskError } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (taskError) {
        setError(taskError.message);
      } else {
        if (admin) {
          setTasks(taskData);
        } else {
          setTasks(taskData.filter((t) => t.user_id === user.id));
        }
      }
      setLoading(false);
    };

    fetchUserAndTasks();
  }, []);

  // Fetch tasks helper for refreshing after CRUD operations
  const fetchTasks = async () => {
    if (!user) return;

    setLoading(true);

    const { data: adminData, error: adminError } = await supabase
      .from("admins")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const admin = !adminError && adminData !== null;
    setIsAdmin(admin);

    if (admin) {
      // fetch all users for admin dropdown as well
      fetch("/api/users")
        .then((res) => res.json())
        .then((data) => {
          setAllUsers(data.users || []);
          if (data.users && data.users.length > 0 && !assignedUserId) {
            setAssignedUserId(data.users[0].id);
          }
        })
        .catch(console.error);
    }

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (admin) {
      setTasks(data);
    } else {
      setTasks(data.filter((task) => task.user_id === user.id));
    }

    setLoading(false);
  };

  // Handle add task
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    // Determine user ID and display name for the task
    let taskUserId = user.id;
    let taskUserDisplayName = user.user_metadata?.display_name || "Unknown";

    if (isAdmin && assignedUserId) {
      taskUserId = assignedUserId;
      // Find user display name from allUsers list
      const assignedUser = allUsers.find((u) => u.id === assignedUserId);
      taskUserDisplayName = assignedUser
        ? assignedUser.display_name
        : "Unknown";
    }

    const { error } = await supabase.from("tasks").insert([
      {
        title,
        description,
        user_id: taskUserId,
        user_display_name: taskUserDisplayName,
        status,
      },
    ]);

    if (error) {
      setError(error.message);
    } else {
      setTitle("");
      setDescription("");
      setStatus("todo");
      setError(null);
      fetchTasks();
    }
  };

  // Handle edit task
  const handleEditTask = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const { error } = await supabase
      .from("tasks")
      .update({ title, description, status })
      .eq("id", editingTaskId);

    if (error) {
      setError(error.message);
    } else {
      setEditingTaskId(null);
      setTitle("");
      setDescription("");
      setStatus("todo");
      setError(null);
      fetchTasks();
    }
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setTitle("");
    setDescription("");
    setStatus("todo");
  };

  // Handle delete task
  const handleDeleteTask = async (taskId) => {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) {
      setError(error.message);
    } else {
      setError(null);
      fetchTasks();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-100 min-h-screen mt-16">
      <h1 className="text-4xl font-bold text-center text-blue-900 mb-10">
        Task Dashboard
      </h1>

      {editingTaskId ? (
        <form onSubmit={handleEditTask} className="space-y-6 mb-8">
          <input
            type="text"
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-gray-300 w-full p-4 rounded-lg shadow-lg focus:ring-2 focus:ring-blue-400 text-lg"
          />
          <textarea
            placeholder="Task Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border border-gray-300 w-full p-4 rounded-lg shadow-lg focus:ring-2 focus:ring-blue-400 text-lg"
          ></textarea>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-300 w-full p-4 rounded-lg shadow-lg focus:ring-2 focus:ring-blue-400 text-lg"
          >
            <option value="todo">📝 To Do</option>
            <option value="in_progress">🚧 In Progress</option>
            <option value="done">✅ Done</option>
          </select>
          <div className="flex justify-between items-center">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleAddTask} className="space-y-6 mb-10">
          <input
            type="text"
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-gray-300 w-full p-4 rounded-lg shadow-lg focus:ring-2 focus:ring-blue-400 text-lg"
          />
          <textarea
            placeholder="Task Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border border-gray-300 w-full p-4 rounded-lg shadow-lg focus:ring-2 focus:ring-blue-400 text-lg"
          ></textarea>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-300 w-full p-4 rounded-lg shadow-lg focus:ring-2 focus:ring-blue-400 text-lg"
          >
            <option value="todo">📝 To Do</option>
            <option value="in_progress">🚧 In Progress</option>
            <option value="done">✅ Done</option>
          </select>

          {/* Admin user assignment dropdown */}
          {isAdmin && (
            <select
              value={assignedUserId}
              onChange={(e) => setAssignedUserId(e.target.value)}
              className="border border-gray-300 w-full p-4 rounded-lg shadow-lg focus:ring-2 focus:ring-blue-400 text-lg"
            >
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.display_name || u.email || "Unknown User"}
                </option>
              ))}
            </select>
          )}

          <button
            type="submit"
            className="bg-green-600 text-white px-8 py-3 rounded-lg shadow-md hover:bg-green-700 transition"
          >
            Add Task
          </button>
        </form>
      )}

      {error && <p className="text-red-600 text-center mb-4">{error}</p>}

      {loading ? (
        <SkeletonLoader />
      ) : tasks.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">No tasks available.</p>
      ) : (
        <ul className="space-y-6">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-2xl text-gray-800">
                    {task.title}
                  </h3>
                  <p className="text-gray-600">{task.description}</p>
                  <p className="mt-2 text-sm text-gray-700">
                    <strong>Status:</strong>{" "}
                    {task.status === "todo"
                      ? "📝 To Do"
                      : task.status === "in_progress"
                      ? "🚧 In Progress"
                      : "✅ Done"}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    <em>Assigned to: {task.user_display_name || "Unknown"}</em>
                  </p>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setEditingTaskId(task.id);
                      setTitle(task.title);
                      setDescription(task.description);
                      setStatus(task.status);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="bg-yellow-400 text-white px-4 py-2 rounded hover:bg-yellow-500 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
