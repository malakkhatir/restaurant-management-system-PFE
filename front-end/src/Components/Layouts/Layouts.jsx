import React from "react";
import Navbar from "./Navbar/Navbar";
import { Outlet } from "react-router-dom";
import Footer from "./Footer/Footer";
import './Layouts.css'; 
import ScrollToTop from "../../Pages/Scrolle/ScrollToTop";
import ChatBot from "../../Pages/ChatBot/ChatBot";
import CallButton from "../../Pages/CallButton/CallButton";

export default function Layouts() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
        <ScrollToTop />
        <ChatBot/>
        <CallButton/>
      </main>
      <footer>
        <Footer />
      </footer>
    </>
  );
}
