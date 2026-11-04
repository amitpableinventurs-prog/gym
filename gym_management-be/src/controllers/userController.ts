// src/controllers/userController.ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import jwt from "jsonwebtoken";
import fs from "fs";

// Coach listings are public, so these must never leave the server.
const PRIVATE_FIELDS = "-password -email -suspensionReason";

// Path to RSA keys
export class UserController {
  private privateKeyPath: string;

  constructor() {
    this.privateKeyPath = process.env.PRIVATE_KEY_PATH || "private.pem";
  }

  public async registerUser(req: Request, res: Response): Promise<void> {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        isCoach,
        target,
        userSummary,
        activity,
      } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ message: "User already exists" });
        return;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const newUser = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        isCoach,
        isAdmin: false,
        target,
        activity,
        userSummary,
      });
      const createdUser = await newUser.save();
      res.status(201).json({
        message: "User registered successfully",
        user: {
          id: createdUser._id,
          firstName: createdUser.firstName,
          lastName: createdUser.lastName,
          email: createdUser.email,
          isCoach: createdUser.isCoach,
          isAdmin: createdUser.isAdmin,
          target: createdUser.target,
          activity: createdUser.activity,
          title: createdUser.title,
        },
      });
    } catch (error) {
      res.status(500).json({ message: `Error: ${(error as Error).message}` });
    }
  }

  public async loginUser(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    try {
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        res.status(400).json({ message: "Invalid email or password" });
        return;
      }

      // Check if the password is correct
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(400).json({ message: "Invalid email or password" });
        return;
      }

      if (user.isSuspended) {
        res.status(403).json({ message: "This account has been suspended", code: "ACCOUNT_SUSPENDED" });
        return;
      }

      // Load private key to sign the JWT
      const privateKey = fs.readFileSync(this.privateKeyPath, "utf8");

      // Payload for the JWT
      const payload = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      };
      const token = jwt.sign(payload, privateKey, {
        algorithm: "RS256", // Use RSA signature with SHA-256 hashing
        expiresIn: "1h", // Token expires in 1 hour
      });

      // Return success response with token and user data
      res.status(200).json({
        message: "Logged in successfully",
        token, // Return the JWT token
        userData: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isCoach: user.isCoach,
          isAdmin: user.isAdmin,
          activity: user.activity,
          target: user.target,
          userSummary: user.userSummary,
          title: user.title,
          timeSlots: user.timeSlots,
        },
      });
    } catch (error) {
      res.status(500).json({ message: `Error: ${(error as Error).message}` });
    }
  }

  public async updateUser(req: Request, res: Response): Promise<void> {
    const { userId } = req.params; // Assuming userId is passed as a URL parameter
    if (req.user?.id !== userId) {
      res.status(403).json({ message: "You can only update your own account" });
      return;
    }

    const allowedFields = [
      "firstName",
      "lastName",
      "target",
      "activity",
      "userSummary",
      "title",
      "timeSlots",
    ];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([field]) => allowedFields.includes(field))
    );
    try {
      // Find the user by ID and update their information
      const updatedUser = await User.findOneAndUpdate({ _id: userId }, updates, {
        new: true, // Return the updated document
        runValidators: true, // Validate the updates against the model
      });


      if (!updatedUser) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      // Return success response with updated user data
      res.status(200).json({
        message: "User updated successfully",
        user: {
          id: updatedUser._id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          target: updatedUser.target,
          activity: updatedUser.activity,
          userSummary: updatedUser.userSummary,
          title: updatedUser.title,
          timeSlots: updatedUser.timeSlots,
        },
      });
    } catch (error) {
      res.status(500).json({ message: `Error: ${(error as Error).message}` });
    }
  }

  public async getCoach(req: Request, res: Response): Promise<void> {
    const coach = await User.find({ isCoach: true, isSuspended: { $ne: true } }).select(PRIVATE_FIELDS);
    res.status(200).json({ coach });
  }

  public async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      if (req.user?.id !== userId) {
        res.status(403).json({ message: "You can only change your own password" });
        return;
      }

      const { oldPassword, newPassword } = req.body;
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordValid) {
        res.status(401).json({ message: "Current password is incorrect" });
        return;
      }

      // Hash and save new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      user.password = hashedPassword;
      await user.save();

      res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
      res.status(500).json({ message: `Error: ${(error as Error).message}` });
    }
  }

  public async filterCoaches(req: Request, res: Response): Promise<void> {
    const { activity, date, time, coach } = req.body;

    try {
      const filterCriteria: any = { isCoach: true, isSuspended: { $ne: true } }; // Ensure we are only looking for coaches

      // If activity is specified and not "All", filter by activity
      if (activity && activity !== 'All') {
        filterCriteria.activity = activity;
      }

      // If a specific coach is specified and not "All", filter by coach ID
      if (coach && coach !== 'All') {
        filterCriteria._id = coach; // Directly use the coach ID
      }

      // Find coaches based on the constructed filter criteria
      const coaches = await User.find(filterCriteria).select(PRIVATE_FIELDS);

      // Filter coaches based on time availability if time is specified and not "All"
      const availableCoaches = coaches.filter(coach => {
        return time === 'All' || coach.timeSlots.includes(time); // Check if the specified time is in the coach's timeSlots or if time is "All"
      });

      // If a date is specified, you can add additional logic here if needed
      // For now, we are just filtering based on time and activity

      res.status(200).json(availableCoaches);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}

// Export instance for routes
export const userController = new UserController();
