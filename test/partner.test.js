"use strict";
// INSTRUCTOR ANSWER KEY for Lab 2 (Session 5) — the test that proves '../' is dead.
// Copy to test/partner.test.js. Red on the vulnerable route (it answers 404/200),
// green once the route takes an id instead of a path (it answers 400).
const test = require("node:test");
const assert = require("node:assert");
const app = require("../src/app");

const KEY = process.env.PARTNER_API_KEY || "pk_live_lab_demo";

async function get(query) {
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  try {
    const res = await fetch(`http://127.0.0.1:${server.address().port}/partner/invoices${query}&key=${KEY}`);
    return res.status;
  } finally {
    server.close();
  }
}

test("partner route rejects traversal", async () => {
  assert.strictEqual(await get("?file=../x"), 400);
  assert.strictEqual(await get("?file=../globex/inv-7.pdf"), 400);
});

test("partner route rejects a non-numeric id", async () => {
  assert.strictEqual(await get("?id=../x"), 400);
});
