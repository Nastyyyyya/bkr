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
  const [age, setAge] = useState("");
  const [password, setPassword] = useState("");

  const handleAddChild = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(backendUrl + "/api/children/add", {
        name,
        age,
        password,
      });

      if (data.success) {
        toast.success("Дитину додано успішно!");
        getUserData();
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400">
      {/* logo */}
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt="logo"
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
          Створіть акаунт для вашої дитини
        </p>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Імʼя дитини"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-3 bg-[#333A5C] text-white rounded-full outline-none"
          />

          <input
            type="number"
            placeholder="Вік дитини"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
            className="w-full px-4 py-3 bg-[#333A5C] text-white rounded-full outline-none"
          />

          <input
            type="password"
            placeholder="Пароль для дитини"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 bg-[#333A5C] text-white rounded-full outline-none"
          />
        </div>

        <button className="w-full mt-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition">
          Додати дитину
        </button>
      </form>
    </div>
  );
};

export default AddChild;
