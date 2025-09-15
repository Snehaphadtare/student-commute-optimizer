import { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import MapView from "./MapView";
import "./App.css";

const socket = io("http://localhost:5000");

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const [students, setStudents] = useState([]);
  const [homeDest, setHomeDest] = useState({ home: null, dest: null });

  // Login or Register
  const login = async () => {
    try {
      const res = await axios.post("http://localhost:5000/login", { email });
      setUser(res.data);
    } catch (err) {
      const res = await axios.post("http://localhost:5000/register", { email, password: "1234" });
      setUser(res.data);
    }
  };

  // Save route
  const saveRoute = async () => {
    if (!homeDest.home || !homeDest.dest) {
      alert("Please select both Home and Destination on the map");
      return;
    }

    const res = await axios.post("http://localhost:5000/route", {
      username: user.username,
      home: homeDest.home,
      dest: homeDest.dest
    });
    setStudents(res.data);
  };

  // Send chat message
  const send = () => {
    if (!msg.trim()) return;
    socket.emit("sendMessage", { sender: user?.username, text: msg });
    setMsg("");
  };

  // Listen to chat
  useEffect(() => {
    socket.on("receiveMessage", data => setMessages(m => [...m, data]));
  }, []);

  if (!user) return (
    <div className="login-container">
  <h2>Login/Register</h2>
  <input
    value={email}
    onChange={e => setEmail(e.target.value)}
    placeholder="Enter Email"
  />
  <button onClick={login}>Login</button>
</div>

  );

  return (
    <div className="app-container">
      <h1>Hello {user.username}</h1>

      {/* Map Section */}
      <h2>Nearby Students on Map</h2>
      <MapView students={students} setHomeDest={setHomeDest} />
      <button onClick={saveRoute} className="share-route-btn">Share Route</button>

      {/* Chat Section */}
      <h2>Chat</h2>
      <div className="chat-box">
        <div className="messages">
          {messages.map((m, i) => (
            <p key={i}><b>{m.sender}:</b> {m.text}</p>
          ))}
        </div>
        <div className="chat-input">
          <input
            value={msg}
            onChange={e => setMsg(e.target.value)}
            placeholder="Type message"
          />
          <button onClick={send}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
