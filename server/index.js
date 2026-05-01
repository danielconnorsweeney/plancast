import express from "express";
import cors from "cors";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (request, response) => {
    response.send("PlanCast API is running");
});

app.get("/api/health", (request, response) => {
    response.json({
        status: "ok",
        message: "PlanCast backend is running",
    });
});

app.get("/api/weather", async (request, response) => {
    const { latitude, longitude } = request.query;

    if (!latitude || !longitude) {
        return response.status(400).json({
            message: "Latitude and longitude are required",
        });
    }

    try {
        const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,precipitation,rain,showers,snowfall,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto&forecast_days=5`,
        );

        if (!weatherResponse.ok) {
            throw new Error("Open-Meteo weather request failed.");
        }

        const weatherData = await weatherResponse.json();

        response.json(weatherData);
    }   catch {
        response.status(500).json({
            message: "Unable to load weather data.",
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});