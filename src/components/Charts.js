import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";

function Charts({ predictions, stats }) {
  const COLORS = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7300",
    "#00ff00",
    "#ff00ff",
    "#00ffff",
    "#ffff00",
  ];

  const getTimelineData = () => {
    const grouped = {};
    predictions.forEach((prediction) => {
      const date = new Date(prediction.created_at).toLocaleDateString();
      grouped[date] = (grouped[date] || 0) + 1;
    });

    return Object.entries(grouped)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-30);
  };

  const getConfidenceDistribution = () => {
    const ranges = {
      "0-20%": 0,
      "20-40%": 0,
      "40-60%": 0,
      "60-80%": 0,
      "80-100%": 0,
    };

    predictions.forEach((prediction) => {
      const confidence = prediction.confidence * 100;
      if (confidence <= 20) ranges["0-20%"]++;
      else if (confidence <= 40) ranges["20-40%"]++;
      else if (confidence <= 60) ranges["40-60%"]++;
      else if (confidence <= 80) ranges["60-80%"]++;
      else ranges["80-100%"]++;
    });

    return Object.entries(ranges).map(([range, count]) => ({ range, count }));
  };

  const getSuperclassData = () => {
    return (
      stats.bySuperclass?.map((item, index) => ({
        ...item,
        fill: COLORS[index % COLORS.length],
      })) || []
    );
  };

  const getTopClassesData = () => {
    return stats.byClass?.slice(0, 10) || [];
  };

  return (
    <div className="charts-container">
      <div className="charts-grid">
        <div className="chart-section">
          <h3>Predikcije kroz vrijeme (zadnjih 30 dana)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getTimelineData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#8884d8"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-section">
          <h3>Distribucija pouzdanosti predikcija</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getConfidenceDistribution()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-section">
          <h3>Distribucija po nadklasama</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getSuperclassData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {getSuperclassData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-section">
          <h3>Top 10 najčešćih klasa</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={getTopClassesData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                fontSize={12}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {predictions.some((p) => p.processing_time) && (
          <div className="chart-section full-width">
            <h3>Vrijeme obrade kroz vrijeme</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={predictions
                  .filter((p) => p.processing_time)
                  .slice(-50)
                  .map((p, index) => ({
                    index: index + 1,
                    processing_time: p.processing_time,
                    audio_file: p.audio_file,
                  }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="index" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    `${value.toFixed(2)}s`,
                    "Vrijeme obrade",
                  ]}
                  labelFormatter={(index) => `Predikcija #${index}`}
                />
                <Line
                  type="monotone"
                  dataKey="processing_time"
                  stroke="#ff7300"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="stats-summary">
        <h3>Sažetak statistika</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Ukupno predikcija:</span>
            <span className="summary-value">{predictions.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Prosječna pouzdanost:</span>
            <span className="summary-value">
              {stats.avgConfidence?.avg
                ? (stats.avgConfidence.avg * 100).toFixed(1) + "%"
                : "N/A"}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Najčešća klasa:</span>
            <span className="summary-value">
              {stats.byClass?.[0]?.name || "N/A"} (
              {stats.byClass?.[0]?.count || 0})
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Najčešća nadklasa:</span>
            <span className="summary-value">
              {stats.bySuperclass?.[0]?.name || "N/A"} (
              {stats.bySuperclass?.[0]?.count || 0})
            </span>
          </div>
          {predictions.some((p) => p.processing_time) && (
            <>
              <div className="summary-item">
                <span className="summary-label">Prosječno vrijeme obrade:</span>
                <span className="summary-value">
                  {(
                    predictions
                      .filter((p) => p.processing_time)
                      .reduce((sum, p) => sum + p.processing_time, 0) /
                    predictions.filter((p) => p.processing_time).length
                  ).toFixed(2)}
                  s
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Najbrža obrada:</span>
                <span className="summary-value">
                  {Math.min(
                    ...predictions
                      .filter((p) => p.processing_time)
                      .map((p) => p.processing_time)
                  ).toFixed(2)}
                  s
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Najsporija obrada:</span>
                <span className="summary-value">
                  {Math.max(
                    ...predictions
                      .filter((p) => p.processing_time)
                      .map((p) => p.processing_time)
                  ).toFixed(2)}
                  s
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Charts;
