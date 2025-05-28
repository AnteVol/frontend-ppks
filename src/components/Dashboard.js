import React from "react";

function Dashboard({ predictions, stats }) {
  const formatNumber = (num) => {
    return num ? num.toLocaleString() : "0";
  };

  const formatPercentage = (num) => {
    return num ? (num * 100).toFixed(1) + "%" : "0%";
  };

  const getRecentPredictions = () => {
    return predictions.slice(0, 5);
  };

  const getTopClasses = () => {
    if (!stats.byClass) return [];
    return stats.byClass.slice(0, 5);
  };

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Ukupno predikcija</h3>
          <div className="stat-number">{formatNumber(stats.total?.count)}</div>
        </div>

        <div className="stat-card">
          <h3>Danas (24h)</h3>
          <div className="stat-number">{formatNumber(stats.recent?.count)}</div>
        </div>

        <div className="stat-card">
          <h3>Prosječna pouzdanost</h3>
          <div className="stat-number">
            {formatPercentage(stats.avgConfidence?.avg)}
          </div>
        </div>

        <div className="stat-card">
          <h3>Ukupno klasa</h3>
          <div className="stat-number">{stats.byClass?.length || 0}</div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <h3>Najnovije predikcije</h3>
          <div className="recent-predictions">
            {getRecentPredictions().map((prediction) => (
              <div key={prediction.id} className="recent-prediction-item">
                <div className="prediction-info">
                  <span className="audio-file">{prediction.audio_file}</span>
                  <span className="predicted-class">
                    {prediction.predicted_class}
                  </span>
                </div>
                <div className="prediction-meta">
                  <span className="confidence">
                    {formatPercentage(prediction.confidence)}
                  </span>
                  <span className="time">
                    {new Date(prediction.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-section">
          <h3>Top 5 klasa</h3>
          <div className="top-classes">
            {getTopClasses().map((classItem, index) => (
              <div key={classItem.name} className="top-class-item">
                <span className="rank">#{index + 1}</span>
                <span className="class-name">{classItem.name}</span>
                <span className="class-count">{classItem.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-section">
          <h3>Distribucija po nadklasama</h3>
          <div className="superclass-distribution">
            {stats.bySuperclass?.map((superclass) => (
              <div key={superclass.name} className="superclass-item">
                <div className="superclass-header">
                  <span className="superclass-name">{superclass.name}</span>
                  <span className="superclass-count">{superclass.count}</span>
                </div>
                <div className="superclass-bar">
                  <div
                    className="superclass-fill"
                    style={{
                      width: `${
                        (superclass.count / (stats.total?.count || 1)) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
