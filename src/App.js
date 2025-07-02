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

  const bgColor = darkMode ? "#111" : "#f4f4f4";
  const textColor = darkMode ? "#fff" : "#000";
  const cardColor = darkMode ? "#222" : "#fff";

  return (
    <div
      style={{
        backgroundColor: bgColor,
        minHeight: "100vh",
        padding: "30px",
        color: textColor,
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      <div style={{ maxWidth: "650px", margin: "auto" }}>
        <h2 style={{ textAlign: "center" }}>Weather Tracker</h2>

        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            float: "right",
            marginBottom: "10px",
            backgroundColor: darkMode ? "#444" : "#ddd",
            color: darkMode ? "#fff" : "#000",
            border: "none",
            padding: "5px 10px",
            cursor: "pointer",
            borderRadius: "6px",
          }}
        >
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>

        <input
          type="text"
          placeholder="Enter city name..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={{
            padding: "10px",
            width: "100%",
            fontSize: "16px",
            marginBottom: "10px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        />

        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ padding: "8px", flex: 1 }}
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ padding: "8px", flex: 1 }}
          />
        </div>

        <button
          onClick={handleSearch}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
            backgroundColor: "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            marginBottom: "20px",
            width: "100%",
          }}
        >
          Search
        </button>

        {locationName && (
          <div
            style={{
              backgroundColor: cardColor,
              padding: "15px",
              borderRadius: "8px",
              boxShadow: "0 0 5px rgba(0,0,0,0.1)",
              marginBottom: "20px",
            }}
          >
            <h3>Location: {locationName}</h3>
            <p>Latitude: {lat}</p>
            <p>Longitude: {lon}</p>
          </div>
        )}

        {chartData.length > 0 && (
          <>
            <h4 style={{ marginTop: "20px", textAlign: "center" }}>
              Temperature Trend
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid stroke={darkMode ? "#555" : "#ccc"} />
                <XAxis dataKey="date" stroke={textColor} />
                <YAxis unit="°C" stroke={textColor} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#f97316"
                  strokeWidth={2}
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
