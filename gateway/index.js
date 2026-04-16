const express = require("express");
const rateLimit = require("express-rate-limit");

const app = express();
app.use(express.json());

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: "Too many requests, please slow down" },
});
app.use(limiter);

const AUTH = "http://auth-service:4500";
const SERVICE_A = "http://service-a:3001";
const SERVICE_B = "http://service-b:3002";
const DASHBOARD = "http://dashboard:5000";

const verifyToken = async (req, res, next) => {
  try {
    const authRes = await fetch(`${AUTH}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.authorization || "",
      },
    });
    const d = await authRes.json();
    if (!d.valid) return res.status(401).json({ error: "Unauthorized" });
    next();
  } catch(err) {
    res.status(500).json({ error: "Error", details: err.message });
  }
};

const forward = async (req, res, url) => {
  try {
    const response = await fetch(url, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.authorization || "",
      },
      body: req.method === "GET" ? undefined : JSON.stringify(req.body),
    });
    const d = await response.json();
    res.status(response.status).json(d);
  } catch (err) {
     res.status(500).json({ error: "Error", details: err.message })  }
};

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/auth/login", (req, res) => {
  forward(req, res, `${AUTH}/login`);
});

app.post("/log/a", verifyToken, (req, res) => {
  forward(req, res, `${SERVICE_A}/log`);
});

app.post("/log/b", verifyToken, (req, res) => {
  forward(req, res, `${SERVICE_B}/log`);
});

app.get("/stats", verifyToken, (req, res) => {
  forward(req, res, `${DASHBOARD}/stats`);
});

app.listen(8080, () => {
  console.log("API Gateway running on port 8080");
});