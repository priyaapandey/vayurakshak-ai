import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "./App.css";

const environmentalData = {
  city: "Bengaluru",
  state: "Karnataka",
  location: "Peenya Industrial Area",

  sensor: {
    pm25: 178,
    pm10: 241,
    no2: 92,
  },

  weather: {
    temperature: 27,
    humidity: 78,
    windSpeed: 2.1,
    windDirection: "SE",
  },

  satellite: {
    no2Anomaly: 73,
    aerosolIndex: 1.42,
  },

  citizenReports: 8,

  forecast: {
    current: 178,
    sixHours: 213,
    twelveHours: 241,
    twentyFourHours: 186,
  },
};

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analysisError, setAnalysisError] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertCreated, setAlertCreated] = useState(false);
  const [language, setLanguage] = useState("English");

  const handleImageUpload = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setAnalysis(null);
    setAnalysisError("");
    setAlertCreated(false);
  };

  const analyzePollution = async () => {
    if (!image) {
      alert("Please upload a pollution image first.");
      return;
    }

    setLoading(true);
  setAnalysis(null);
  setAnalysisError("");

    try {
      const genAI = new GoogleGenerativeAI(
        import.meta.env.VITE_GEMINI_API_KEY
      );

      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      });

      const base64Image = await fileToGenerativePart(image);

      const prompt = `
You are VayuRakshak, an AI-powered environmental pollution intelligence system.

Analyze this citizen-submitted image for visible pollution.

Environmental context:

Location:
Peenya Industrial Area, Bengaluru, Karnataka

Sensor readings:
PM2.5: ${environmentalData.sensor.pm25}
PM10: ${environmentalData.sensor.pm10}
NO2: ${environmentalData.sensor.no2}

Weather:
Temperature: ${environmentalData.weather.temperature} C
Humidity: ${environmentalData.weather.humidity}%
Wind speed: ${environmentalData.weather.windSpeed} m/s
Wind direction: ${environmentalData.weather.windDirection}

Satellite indicators:
NO2 anomaly: ${environmentalData.satellite.no2Anomaly}%
Aerosol index: ${environmentalData.satellite.aerosolIndex}

Citizen reports nearby:
${environmentalData.citizenReports}

Determine whether this represents a likely localized pollution event.

Return ONLY valid JSON in exactly this structure:

{
  "eventDetected": true,
  "eventType": "Industrial emission",
  "severity": "HIGH",
  "confidence": 0.91,
  "summary": "Short explanation",
  "recommendedAction": "Short recommended authority action"
}

Do not use markdown.
`;

      const result = await model.generateContent([
        prompt,
        base64Image,
      ]);

      const text = result.response.text();

      const cleaned = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(cleaned);

      setAnalysis(parsed);
    } catch (error) {
      console.error(error);
      setAnalysisError(
        "Gemini could not analyze this image. Check that VITE_GEMINI_API_KEY in .env is a valid key, then restart the dev server."
      );
    } finally {
      setLoading(false);
    }
  };

  const createAlert = () => {
    setAlertCreated(true);
  };

  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">
        <div>
          <h1>🌍 VayuRakshak</h1>
          <p>AI-powered Hyperlocal Climate Intelligence</p>
        </div>

        <div className="india-badge">
          🇮🇳 INDIA
        </div>
      </header>

      {/* STATS */}
      <section className="stats">

        <div className="stat-card">
          <span>🔴</span>
          <div>
            <small>Critical Hotspots</small>
            <strong>3</strong>
          </div>
        </div>

        <div className="stat-card">
          <span>🟠</span>
          <div>
            <small>High Risk</small>
            <strong>7</strong>
          </div>
        </div>

        <div className="stat-card">
          <span>👥</span>
          <div>
            <small>Citizen Reports</small>
            <strong>124</strong>
          </div>
        </div>

        <div className="stat-card">
          <span>🛰️</span>
          <div>
            <small>Satellite Signals</small>
            <strong>42</strong>
          </div>
        </div>

      </section>

      {/* MAIN GRID */}
      <main className="main-grid">

        {/* LEFT */}
        <section className="panel map-panel">

          <div className="panel-header">
            <div>
              <h2>Pollution Intelligence Map</h2>
              <p>Hyperlocal environmental events across India</p>
            </div>
          </div>

          <div className="map">

            <div className="india-shape">
              🇮🇳
            </div>

            <div className="map-marker delhi">
              🔴
              <span>Delhi NCR</span>
            </div>

            <div className="map-marker mumbai">
              🟠
              <span>Mumbai</span>
            </div>

            <div className="map-marker bengaluru">
              🔴
              <span>Peenya</span>
            </div>

            <div className="map-marker hyderabad">
              🟢
              <span>Hyderabad</span>
            </div>

          </div>

        </section>

        {/* RIGHT */}
        <section className="panel report-panel">

          <h2>📸 Report Pollution</h2>

          <p>
            Upload a pollution image and let Gemini analyze
            the environmental event.
          </p>

          <label className="upload-box">

            {preview ? (
              <img src={preview} alt="Pollution report" />
            ) : (
              <>
                <span className="upload-icon">📷</span>
                <strong>Upload pollution image</strong>
                <small>Smoke, burning, dust or industrial emissions</small>
              </>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />

          </label>

          <div className="location">
            📍 Peenya Industrial Area, Bengaluru
          </div>

          <button
            className="primary-button"
            onClick={analyzePollution}
            disabled={loading}
          >
            {loading
              ? "🤖 Gemini analyzing..."
              : "🔍 Analyze with Gemini"}
          </button>

          {analysisError && (
            <p className="analysis-error" role="alert">
              {analysisError}
            </p>
          )}

        </section>

      </main>

      {/* AI RESULT */}
      {analysis && (
        <section className="panel analysis-panel">

          <div className="section-title">
            <div>
              <h2>🤖 AI Pollution Analysis</h2>
              <p>Gemini multimodal environmental assessment</p>
            </div>

            <div className="confidence">
              {(analysis.confidence * 100).toFixed(0)}% confidence
            </div>
          </div>

          <div className="analysis-grid">

            <div className="analysis-card">
              <small>EVENT</small>
              <strong>
                {analysis.eventDetected
                  ? "🚨 Pollution detected"
                  : "✓ No major event"}
              </strong>
            </div>

            <div className="analysis-card">
              <small>PROBABLE SOURCE</small>
              <strong>{analysis.eventType}</strong>
            </div>

            <div className="analysis-card">
              <small>SEVERITY</small>
              <strong className="danger">
                {analysis.severity}
              </strong>
            </div>

            <div className="analysis-card">
              <small>CITIZEN REPORTS</small>
              <strong>{environmentalData.citizenReports}</strong>
            </div>

          </div>

          <div className="evidence">

            <h3>Why was this hotspot detected?</h3>

            <div className="evidence-list">

              <span>✓ Citizen smoke report</span>
              <span>
                ✓ PM2.5: {environmentalData.sensor.pm25}
              </span>
              <span>
                ✓ NO2: {environmentalData.sensor.no2}
              </span>
              <span>
                ✓ Satellite NO2 anomaly: +
                {environmentalData.satellite.no2Anomaly}%
              </span>
              <span>
                ✓ Low wind speed:{" "}
                {environmentalData.weather.windSpeed} m/s
              </span>

            </div>

            <p className="summary">
              {analysis.summary}
            </p>

          </div>

        </section>
      )}

      {/* FORECAST */}
      <section className="panel">

        <div className="section-title">
          <div>
            <h2>📈 Air Quality Risk Forecast</h2>
            <p>Prototype AI-assisted environmental forecast</p>
          </div>

          <div className="risk-badge">
            HIGH RISK
          </div>
        </div>

        <div className="forecast">

          <Forecast
            label="NOW"
            value={environmentalData.forecast.current}
            emoji="🟠"
          />

          <Forecast
            label="+6 HOURS"
            value={environmentalData.forecast.sixHours}
            emoji="🔴"
          />

          <Forecast
            label="+12 HOURS"
            value={environmentalData.forecast.twelveHours}
            emoji="🔴"
          />

          <Forecast
            label="+24 HOURS"
            value={environmentalData.forecast.twentyFourHours}
            emoji="🟠"
          />

        </div>

      </section>

      {/* AUTHORITY */}
      {analysis && (
        <section className="panel authority-panel">

          <div className="section-title">

            <div>
              <h2>🏛️ Authority Response</h2>
              <p>Convert detection into climate action</p>
            </div>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option>English</option>
              <option>हिंदी</option>
              <option>ಕನ್ನಡ</option>
            </select>

          </div>

          {!alertCreated ? (

            <div className="alert-preview">

              <div>
                <strong>🚨 HIGH PRIORITY POLLUTION EVENT</strong>

                <p>
                  {environmentalData.location}
                </p>

                <p>
                  Probable source: {analysis.eventType}
                </p>

                <p>
                  Recommended action:{" "}
                  {analysis.recommendedAction}
                </p>
              </div>

              <button
                className="alert-button"
                onClick={createAlert}
              >
                🚨 Create Authority Alert
              </button>

            </div>

          ) : (

            <div className="success">

              <div className="success-icon">✓</div>

              <div>
                <h3>Authority Alert Created</h3>

                <p>
                  Pollution event at Peenya Industrial Area
                  has been flagged for field inspection.
                </p>

                <div className="language-tags">
                  <span>English ✓</span>
                  <span>हिंदी ✓</span>
                  <span>ಕನ್ನಡ ✓</span>
                </div>

              </div>

            </div>

          )}

        </section>
      )}

      {/* ARCHITECTURE */}
      <section className="panel architecture">

        <h2>How VayuRakshak Works</h2>

        <div className="pipeline">

          <Pipeline icon="👥" text="Citizen Data" />

          <span>→</span>

          <Pipeline icon="🤖" text="Gemini Vision" />

          <span>→</span>

          <Pipeline icon="🛰️" text="Satellite" />

          <span>→</span>

          <Pipeline icon="🌦️" text="Weather + Sensors" />

          <span>→</span>

          <Pipeline icon="📊" text="Risk Prediction" />

          <span>→</span>

          <Pipeline icon="🏛️" text="Authority Action" />

        </div>

      </section>

    </div>
  );
}

function Forecast({ label, value, emoji }) {
  return (
    <div className="forecast-card">
      <small>{label}</small>
      <div className="forecast-value">{value}</div>
      <div>{emoji}</div>
      <span>AQI</span>
    </div>
  );
}

function Pipeline({ icon, text }) {
  return (
    <div className="pipeline-item">
      <div>{icon}</div>
      <span>{text}</span>
    </div>
  );
}

async function fileToGenerativePart(file) {
  const base64EncodedDataPromise = new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64Data = reader.result.split(",")[1];
      resolve(base64Data);
    };

    reader.onerror = reject;

    reader.readAsDataURL(file);
  });

  const base64EncodedData = await base64EncodedDataPromise;

  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
}

export default App;