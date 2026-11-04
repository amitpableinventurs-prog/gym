import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, before, beforeEach, describe, it } from "node:test";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import request from "supertest";
import type { Application } from "express";

// Runs against a real MongoDB because the rules under test rely on its unique
// indexes and atomic updates. The database is dropped, so it must be a test one.
const MONGO_URI = process.env.TEST_MONGO_URI || "mongodb://127.0.0.1:27017/gym_management_test";
if (!/_test(\?|$)/.test(MONGO_URI)) {
  throw new Error("TEST_MONGO_URI must point to a database whose name ends in _test");
}

const keyDir = fs.mkdtempSync(path.join(os.tmpdir(), "gym-keys-"));
const keys = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});
process.env.PRIVATE_KEY_PATH = path.join(keyDir, "private.pem");
process.env.PUBLIC_KEY_PATH = path.join(keyDir, "public.pem");
fs.writeFileSync(process.env.PRIVATE_KEY_PATH, keys.privateKey);
fs.writeFileSync(process.env.PUBLIC_KEY_PATH, keys.publicKey);

// Loaded after the key paths are set: controllers read them on import.
/* eslint-disable @typescript-eslint/no-require-imports */
const app: Application = require("../src/app").default;
const User = require("../src/models/User").default;
const { Membership } = require("../src/models/Membership");
const { MembershipPlan } = require("../src/models/MembershipPlan");
const { Workout } = require("../src/models/workout.model");
const { Attendance } = require("../src/models/Attendance");

interface Account {
  id: string;
  token: string;
  email: string;
}

const PASSWORD = "Secret123!";
const SLOTS = ["09:00 AM", "10:00 AM", "11:00 AM", "05:00 PM"];
const passwordHash = bcrypt.hashSync(PASSWORD, 4);
let accountCount = 0;

const api = (account?: Account) => {
  const withAuth = (test: request.Test) =>
    account ? test.set("Authorization", `Bearer ${account.token}`) : test;
  return {
    get: (url: string) => withAuth(request(app).get(`/api${url}`)),
    post: (url: string, body: object = {}) => withAuth(request(app).post(`/api${url}`)).send(body),
    put: (url: string, body: object = {}) => withAuth(request(app).put(`/api${url}`)).send(body),
    patch: (url: string, body: object = {}) => withAuth(request(app).patch(`/api${url}`)).send(body),
    delete: (url: string) => withAuth(request(app).delete(`/api${url}`)),
  };
};

// Hashing is deliberately slow, so accounts share one hash and sign their own token.
const createAccount = async (role: "client" | "coach" | "admin" = "client"): Promise<Account> => {
  accountCount += 1;
  const email = `user${accountCount}@example.com`;
  const user = await User.create({
    firstName: "Test",
    lastName: `User${accountCount}`,
    email,
    password: passwordHash,
    isCoach: role === "coach",
    isAdmin: role === "admin",
    target: "Lose weight",
    activity: "Yoga",
    timeSlots: role === "coach" ? SLOTS : [],
  });
  const id = String(user._id);
  return { id, email, token: jwt.sign({ id }, keys.privateKey, { algorithm: "RS256", expiresIn: "1h" }) };
};

const createPlan = (overrides: object = {}) =>
  MembershipPlan.create({ name: `Plan ${++accountCount}`, price: 2000, durationDays: 30, ...overrides });

const giveMembership = async (client: Account, admin: Account, overrides: object = {}) => {
  const plan = await createPlan(overrides);
  const response = await api(admin).post("/admin/memberships", {
    userId: client.id,
    planId: plan._id,
    method: "CASH",
  });
  assert.equal(response.status, 201);
  return response.body.membership;
};

const futureDate = (daysAhead: number) => {
  const date = new Date(Date.now() + daysAhead * 86_400_000);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const book = (client: Account, coach: Account, daysAhead = 2, time = "10:00 AM") =>
  api(client).post("/workouts/book", {
    coachId: coach.id,
    date: futureDate(daysAhead),
    time,
    activity: "Yoga",
  });

describe("gym management API", () => {
  let admin: Account;
  let coach: Account;
  let client: Account;

  before(async () => {
    await mongoose.connect(MONGO_URI);
    await mongoose.connection.dropDatabase();
    await Promise.all(Object.values(mongoose.models).map((model) => model.syncIndexes()));
  });

  beforeEach(async () => {
    await Promise.all(
      Object.values(mongoose.connection.collections).map((collection) => collection.deleteMany({}))
    );
    [admin, coach, client] = await Promise.all([
      createAccount("admin"),
      createAccount("coach"),
      createAccount(),
    ]);
  });

  after(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    fs.rmSync(keyDir, { recursive: true, force: true });
  });

  describe("access control", () => {
    it("registers a member and signs them in", async () => {
      const email = "new.member@example.com";
      const registered = await api().post("/users/register", {
        firstName: "New",
        lastName: "Member",
        email,
        password: PASSWORD,
        isCoach: false,
        target: "Lose weight",
        activity: "Yoga",
      });
      assert.equal(registered.status, 201);

      const login = await api().post("/users/login", { email, password: PASSWORD });
      assert.equal(login.status, 200);
      const token = login.body.token as string;
      const me = await api({ id: login.body.userData.id, token, email }).get("/memberships/me");
      assert.equal(me.status, 200);
    });

    it("never exposes password hashes or emails in public coach listings", async () => {
      const listed = await api().get("/users/coach");
      assert.equal(listed.status, 200);
      assert.equal(listed.body.coach.length, 1);
      assert.equal(listed.body.coach[0].password, undefined);
      assert.equal(listed.body.coach[0].email, undefined);

      const filtered = await api().post("/users/filter", { activity: "All", time: "All", coach: "All" });
      assert.equal(filtered.body[0].password, undefined);
    });

    it("requires a token for workouts and hides other members' workouts", async () => {
      assert.equal((await api().get(`/workouts/${client.id}/false`)).status, 401);
      assert.equal((await api().post("/workouts/book", {})).status, 401);

      const other = await createAccount();
      assert.equal((await api(other).get(`/workouts/${client.id}/false`)).status, 403);
      assert.equal((await api(client).get(`/workouts/${client.id}/false`)).status, 200);
    });

    it("stops one member changing another member's password", async () => {
      const other = await createAccount();
      const response = await api(other).put(`/users/change-password/${client.id}`, {
        oldPassword: PASSWORD,
        newPassword: "Another123!",
      });
      assert.equal(response.status, 403);
    });

    it("rejects non-admins on every admin route family", async () => {
      for (const url of ["/admin/overview", "/admin/members", "/admin/payments", "/admin/plans"]) {
        assert.equal((await api(client).get(url)).status, 403, url);
      }
    });

    it("locks out a suspended member, including tokens already issued", async () => {
      const suspended = await api(admin).patch(`/admin/members/${client.id}/suspension`, {
        suspended: true,
        reason: "Unpaid dues",
      });
      assert.equal(suspended.status, 200);

      const live = await api(client).get("/memberships/me");
      assert.equal(live.status, 403);
      assert.equal(live.body.code, "ACCOUNT_SUSPENDED");
      assert.equal((await api().post("/users/login", { email: client.email, password: PASSWORD })).status, 403);

      await api(admin).patch(`/admin/members/${client.id}/suspension`, { suspended: false });
      assert.equal((await api(client).get("/memberships/me")).status, 200);
    });

    it("refuses to suspend an administrator", async () => {
      const otherAdmin = await createAccount("admin");
      const response = await api(admin).patch(`/admin/members/${otherAdmin.id}/suspension`, { suspended: true });
      assert.equal(response.status, 400);
    });

    it("hides suspended coaches from booking", async () => {
      await giveMembership(client, admin);
      await api(admin).patch(`/admin/members/${coach.id}/suspension`, { suspended: true });
      assert.equal((await book(client, coach)).status, 404);
      assert.equal((await api().get("/users/coach")).body.coach.length, 0);
    });
  });

  describe("plans", () => {
    it("lists only active plans publicly and keeps sold terms when a plan changes", async () => {
      const created = await api(admin).post("/admin/plans", {
        name: "Gold",
        price: 3000,
        durationDays: 30,
        sessionLimit: 5,
      });
      assert.equal(created.status, 201);
      assert.equal((await api(admin).post("/admin/plans", { name: "Gold", price: 1, durationDays: 1 })).status, 409);

      const request1 = await api(client).post("/memberships/request", { planId: created.body._id });
      assert.equal(request1.status, 201);

      const updated = await api(admin).put(`/admin/plans/${created.body._id}`, {
        name: "Gold",
        price: 9999,
        durationDays: 30,
        isActive: false,
      });
      assert.equal(updated.status, 200);

      assert.equal((await api().get("/memberships/plans")).body.length, 0);
      const summary = await api(client).get("/memberships/me");
      assert.equal(summary.body.pending.price, 3000);
      assert.equal(summary.body.pending.sessionLimit, 5);
    });

    it("validates plan input", async () => {
      assert.equal((await api(admin).post("/admin/plans", { name: "X", price: -1, durationDays: 0 })).status, 400);
    });
  });

  describe("membership lifecycle", () => {
    it("takes a member from request to active with one invoice", async () => {
      const plan = await createPlan({ price: 1500 });

      const requested = await api(client).post("/memberships/request", { planId: plan._id });
      assert.equal(requested.status, 201);
      assert.equal(requested.body.status, "PENDING");
      assert.equal((await api(client).post("/memberships/request", { planId: plan._id })).status, 409);

      const activation = () =>
        api(admin).post(`/admin/memberships/${requested.body.id}/activate`, { method: "UPI", reference: "UTR1" });
      const results = await Promise.all([activation(), activation()]);
      assert.deepEqual(results.map((result) => result.status).sort(), [200, 409]);

      const summary = await api(client).get("/memberships/me");
      assert.equal(summary.body.current.status, "ACTIVE");
      assert.equal(summary.body.current.daysRemaining, 30);

      const payments = await api(client).get("/memberships/me/payments");
      assert.equal(payments.body.length, 1);
      assert.equal(payments.body[0].amount, 1500);
      assert.match(payments.body[0].invoiceNumber, /^INV-\d{4}-000001$/);
    });

    it("applies a discounted amount without changing the plan price", async () => {
      const plan = await createPlan({ price: 1500 });
      const response = await api(admin).post("/admin/memberships", {
        userId: client.id,
        planId: plan._id,
        method: "CASH",
        amount: 1000,
      });
      assert.equal(response.body.payment.amount, 1000);
      assert.equal(response.body.membership.price, 1500);
    });

    it("lets a member withdraw a pending request but not someone else's", async () => {
      const plan = await createPlan();
      const requested = await api(client).post("/memberships/request", { planId: plan._id });
      const other = await createAccount();

      assert.equal((await api(other).post(`/memberships/${requested.body.id}/withdraw`)).status, 404);
      assert.equal((await api(client).post(`/memberships/${requested.body.id}/withdraw`)).status, 200);
      assert.equal((await api(client).post("/memberships/request", { planId: plan._id })).status, 201);
    });

    it("does not sell memberships to coaches", async () => {
      const plan = await createPlan();
      assert.equal((await api(coach).post("/memberships/request", { planId: plan._id })).status, 400);
    });

    it("starts a renewal when the current term ends", async () => {
      const first = await giveMembership(client, admin);
      const second = await giveMembership(client, admin);

      assert.equal(second.status, "UPCOMING");
      assert.equal(second.startDate, first.endDate);

      const summary = await api(client).get("/memberships/me");
      assert.equal(summary.body.current.id, first.id);
      assert.equal(summary.body.upcoming.length, 1);
    });

    it("reports an elapsed membership as expired and blocks booking", async () => {
      const membership = await giveMembership(client, admin);
      await Membership.updateOne(
        { _id: membership.id },
        { startDate: new Date(Date.now() - 40 * 86_400_000), endDate: new Date(Date.now() - 86_400_000) }
      );

      const summary = await api(client).get("/memberships/me");
      assert.equal(summary.body.current, null);
      assert.equal(summary.body.history[0].status, "EXPIRED");
      assert.equal((await book(client, coach)).body.code, "MEMBERSHIP_REQUIRED");
    });

    it("freezes, cancels upcoming sessions, then gives the paused days back", async () => {
      const membership = await giveMembership(client, admin, { sessionLimit: 4 });
      const renewal = await giveMembership(client, admin);
      assert.equal((await book(client, coach)).status, 201);

      const frozen = await api(admin).post(`/admin/memberships/${membership.id}/freeze`);
      assert.equal(frozen.status, 200);
      assert.equal(frozen.body.cancelledSessions, 1);
      assert.equal(frozen.body.membership.sessionsUsed, 0);
      assert.equal((await book(client, coach)).body.code, "MEMBERSHIP_FROZEN");

      const checkIn = await api(admin).post("/admin/attendance/check-in", { userId: client.id });
      assert.equal(checkIn.body.code, "MEMBERSHIP_FROZEN");

      await Membership.updateOne({ _id: membership.id }, { frozenAt: new Date(Date.now() - 5 * 86_400_000) });
      const resumed = await api(admin).post(`/admin/memberships/${membership.id}/unfreeze`);
      assert.equal(resumed.status, 200);
      assert.equal(resumed.body.frozenDays, 5);
      const extension = new Date(resumed.body.endDate).getTime() - new Date(membership.endDate).getTime();
      assert.ok(Math.abs(extension - 5 * 86_400_000) < 60_000, `extended by ${extension}ms`);

      const movedRenewal = await Membership.findById(renewal.id);
      assert.equal(movedRenewal.startDate.getTime(), new Date(resumed.body.endDate).getTime());
    });

    it("cancelling a membership releases its upcoming sessions", async () => {
      const membership = await giveMembership(client, admin);
      const booked = await book(client, coach);

      const cancelled = await api(admin).post(`/admin/memberships/${membership.id}/cancel`, { reason: "Moved away" });
      assert.equal(cancelled.status, 200);
      assert.equal(cancelled.body.cancelledSessions, 1);
      assert.equal((await Workout.findById(booked.body.workout._id)).status, "CANCELLED");
      assert.equal((await api(admin).post(`/admin/memberships/${membership.id}/cancel`, { reason: "Again" })).status, 409);
    });
  });

  describe("booking", () => {
    it("requires an active membership", async () => {
      const response = await book(client, coach);
      assert.equal(response.status, 403);
      assert.equal(response.body.code, "MEMBERSHIP_REQUIRED");
    });

    it("ignores a client ID and status supplied by the caller", async () => {
      await giveMembership(client, admin);
      const other = await createAccount();
      const response = await api(client).post("/workouts/book", {
        coachId: coach.id,
        userId: other.id,
        status: "FINISHED",
        date: futureDate(2),
        time: "10:00 AM",
        activity: "Yoga",
      });
      assert.equal(response.status, 201);
      assert.equal(response.body.workout.userId, client.id);
      assert.equal(response.body.workout.status, "SCHEDULED");
    });

    it("rejects past dates, unoffered times, and dates beyond the membership", async () => {
      await giveMembership(client, admin);
      assert.equal((await book(client, coach, -1)).status, 400);
      assert.equal((await book(client, coach, 2, "03:00 AM")).status, 400);

      const outside = await book(client, coach, 45);
      assert.equal(outside.status, 403);
      assert.equal(outside.body.code, "MEMBERSHIP_DATE_NOT_COVERED");
    });

    it("enforces the session limit and returns a session on cancel", async () => {
      const membership = await giveMembership(client, admin, { sessionLimit: 2 });
      const first = await book(client, coach, 2, "09:00 AM");
      assert.equal(first.status, 201);
      assert.equal((await book(client, coach, 2, "10:00 AM")).status, 201);

      const blocked = await book(client, coach, 2, "11:00 AM");
      assert.equal(blocked.status, 403);
      assert.equal(blocked.body.code, "SESSION_LIMIT_REACHED");

      const cancel = () =>
        api(client).patch(`/workouts/${first.body.workout._id}/status`, { status: "CANCELLED" });
      assert.equal((await cancel()).status, 200);
      assert.equal((await cancel()).status, 409);
      assert.equal((await Membership.findById(membership.id)).sessionsUsed, 1);
      assert.equal((await book(client, coach, 2, "11:00 AM")).status, 201);
    });

    it("makes a cancelled slot bookable again", async () => {
      await giveMembership(client, admin);
      const first = await book(client, coach);
      await api(client).patch(`/workouts/${first.body.workout._id}/status`, { status: "CANCELLED" });
      assert.equal((await book(client, coach)).status, 201);
    });

    it("gives a contested slot to exactly one member and charges only them", async () => {
      const rival = await createAccount();
      const mine = await giveMembership(client, admin);
      const theirs = await giveMembership(rival, admin);

      const results = await Promise.all([book(client, coach), book(rival, coach)]);
      assert.deepEqual(results.map((result) => result.status).sort(), [201, 409]);

      const used = await Membership.find({ _id: { $in: [mine.id, theirs.id] } });
      assert.equal(used.reduce((sum: number, item: { sessionsUsed: number }) => sum + item.sessionsUsed, 0), 1);
    });

    it("never oversells the last session under concurrent bookings", async () => {
      const membership = await giveMembership(client, admin, { sessionLimit: 1 });
      const results = await Promise.all(SLOTS.map((time) => book(client, coach, 3, time)));
      assert.equal(results.filter((result) => result.status === 201).length, 1);
      assert.equal((await Membership.findById(membership.id)).sessionsUsed, 1);
    });

    it("stops outsiders cancelling and clients cancelling after the start", async () => {
      await giveMembership(client, admin);
      const booked = await book(client, coach);
      const id = booked.body.workout._id;

      const other = await createAccount();
      assert.equal((await api(other).patch(`/workouts/${id}/status`, { status: "CANCELLED" })).status, 403);
      assert.equal((await api(client).patch(`/workouts/${id}/status`, { status: "NONSENSE" })).status, 400);

      await Workout.updateOne({ _id: id }, { date: futureDate(-1) });
      assert.equal((await api(client).patch(`/workouts/${id}/status`, { status: "CANCELLED" })).status, 400);
      assert.equal((await api(admin).post(`/admin/bookings/${id}/cancel`)).status, 200);
    });

    it("will not open feedback before a session has started", async () => {
      await giveMembership(client, admin);
      const booked = await book(client, coach);
      const response = await api(client).patch(`/workouts/${booked.body.workout._id}/waiting-for-feedback`);
      assert.equal(response.status, 409);
    });
  });

  describe("attendance", () => {
    it("checks a member in and out once per visit", async () => {
      assert.equal(
        (await api(admin).post("/admin/attendance/check-in", { userId: client.id })).body.code,
        "MEMBERSHIP_REQUIRED"
      );

      await giveMembership(client, admin);
      const visit = await api(admin).post("/admin/attendance/check-in", { userId: client.id });
      assert.equal(visit.status, 201);
      assert.equal((await api(admin).post("/admin/attendance/check-in", { userId: client.id })).status, 409);

      const list = await api(admin).get("/admin/attendance");
      assert.equal(list.body.inside, 1);

      assert.equal((await api(admin).post(`/admin/attendance/${visit.body._id}/check-out`)).status, 200);
      assert.equal((await api(admin).post(`/admin/attendance/${visit.body._id}/check-out`)).status, 409);
      assert.equal((await api(admin).post("/admin/attendance/check-in", { userId: client.id })).status, 201);

      const mine = await api(client).get("/memberships/me/attendance");
      assert.equal(mine.body.totalVisits, 2);
    });

    it("closes a forgotten visit from an earlier day on the next check-in", async () => {
      await giveMembership(client, admin);
      const stale = await Attendance.create({
        userId: client.id,
        checkInAt: new Date(Date.now() - 2 * 86_400_000),
        recordedBy: admin.id,
      });

      assert.equal((await api(admin).post("/admin/attendance/check-in", { userId: client.id })).status, 201);
      const closed = await Attendance.findById(stale._id);
      assert.equal(closed.isOpen, false);
      assert.equal(closed.autoClosed, true);
    });

    it("lets coaches check in without a membership", async () => {
      assert.equal((await api(admin).post("/admin/attendance/check-in", { userId: coach.id })).status, 201);
    });
  });

  describe("payments and reporting", () => {
    it("counts refunds out of revenue and refuses a double refund", async () => {
      await giveMembership(client, admin, { price: 2000 });
      const overview = await api(admin).get("/admin/overview");
      assert.equal(overview.body.metrics.revenueThisMonth, 2000);
      assert.equal(overview.body.metrics.activeMembers, 1);
      assert.equal(overview.body.revenueByMonth.length, 6);
      assert.equal(overview.body.revenueByMonth[5].total, 2000);

      const payments = await api(admin).get("/admin/payments");
      const id = payments.body.items[0]._id;
      assert.equal((await api(admin).post(`/admin/payments/${id}/refund`, { reason: "Duplicate" })).status, 200);
      assert.equal((await api(admin).post(`/admin/payments/${id}/refund`, { reason: "Duplicate" })).status, 409);

      const after = await api(admin).get("/admin/overview");
      assert.equal(after.body.metrics.revenueThisMonth, 0);
    });

    it("issues unique invoice numbers under concurrency", async () => {
      const members = await Promise.all([createAccount(), createAccount(), createAccount()]);
      await Promise.all(members.map((member) => giveMembership(member, admin)));
      const payments = await api(admin).get("/admin/payments");
      const numbers = payments.body.items.map((item: { invoiceNumber: string }) => item.invoiceNumber);
      assert.equal(new Set(numbers).size, 3);
    });

    it("flags expiring members unless they have already renewed", async () => {
      await giveMembership(client, admin, { durationDays: 5 });
      assert.equal((await api(admin).get("/admin/overview")).body.metrics.expiringSoon, 1);

      await giveMembership(client, admin);
      assert.equal((await api(admin).get("/admin/overview")).body.metrics.expiringSoon, 0);
    });

    it("filters the member list by search and membership", async () => {
      await giveMembership(client, admin);
      await createAccount();

      const active = await api(admin).get("/admin/members?membership=active");
      assert.equal(active.body.total, 1);
      assert.equal(active.body.items[0].membership.status, "ACTIVE");
      assert.equal(active.body.items[0].password, undefined);

      const none = await api(admin).get("/admin/members?membership=none");
      assert.equal(none.body.total, 1);

      const search = await api(admin).get(`/admin/members?search=${encodeURIComponent(client.email)}`);
      assert.equal(search.body.total, 1);
      assert.equal((await api(admin).get("/admin/members?search=(")).status, 200);
    });

    it("returns a full member profile", async () => {
      await giveMembership(client, admin);
      const profile = await api(admin).get(`/admin/members/${client.id}`);
      assert.equal(profile.status, 200);
      assert.equal(profile.body.payments.length, 1);
      assert.equal(profile.body.user.password, undefined);
    });
  });

  describe("reviews", () => {
    const finishedSession = async () => {
      await giveMembership(client, admin);
      const booked = await book(client, coach);
      const id = booked.body.workout._id;
      await Workout.updateOne({ _id: id }, { date: futureDate(-1) });
      assert.equal((await api(client).patch(`/workouts/${id}/waiting-for-feedback`)).status, 200);
      return id;
    };

    it("accepts one review per session from a participant, under their real name", async () => {
      const workoutId = await finishedSession();
      const body = { workoutId, rating: 5, feedback: "Great session", firstName: "Fake", coachId: "x" };

      assert.equal((await api().post("/testimonials", body)).status, 401);
      const outsider = await createAccount();
      assert.equal((await api(outsider).post("/testimonials", body)).status, 403);

      assert.equal((await api(client).post("/testimonials", body)).status, 201);
      assert.equal((await api(client).post("/testimonials", body)).status, 409);
      assert.equal((await api(client).patch(`/workouts/${workoutId}/status`, { status: "FINISHED" })).status, 200);

      const listed = await api().get(`/testimonials/${coach.id}`);
      assert.equal(listed.body[coach.id].length, 1);
      assert.equal(listed.body[coach.id][0].firstName, "Test");
    });

    it("rejects a review for a session that has not happened", async () => {
      await giveMembership(client, admin);
      const booked = await book(client, coach);
      const response = await api(client).post("/testimonials", {
        workoutId: booked.body.workout._id,
        rating: 5,
        feedback: "Too early",
      });
      assert.equal(response.status, 409);
    });

    it("lets an admin remove a review", async () => {
      const workoutId = await finishedSession();
      await api(client).post("/testimonials", { workoutId, rating: 1, feedback: "Spam spam" });

      const listed = await api(admin).get("/admin/testimonials");
      assert.equal(listed.body.total, 1);
      assert.equal(listed.body.items[0].coachName.startsWith("Test"), true);

      assert.equal((await api(admin).delete(`/admin/testimonials/${coach.id}/${workoutId}`)).status, 200);
      assert.equal((await api(admin).delete(`/admin/testimonials/${coach.id}/${workoutId}`)).status, 404);
      assert.equal((await api().get(`/testimonials/${coach.id}`)).body[coach.id].length, 0);
    });
  });
});
