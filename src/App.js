import React, { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import PredictionsList from "./components/PredictionsList";
import Charts from "./components/Charts";
import AddPrediction from "./components/AddPrediction";
import "./App.css";

function App() {
  const [predictions, setPredictions] = useState([]);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState("dashboard");
  const [ws, setWs] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");

  useEffect(() => {
    fetchPredictions();
    fetchStats();
    connectWebSocket();
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    const websocket = new WebSocket("ws://localhost:3001");
    websocket.onopen = () => {
      console.log("WebSocket povezan");
      setConnectionStatus("connected");
      setWs(websocket);
    };
    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "prediction") {
          console.log("Nova predikcija primljena preko WebSocket:", data);
          fetchPredictions();
          fetchStats();
        }
      } catch (error) {
        console.error("Greška pri parsiranju WebSocket poruke:", error);
      }
    };
    websocket.onclose = () => {
      console.log("WebSocket veza prekinuta");
      setConnectionStatus("disconnected");
      setTimeout(connectWebSocket, 5000);
    };
    websocket.onerror = (error) => {
      console.error("WebSocket greška:", error);
      setConnectionStatus("error");
    };
  };

  const fetchPredictions = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/predictions");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPredictions(data);
    } catch (error) {
      console.error("Greška pri dohvaćanju predikcija:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/stats");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Greška pri dohvaćanju statistika:", error);
    }
  };

  const handleNewPrediction = () => {
    fetchPredictions();
    fetchStats();
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>ESC-50 Predictions Dashboard</h1>
        <div className="connection-status">
          <span className={`status-indicator ${connectionStatus}`}></span>
          WebSocket: {connectionStatus}
        </div>
      </header>
      <nav className="nav-tabs">
        <button
          className={activeTab === "dashboard" ? "active" : ""}
          onClick={() => setActiveTab("dashboard")}
        >
          Dashboard
        </button>
        <button
          className={activeTab === "predictions" ? "active" : ""}
          onClick={() => setActiveTab("predictions")}
        >
          Predikcije
        </button>
        <button
          className={activeTab === "charts" ? "active" : ""}
          onClick={() => setActiveTab("charts")}
        >
          Grafovi
        </button>
        <button
          className={activeTab === "add" ? "active" : ""}
          onClick={() => setActiveTab("add")}
        >
          Dodaj predikciju
        </button>
      </nav>
      <main className="main-content">
        {activeTab === "dashboard" && (
          <Dashboard predictions={predictions} stats={stats} />
        )}
        {activeTab === "predictions" && (
          <PredictionsList predictions={predictions} />
        )}
        {activeTab === "charts" && (
          <Charts predictions={predictions} stats={stats} />
        )}
        {activeTab === "add" && (
          <AddPrediction onNewPrediction={handleNewPrediction} />
        )}
      </main>
    </div>
  );
}

export default App;
