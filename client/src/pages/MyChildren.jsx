import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const MyChildren = () => {
  const { backendUrl } = useContext(AppContext);
  const [children, setChildren] = useState([]);
  const navigate = useNavigate();

  const fetchChildren = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/child/my`);
      if (data.success) {
        setChildren(data.children);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const handleSelectChild = (childId) => {
    navigate(`/child-home/${childId}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-200 to-purple-400 p-8">
      <h1 className="text-2xl sm:text-4xl font-semibold mb-6">Мої діти</h1>

      {children.length === 0 ? (
        <p className="text-gray-700">У вас ще немає доданих дітей</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl">
          {children.map((child) => (
            <div
              key={child._id}
              className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:bg-gray-100 transition"
              onClick={() => handleSelectChild(child._id)}
            >
              <h2 className="text-xl font-semibold mb-2">{child.name}</h2>
              <p className="text-gray-600">Логін: {child.username}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyChildren;
