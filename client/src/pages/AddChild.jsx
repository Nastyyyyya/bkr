import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const AddChild = () => {
  axios.defaults.withCredentials = true;

  const { backendUrl, getUserData } = useContext(AppContext);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");

  const handleAddChild = async (e) => {
    e.preventDefault();

    if (!name.trim() || !username.trim()) {
      toast.error("Будь ласка, заповніть усі поля");
      return;
    }

    try {
      const { data } = await axios.post(`${backendUrl}/api/child/add`, {
        name: name.trim(),
        username: username.trim(),
      });

      if (data.success) {
        toast.success("Дитину додано успішно 💙");
        getUserData();
        navigate("/my-children");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt="Логотип"
        className="absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      />

      <form
        onSubmit={handleAddChild}
        className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
      >
        <h1 className="text-white text-2xl font-semibold text-center mb-4">
          Додати дитину
        </h1>

        <p className="text-center mb-6 text-indigo-300">
          Створіть акаунт для своєї дитини
        </p>

        <div className="flex flex-col gap-4 mb-6">
          <input
            type="text"
            id="childName"
            placeholder="Імʼя дитини"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-3 bg-[#333A5C] text-white rounded-md outline-none"
          />

          <input
            type="text"
            id="childUsername"
            placeholder="Логін дитини"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-4 py-3 bg-[#333A5C] text-white rounded-md outline-none"
          />
        </div>

        <button className="w-full py-3 bg-indigo-600 text-white rounded-full">
          Додати дитину
        </button>
      </form>
    </div>
  );
};

export default AddChild;
