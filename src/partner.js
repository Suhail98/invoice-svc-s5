"use strict";
// INSTRUCTOR ANSWER KEY for Lab 2 (Session 5) — the fixed partner route.
//
// The fix is not to "sanitize" the path — it is to stop taking a path at all.
// Accept an invoice id (a positive integer, nothing else -> 400), map it to the one
// file name it can mean, and let Express serve it with `root: BASE` (send refuses any
// path that resolves outside root). No path is ever built from the request, so the
// Semgrep taint flow is gone (0 findings with --config auto and with .semgrep.yml).
const express = require("express");

const BASE = process.env.PARTNER_BASE || "/srv/invoices/partner-acme";
const PARTNER_API_KEY = process.env.PARTNER_API_KEY || "pk_live_lab_demo";

const router = express.Router();
router.use(keyGate); // key check + PARTNER_API feature flag (defined below)

// GET /partner/invoices?id=<n>   — look up by id, never by path
router.get("/invoices", (req, res) => {
  const id = Number(req.query.id);
  if (!Number.isInteger(id) || id <= 0) return res.sendStatus(400); // ?file=../x -> 400
  res.sendFile(`inv-${id}.pdf`, { root: BASE });                     // stays under BASE
});

// GET /partner/export   — bulk export (key-gated lab stub)
router.get("/export", (_req, res) =>
  res.type("application/json").send(JSON.stringify({ partner: "acme", invoices: 128, note: "lab stub" })));

// a missing invoice -> plain 404 (no stack trace, no file path in the response)
router.use((err, _req, res, _next) => res.sendStatus(err.status || 500));

// key gate + feature flag (Session 5 containment switches PARTNER_API=off)
function keyGate(req, res, next) {
  const key = req.get("x-partner-key") || (req.query && req.query.key);
  if (key !== PARTNER_API_KEY) return res.status(401).type("text/plain").send("invalid partner key");
  if (String(process.env.PARTNER_API || "on").toLowerCase() === "off")
    return res.status(503).type("text/plain").send("Partner API is temporarily disabled.");
  next();
}

module.exports = { partnerRouter: router };
