require("dotenv").config();

const mongoose = require("mongoose");

async function promoteAdmin() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Usage: npm run admin:promote -- existing-user@example.com");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be configured in the backend .env file");
  }

  await mongoose.connect(process.env.MONGO_URI);
  const result = await mongoose.connection.collection("users").updateOne(
    { email },
    { $set: { isAdmin: true } }
  );

  if (result.matchedCount !== 1) {
    throw new Error(`No existing user found for ${email}; register that account first`);
  }

  console.log(`Administrator access enabled for ${email}. Have the user log in again.`);
}

promoteAdmin()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
