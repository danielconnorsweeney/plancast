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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});