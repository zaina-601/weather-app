import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

const App = () => {
  const [city, setCity] = useState("");
  const [locationName, setLocationName] = useState("");
  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  const today = new Date();
  const past7 = new Date();
  past7.setDate(today.getDate() - 6);
  const [startDate, setStartDate] = useState(format(past7, "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(today, "yyyy-MM-dd"));

  const handleSearch = async () => {
    if (!city.trim()) return;

    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city.trim()}`
      );
      const geoData = await geoRes.json();
      const result = geoData.results?.[0];
      if (!result) {
        alert("City not found.");
        return;
      }

      const { latitude, longitude, name, country } = result;
      setLat(latitude);
      setLon(longitude);
      setLocationName(`${name}, ${country}`);

      const weatherRes = await fetch(
        `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max&timezone=auto`
      );
      const weatherData = await weatherRes.json();
      const graph = weatherData.daily.time.map((time, i) => ({
        date: time,
        temperature: weatherData.daily.temperature_2m_max[i],
      }));
      setChartData(graph);
    } catch (err) {
      console.error("Error:", err);
      alert("Error fetching data.");
    }
  };

  const theme = {
    light: {
      bg: "#fefefe",
      text: "#1e293b",
      card: "#ffffff",
      input: "#f1f5f9",
      border: "#e2e8f0",
    },
    dark: {
      bg: "#0f172a",
      text: "#f8fafc",
      card: "#1e293b",
      input: "#1e293b",
      border: "#334155",
    },
  };

  const current = darkMode ? theme.dark : theme.light;

  return (
    <div
      style={{
        backgroundColor: current.bg,
        minHeight: "100vh",
        color: current.text,
        fontFamily: "'Poppins', sans-serif",
        padding: "30px 20px",
        transition: "all 0.3s ease",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap"
        rel="stylesheet"
      />

      <div style={{ maxWidth: "700px", margin: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <h2 style={{ fontWeight: 600 }}> Weather Tracker</h2>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              backgroundColor: current.input,
              color: current.text,
              border: `1px solid ${current.border}`,
              borderRadius: "50px",
              padding: "6px 16px",
              cursor: "pointer",
              transition: "all 0.3s",
            }}
          >
            {darkMode ? "☀ Light" : "🌙 Dark"}
          </button>
        </div>

        <input
          type="text"
          placeholder="Enter city name..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={{
            padding: "14px",
            width: "100%",
            fontSize: "15px",
            borderRadius: "12px",
            marginBottom: "15px",
            border: `1px solid ${current.border}`,
            backgroundColor: current.input,
            color: current.text,
          }}
        />

        <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "10px",
              border: `1px solid ${current.border}`,
              backgroundColor: current.input,
              color: current.text,
            }}
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "10px",
              border: `1px solid ${current.border}`,
              backgroundColor: current.input,
              color: current.text,
            }}
          />
        </div>

        <button
          onClick={handleSearch}
          style={{
            width: "100%",
            padding: "14px",
            fontSize: "16px",
            background: "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "600",
            boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
            marginBottom: "24px",
          }}
        >
           Search Weather
        </button>

        {locationName && (
          <div
            style={{
              backgroundColor: current.card,
              padding: "20px",
              borderRadius: "16px",
              boxShadow: "0 5px 18px rgba(0,0,0,0.1)",
              marginBottom: "24px",
            }}
          >
            <h3 style={{ marginBottom: "10px" }}> {locationName}</h3>
            <p style={{ margin: "0" }}>Latitude: {lat}</p>
            <p style={{ margin: "0" }}>Longitude: {lon}</p>
          </div>
        )}

        {chartData.length > 0 && (
          <>
            <h4 style={{ textAlign: "center", marginBottom: "12px" }}>
               Max Temperature Trend (°C)
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid stroke={current.border} />
                <XAxis dataKey="date" stroke={current.text} />
                <YAxis stroke={current.text} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: current.card,
                    borderRadius: "8px",
                    border: "none",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  animationDuration={600}
                />
              </LineChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
