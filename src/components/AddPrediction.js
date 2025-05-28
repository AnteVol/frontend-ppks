import React, { useState, useEffect } from "react";

function AddPrediction({ onNewPrediction }) {
  const [formData, setFormData] = useState({
    audio_file: "",
    predicted_class: "",
    confidence: "",
    processing_time: "",
    metadata: "",
  });
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/classes");
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error("Greška pri dohvaćanju klasa:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (
        !formData.audio_file ||
        !formData.predicted_class ||
        !formData.confidence
      ) {
        setMessage("Molimo unesite sve obavezne podatke.");
        setLoading(false);
        return;
      }

      const confidence = parseFloat(formData.confidence);
      if (isNaN(confidence) || confidence < 0 || confidence > 1) {
        setMessage("Pouzdanost mora biti broj između 0 i 1.");
        setLoading(false);
        return;
      }

      const submitData = {
        audio_file: formData.audio_file,
        predicted_class: formData.predicted_class,
        confidence: confidence,
        processing_time: formData.processing_time
          ? parseFloat(formData.processing_time)
          : null,
        metadata: formData.metadata ? JSON.parse(formData.metadata) : {},
      };

      const response = await fetch("/api/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage("Predikcija je uspješno dodana!");

        setFormData({
          audio_file: "",
          predicted_class: "",
          confidence: "",
          processing_time: "",
          metadata: "",
        });

        onNewPrediction();
      } else {
        const error = await response.json();
        setMessage(`Greška: ${error.error}`);
      }
    } catch (error) {
      console.error("Greška pri dodavanju predikcije:", error);
      setMessage(
        "Greška pri dodavanju predikcije. Provjerite format podataka."
      );
    }

    setLoading(false);
  };

  const generateSampleData = () => {
    const sampleClasses = classes.length > 0 ? classes : [];
    const randomClass =
      sampleClasses[Math.floor(Math.random() * sampleClasses.length)];

    setFormData({
      audio_file: `sample_audio_${Date.now()}.wav`,
      predicted_class: randomClass?.name || "Dog",
      confidence: (Math.random() * 0.3 + 0.7).toFixed(3),
      processing_time: (Math.random() * 2 + 0.5).toFixed(2),
      metadata: JSON.stringify(
        {
          model_version: "1.0",
          sample_rate: 44100,
          duration: Math.random() * 10 + 1,
        },
        null,
        2
      ),
    });
  };

  const groupedClasses = classes.reduce((acc, cls) => {
    if (!acc[cls.superclass]) {
      acc[cls.superclass] = [];
    }
    acc[cls.superclass].push(cls);
    return acc;
  }, {});

  return (
    <div className="add-prediction">
      <div className="add-prediction-header">
        <h2>Dodaj novu predikciju</h2>
        <button
          type="button"
          onClick={generateSampleData}
          className="sample-btn"
        >
          Generiraj uzorke podatke
        </button>
      </div>

      <form onSubmit={handleSubmit} className="prediction-form">
        <div className="form-group">
          <label htmlFor="audio_file">Naziv audio datoteke *</label>
          <input
            type="text"
            id="audio_file"
            name="audio_file"
            value={formData.audio_file}
            onChange={handleInputChange}
            placeholder="npr. sample_audio.wav"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="predicted_class">Predviđena klasa *</label>
          <select
            id="predicted_class"
            name="predicted_class"
            value={formData.predicted_class}
            onChange={handleInputChange}
            required
          >
            <option value="">Odaberite klasu</option>
            {Object.entries(groupedClasses).map(([superclass, classItems]) => (
              <optgroup key={superclass} label={superclass}>
                {classItems.map((cls) => (
                  <option key={cls.id} value={cls.name}>
                    {cls.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="confidence">Pouzdanost (0-1) *</label>
          <input
            type="number"
            id="confidence"
            name="confidence"
            value={formData.confidence}
            onChange={handleInputChange}
            step="0.001"
            min="0"
            max="1"
            placeholder="npr. 0.95"
            required
          />
          {formData.confidence && (
            <div className="confidence-preview">
              Postotak:{" "}
              {(parseFloat(formData.confidence || 0) * 100).toFixed(1)}%
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="processing_time">Vrijeme obrade (sekunde)</label>
          <input
            type="number"
            id="processing_time"
            name="processing_time"
            value={formData.processing_time}
            onChange={handleInputChange}
            step="0.01"
            min="0"
            placeholder="npr. 1.25"
          />
        </div>

        <div className="form-group">
          <label htmlFor="metadata">Metadata (JSON format)</label>
          <textarea
            id="metadata"
            name="metadata"
            value={formData.metadata}
            onChange={handleInputChange}
            rows="6"
            placeholder='{"model_version": "1.0", "sample_rate": 44100}'
          />
          <div className="form-help">
            Opcionalni JSON objekt s dodatnim informacijama o predikciji
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "Dodajem..." : "Dodaj predikciju"}
          </button>
        </div>
      </form>

      {message && (
        <div
          className={`message ${
            message.includes("Greška") ? "error" : "success"
          }`}
        >
          {message}
        </div>
      )}

      <div className="form-info">
        <h3>Napomene:</h3>
        <ul>
          <li>Sva polja označena * su obavezna</li>
          <li>Pouzdanost mora biti broj između 0 i 1 (npr. 0.95 za 95%)</li>
          <li>Metadata treba biti valjan JSON format ili ostaviti prazno</li>
          <li>
            Predikcija će biti automatski poslana svim povezanim WebSocket
            klijentima
          </li>
        </ul>
      </div>
    </div>
  );
}

export default AddPrediction;
