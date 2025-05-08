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
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error) setTasks(data);
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const { error } = await supabase.from("tasks").insert([
      {
        title,
        description,
        user_id: user.id,
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

  // وظيفة تعديل المهمة
  const handleEditTask = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const { error } = await supabase
      .from("tasks")
      .update({ title, description })
      .eq("id", editingTaskId);

    if (error) {
      setError(error.message);
    } else {
      setEditingTaskId(null); // إلغاء وضع التعديل
      setTitle("");
      setDescription("");
      setError(null);
      fetchTasks(user.id); // تحديث قائمة المهام
    }
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

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">لوحة المهام</h1>

      {/* إذا كان في وضع تعديل */}
      {editingTaskId ? (
        <form onSubmit={handleEditTask} className="space-y-4 mb-6">
          <input
            type="text"
            placeholder="عنوان المهمة"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border w-full p-2 rounded"
          />
          <textarea
            placeholder="وصف المهمة"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border w-full p-2 rounded"
          ></textarea>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            حفظ التعديلات
          </button>
          <button
            type="button"
            onClick={() => setEditingTaskId(null)}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            إلغاء التعديل
          </button>
        </form>
      ) : (
        <form onSubmit={handleAddTask} className="space-y-4 mb-6">
          <input
            type="text"
            placeholder="عنوان المهمة"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border w-full p-2 rounded"
          />
          <textarea
            placeholder="وصف المهمة"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border w-full p-2 rounded"
          ></textarea>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            إضافة مهمة
          </button>
        </form>
      )}

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <ul className="space-y-2">
        {tasks.map((task) => (
          <li key={task.id} className="border p-4 rounded shadow ">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{task.title}</h3>
                <p className="text-gray-600">{task.description}</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => {
                    setEditingTaskId(task.id); // تحديد المهمة التي سيتم تعديلها
                    setTitle(task.title); // تعبئة العنوان في النموذج
                    setDescription(task.description); // تعبئة الوصف في النموذج
                  }}
                  className="text-blue-500 hover:underline"
                >
                  تعديل
                </button>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-red-500 hover:underline"
                >
                  حذف
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {tasks.length === 0 && (
        <p className="text-gray-500 mt-4">لا توجد مهام حالياً.</p>
      )}
    </div>
  );
}
