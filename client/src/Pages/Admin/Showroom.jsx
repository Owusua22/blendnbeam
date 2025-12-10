import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchShowrooms,
  addShowroom,
  editShowroom,
  removeShowroom,
} from "../../Redux/slice/showroomSlice";

const Showroom = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.showrooms);

  const [form, setForm] = useState({ name: "", isActive: true });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    dispatch(fetchShowrooms());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert("Showroom name is required");

    const token = localStorage.getItem("token");

    if (editingId) {
      dispatch(editShowroom({ id: editingId, showroomData: form, token }));
      setEditingId(null);
    } else {
      dispatch(addShowroom({ showroomData: form, token }));
    }

    setForm({ name: "", isActive: true });
  };

  const handleEdit = (showroom) => {
    setEditingId(showroom._id);
    setForm({ name: showroom.name, isActive: showroom.isActive });
  };

  const handleDelete = (id) => {
    const token = localStorage.getItem("token");
    if (window.confirm("Are you sure you want to delete this showroom?")) {
      dispatch(removeShowroom({ id, token }));
    }
  };

  if (loading) return <p className="text-center text-gray-500 mt-10">Loading showrooms...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">Error: {error}</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-8">Showroom Management</h2>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row gap-4 mb-8 items-center bg-white p-6 rounded-lg shadow-md"
      >
        <input
          type="text"
          placeholder="Enter showroom name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            className="h-5 w-5"
          />
          <span className="text-gray-700 font-medium">Active</span>
        </label>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
        >
          {editingId ? "Update" : "Add"} Showroom
        </button>
      </form>

      {/* Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                  No showrooms found.
                </td>
              </tr>
            ) : (
              items.map((showroom) => (
                <tr key={showroom._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-800">{showroom.name}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        showroom.isActive ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {showroom.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(showroom)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded-md font-medium transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(showroom._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md font-medium transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Showroom;
