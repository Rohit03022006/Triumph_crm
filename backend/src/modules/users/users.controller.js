import bcrypt from "bcryptjs";
import { prisma } from "../../config/database.js";
import { AppError } from "../../shared/AppError.js";
import { asyncHandler } from "../../shared/asyncHandler.js";


// GET /api/v1/users
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, email: true, emailVerified: true, image: true,
      phone: true, address: true, role: true, department: true, officeNumber: true,
      isActive: true, createdAt: true, updatedAt: true
    }
  });
  res.json({ success: true, data: users });
});

// POST /api/v1/users (Admin creates a user)
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, address, image, department, officeNumber, emailVerified } = req.body;

  if (!email || !password || !name) {
    throw new AppError("Name, email, and password are required.", 400);
  }
  if (password.length < 8) {
    throw new AppError("Password must be at least 8 characters long.", 400);
  }

  // Hash password using bcryptjs
  const bcrypt = await import("bcryptjs");
  const salt = await bcrypt.default.genSalt(10);
  const hashedPassword = await bcrypt.default.hash(password, salt);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role || "EXECUTIVE",
      phone: phone || null,
      address: address || null,
      image: image || null,
      department: department || null,
      officeNumber: officeNumber || null,
      emailVerified: emailVerified !== undefined ? emailVerified : true
    },
  });

  const { password: _, ...userWithoutPassword } = newUser;

  res.status(201).json({ success: true, data: userWithoutPassword });
});

// PATCH /api/v1/users/:id (Admin edits user)
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, role, phone, address, image, isActive, department, officeNumber, emailVerified } = req.body;

  if (req.user.id === id) {
    if (role && role !== "ADMIN") throw new AppError("You cannot demote yourself.", 403);
    if (isActive === false) throw new AppError("You cannot deactivate your own account.", 403);
  }

  const user = await prisma.user.update({
    where: { id },
    select: {
      id: true, name: true, email: true, emailVerified: true, image: true,
      phone: true, address: true, role: true, department: true, officeNumber: true,
      isActive: true, createdAt: true, updatedAt: true
    },
    data: {
      name,
      role,
      phone,
      address,
      image,
      isActive,
      department,
      officeNumber,
      ...(emailVerified !== undefined && { emailVerified })
    }
  });

  res.json({ success: true, data: user });
});

// DELETE /api/v1/users/:id (Actually, deactivate instead of delete to preserve relations, but we'll do both or just deactivate)
export const deactivateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.update({
    where: { id },
    select: {
      id: true, name: true, email: true, emailVerified: true, image: true,
      phone: true, address: true, role: true, department: true, officeNumber: true,
      isActive: true, createdAt: true, updatedAt: true
    },
    data: { isActive: false },
  });

  // Also invalidate their sessions using Better Auth if possible, or just delete sessions
  await prisma.session.deleteMany({ where: { userId: id } });

  res.json({ success: true, data: user });
});

// POST /api/v1/users/:id/verify
export const manuallyVerifyUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.update({
    where: { id },
    select: {
      id: true, name: true, email: true, emailVerified: true, image: true,
      phone: true, address: true, role: true, department: true, officeNumber: true,
      isActive: true, createdAt: true, updatedAt: true
    },
    data: { emailVerified: true },
  });
  res.json({ success: true, data: user });
});


// Hard delete user
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (req.user.id === id) {
    throw new AppError("You cannot delete your own admin account.", 403);
  }
  
  // Need to delete related better-auth records first to avoid foreign key constraints
  await prisma.session.deleteMany({ where: { userId: id } });
  await prisma.account.deleteMany({ where: { userId: id } });
  
  const user = await prisma.user.delete({
    where: { id },
  });

  res.json({ success: true, data: user });
});

export const bulkDeleteUsers = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new AppError("No user IDs provided for bulk deletion.", 400);
  }

  // Prevent deleting self
  if (ids.includes(req.user.id)) {
    throw new AppError("You cannot delete your own admin account in a bulk action.", 403);
  }

  // First delete related records
  await prisma.session.deleteMany({ where: { userId: { in: ids } } });
  await prisma.account.deleteMany({ where: { userId: { in: ids } } });

  const result = await prisma.user.deleteMany({
    where: { id: { in: ids } }
  });

  res.json({ success: true, message: `Successfully deleted ${result.count} users.` });
});

export const updateMe = asyncHandler(async (req, res) => {
  const { name, phone, address, image } = req.body;
  const id = req.user.id;

  const user = await prisma.user.update({
    where: { id },
    select: {
      id: true, name: true, email: true, emailVerified: true, image: true,
      phone: true, address: true, role: true, department: true, officeNumber: true,
      isActive: true, createdAt: true, updatedAt: true
    },
    data: {
      ...(name && { name }),
      ...(phone !== undefined && { phone }),
      ...(address !== undefined && { address }),
      ...(image !== undefined && { image })
    }
  });

  res.json({ success: true, data: user });
});


export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: { message: "Current and new password are required." }});
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, error: { message: "New password must be at least 8 characters long." }});
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id }});
    if (!user) {
      return res.status(404).json({ success: false, error: { message: "User not found." }});
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: { message: "Incorrect current password." }});
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    res.json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    next(error);
  }
};
