"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";

export default function Dashboard() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("todo");
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const getUserAndTasks = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (user) fetchTasks(user.id);
    };

    getUserAndTasks();
  }, []);

  const fetchTasks = async (userId) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: adminData, error: adminError } = await supabase
      .from("admins")
      .select("*")
      .eq("user_id", userId)
      .single();

    const isAdmin = !adminError && adminData !== null;

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (isAdmin) {
      setTasks(data);
    } else {
      const userTasks = data.filter((task) => task.user_id === userId);
      setTasks(userTasks);
    }

    if (error) {
      setError(error.message);
    }

    setLoading(false); // Set loading to false when data is fetched
  };

  const handleAddTask = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) return;

    const { error } = await supabase.from("tasks").insert([
      {
        title,
        description,
        user_id: user.id,
        user_display_name: user.user_metadata.display_name,
        status,
      },
    ]);

    if (error) {
      setError(error.message);
    } else {
      setTitle("");
      setDescription("");
      setError(null);
      fetchTasks(user.id);
    }
  };

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
      fetchTasks(user.id);
    }
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setTitle("");
    setDescription("");
    setStatus("todo");
  };

  const handleDeleteTask = async (taskId) => {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) {
      setError(error.message);
    } else {
      setError(null);
      fetchTasks(user.id);
    }
  };

  const SkeletonLoader = () => (
    <div className="space-y-6">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="bg-white p-6 rounded-lg shadow-lg animate-pulse"
        >
          <div className="h-6 bg-gray-300 rounded mb-4"></div>
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-center text-blue-600 mb-10">
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
          <button
            type="submit"
            className="bg-green-600 text-white px-8 py-3 rounded-lg shadow-md hover:bg-green-700 transition"
          >
            Add Task
          </button>
        </form>
      )}

      {error && <p className="text-red-600 text-center mb-4">{error}</p>}

      {/* Render Skeleton Loader or Task List */}
      {loading ? (
        <SkeletonLoader />
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
                  <p className="text-sm text-gray-500">
                    by: {task.user_display_name || "Unknown User"}
                  </p>
                </div>
                <div className="space-x-4">
                  <button
                    onClick={() => {
                      setEditingTaskId(task.id);
                      setTitle(task.title);
                      setDescription(task.description);
                      setStatus(task.status);
                    }}
                    className="text-blue-600 hover:underline transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-red-600 hover:underline transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {tasks.length === 0 && !loading && (
        <p className="text-center text-gray-500 mt-10">No tasks available.</p>
      )}
    </div>
  );
}
