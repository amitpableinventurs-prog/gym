require("dotenv").config();

const mongoose = require("mongoose");

// Starter plans. Existing plans with the same name are left untouched, so this
// is safe to re-run after an admin has edited prices.
const plans = [
  {
    name: "Monthly Basic",
    description: "Gym floor access with a few coached sessions.",
    price: 1499,
    durationDays: 30,
    sessionLimit: 4,
    features: ["Full gym floor access", "4 coach sessions", "Locker access"],
  },
  {
    name: "Monthly Unlimited",
    description: "Train with a coach as often as you like.",
    price: 2499,
    durationDays: 30,
    sessionLimit: null,
    features: ["Full gym floor access", "Unlimited coach sessions", "Locker access"],
  },
  {
    name: "Quarterly Unlimited",
    description: "Three months of unlimited coaching at a lower monthly rate.",
    price: 6499,
    durationDays: 90,
    sessionLimit: null,
    features: ["Everything in Monthly Unlimited", "Save over 10% vs monthly"],
  },
  {
    name: "Annual Unlimited",
    description: "Our best value for committed members.",
    price: 22999,
    durationDays: 365,
    sessionLimit: null,
    features: ["Everything in Monthly Unlimited", "Save over 20% vs monthly"],
  },
];

async function seedPlans() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be configured in the backend .env file");
  }

  await mongoose.connect(process.env.MONGO_URI);
  const collection = mongoose.connection.collection("membershipplans");
  const now = new Date();

  let created = 0;
  for (const plan of plans) {
    const result = await collection.updateOne(
      { name: plan.name },
      { $setOnInsert: { ...plan, isActive: true, createdAt: now, updatedAt: now } },
      { upsert: true }
    );
    created += result.upsertedCount;
  }

  console.log(`${created} plan(s) created, ${plans.length - created} already existed.`);
}

seedPlans()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
