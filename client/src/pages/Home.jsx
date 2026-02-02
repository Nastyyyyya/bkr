import React from "react";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import MainArticle from "../components/MainArticle";

const ResetPassword = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Navbar />
      <Header />
      <MainArticle />
    </div>
  );
};

export default ResetPassword;
