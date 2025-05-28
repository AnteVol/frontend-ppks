import React, { useState } from "react";

function PredictionsList({ predictions }) {
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  const filteredPredictions = predictions.filter(
    (prediction) =>
      prediction.audio_file.toLowerCase().includes(filter.toLowerCase()) ||
      prediction.predicted_class.toLowerCase().includes(filter.toLowerCase()) ||
      prediction.superclass.toLowerCase().includes(filter.toLowerCase())
  );

  const sortedPredictions = [...filteredPredictions].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];

    if (sortBy === "created_at") {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }

    if (sortOrder === "asc") {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const formatPercentage = (num) => {
    return (num * 100).toFixed(1) + "%";
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="predictions-list">
      <div className="list-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Pretraži po nazivu datoteke, klasi ili nadklasi..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="sort-controls">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="created_at">Vrijeme</option>
            <option value="audio_file">Naziv datoteke</option>
            <option value="predicted_class">Klasa</option>
            <option value="confidence">Pouzdanost</option>
            <option value="processing_time">Vrijeme obrade</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="sort-order-btn"
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>

      <div className="predictions-count">
        Prikazano: {sortedPredictions.length} od {predictions.length} predikcija
      </div>

      <div className="predictions-table-container">
        <table className="predictions-table">
          <thead>
            <tr>
              <th>Audio datoteka</th>
              <th>Predviđena klasa</th>
              <th>Nadklasa</th>
              <th>Pouzdanost</th>
              <th>Vrijeme obrade</th>
              <th>Vrijeme kreiranja</th>
            </tr>
          </thead>
          <tbody>
            {sortedPredictions.map((prediction) => (
              <tr key={prediction.id}>
                <td className="audio-file-cell">
                  <span title={prediction.audio_file}>
                    {prediction.audio_file}
                  </span>
                </td>
                <td className="class-cell">
                  <span className="class-name">
                    {prediction.predicted_class}
                  </span>
                </td>
                <td className="superclass-cell">
                  <span className="superclass-badge">
                    {prediction.superclass}
                  </span>
                </td>
                <td className="confidence-cell">
                  <div className="confidence-container">
                    <span className="confidence-text">
                      {formatPercentage(prediction.confidence)}
                    </span>
                    <div className="confidence-bar">
                      <div
                        className="confidence-fill"
                        style={{ width: `${prediction.confidence * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="processing-time-cell">
                  {prediction.processing_time
                    ? `${prediction.processing_time.toFixed(2)}s`
                    : "-"}
                </td>
                <td className="time-cell">
                  {formatTime(prediction.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedPredictions.length === 0 && (
        <div className="no-results">
          {filter
            ? "Nema predikcija koje odgovaraju pretraživanju."
            : "Nema predikcija."}
        </div>
      )}
    </div>
  );
}

export default PredictionsList;
