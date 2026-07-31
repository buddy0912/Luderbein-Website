import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { onRequest } from "../functions/api/veroeffentlichungsfreigabe.js";

if (!globalThis.crypto) globalThis.crypto = webcrypto;

class MockStatement {
  constructor(db, sql) {
    this.db = db;
    this.sql = sql;
    this.values = [];
  }

  bind(...values) {
    this.values = values;
    return this;
  }

  async run() {
    const placeholderCount = (this.sql.match(/\?/g) || []).length;
    assert.equal(
      this.values.length,
      placeholderCount,
      `SQL placeholder mismatch: expected ${placeholderCount}, got ${this.values.length}`
    );
    this.db.calls.push({ sql: this.sql, values: this.values });
    return { success: true };
  }
}

class MockDb {
  constructor() {
    this.calls = [];
  }

  prepare(sql) {
    return new MockStatement(this, sql);
  }
}

function contextFor(body, db, method = "POST") {
  return {
    request: new Request("https://luderbein-gravur.pages.dev/api/veroeffentlichungsfreigabe", {
      method,
      headers: {
        Origin: "https://luderbein-gravur.pages.dev",
        "Content-Type": "application/json"
      },
      body: method === "POST" ? JSON.stringify(body) : undefined
    }),
    env: {
      ALLOWED_ORIGIN: "https://luderbein-gravur.pages.dev",
      PINBOARD_DB: db
    }
  };
}

const validGrant = {
  action: "grant",
  projectKey: "nachtwaechter-luderboegen-annaberg-buchholz",
  name: "Test Person",
  organization: "Stadt Annaberg-Buchholz",
  role: "Bevollmächtigte Testfunktion",
  email: "test@example.invalid",
  note: "",
  selections: {
    website: true,
    socialMedia: false,
    digitalPortfolio: true,
    printMaterials: false,
    nameClient: true,
    anonymous: false,
    projectStory: true,
    eventPhotos: false
  },
  rightsAuthority: true,
  personsConsent: true,
  releaseConfirmed: true,
  privacyConsent: true
};

const db = new MockDb();
const grantResponse = await onRequest(contextFor(validGrant, db));
assert.equal(grantResponse.status, 201);
const grantBody = await grantResponse.json();
assert.match(grantBody.referenceCode, /^VF-/);
assert.equal(grantBody.declarationVersion, "VF-ENTWURF-2026-07-31");
const pdfText = Buffer.from(grantBody.download.contentBase64, "base64").toString("latin1");
assert.equal(pdfText.slice(0, 8), "%PDF-1.4");
const pageCount = Number(pdfText.match(/\/Type \/Pages \/Count (\d+)/)?.[1] || 0);
assert.ok(pageCount > 0 && pageCount <= 2, `expected one or two PDF pages, got ${pageCount}`);
const insertCall = db.calls.find((call) =>
  call.sql.includes("INSERT INTO publication_release_confirmations")
);
assert.ok(insertCall);
assert.ok(
  insertCall.values.some(
    (value) =>
      typeof value === "string" &&
      value.includes("Umfang des eingeräumten Rechts") &&
      value.includes("Ein Widerruf wirkt für die Zukunft")
  ),
  "stored confirmation must include scope and withdrawal text"
);

const missingChannelResponse = await onRequest(
  contextFor(
    {
      ...validGrant,
      selections: {
        ...validGrant.selections,
        website: false,
        digitalPortfolio: false
      }
    },
    new MockDb()
  )
);
assert.equal(missingChannelResponse.status, 400);

const conflictingNamingResponse = await onRequest(
  contextFor(
    {
      ...validGrant,
      selections: {
        ...validGrant.selections,
        anonymous: true
      }
    },
    new MockDb()
  )
);
assert.equal(conflictingNamingResponse.status, 400);

const withdrawalDb = new MockDb();
const withdrawalResponse = await onRequest(
  contextFor(
    {
      action: "withdraw",
      referenceCode: grantBody.referenceCode,
      email: validGrant.email
    },
    withdrawalDb
  )
);
assert.equal(withdrawalResponse.status, 202);
assert.ok(
  withdrawalDb.calls.some((call) =>
    call.sql.includes("UPDATE publication_release_confirmations")
  )
);

const healthResponse = await onRequest(contextFor(null, new MockDb(), "GET"));
assert.equal(healthResponse.status, 200);
const healthBody = await healthResponse.json();
assert.equal(healthBody.draft, true);

console.log("publication release tests: ok");
