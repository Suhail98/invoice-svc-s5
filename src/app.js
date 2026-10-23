"use strict";
const express = require("express");
const { port } = require("./config");
const { exportHandler } = require("./export");
const { partnerRouter } = require("./partner");

// SAST triage: no CSRF middleware on purpose. This is a JSON API authenticated by a
// header/query key, with no cookies or sessions for a forged request to ride on.
// nosemgrep: javascript.express.security.audit.express-check-csurf-middleware-usage.express-check-csurf-middleware-usage
const app = express();
const helmet = require('helmet'); app.use(helmet())
app.use(express.json());

// Home page. The release-builds link is how the team grabs old builds from web-01.
const HOME = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>invoice-svc</title></head>
<body>
  <h1>Acme invoice service</h1>
  <ul>
    <li><a href="/health">health</a> · <a href="/version">version</a></li>
    <li>Release builds for the team: <a href="/releases/">/releases/</a></li>
  </ul>
</body>
</html>
`;
app.get("/", (_req, res) => res.type("html").send(HOME));

app.get("/version", (_req, res) =>
  res.json({ service: "invoice-svc", version: process.env.APP_VERSION || "dev" }));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.get("/invoices/export", exportHandler);
app.post("/invoices/export", exportHandler);

// Partner invoice API (Session 5). The route inside is deliberately vulnerable
// to path traversal — that is INC-0492, fixed in Lab 2.
app.use("/partner", partnerRouter);

if (require.main === module || process.env.APP_START === "1") {
  app.listen(port, () => console.log(`invoice-svc listening on :${port}`));
}

module.exports = app;
