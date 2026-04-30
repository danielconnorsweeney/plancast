function ForecastList({ dailyForecast }) {
  if (dailyForecast.length === 0) {
    return null;
  }

  return (
    <div className="forecast-section">
      <p className="section-label">5-day forecast</p>

      <div className="forecast-grid">
        {dailyForecast.map((day) => (
          <article className="forecast-card" key={day.date}>
            <h4>
              {new Date(`${day.date}T00:00`).toLocaleDateString("en-CA", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </h4>
            <p>{day.condition}</p>
            <div>
              <span>High</span>
              <strong>{day.high}°C</strong>
            </div>
            <div>
              <span>Low</span>
              <strong>{day.low}°C</strong>
            </div>
            <div>
              <span>Rain chance</span>
              <strong>{day.precipitationChance}%</strong>
            </div>
            <div>
              <span>Precipitation</span>
              <strong>{day.precipitation} mm</strong>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default ForecastList;
