import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");
  
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash("admin123", salt);

  // 1. Ensure Admin exists
  const adminEmail = "admin@triumphcrm.com";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: passwordHash,
        name: "Super Admin",
        role: "ADMIN",
        emailVerified: true,
        isActive: true,
      }
    });
    console.log(`✅ Admin created: ${adminEmail} / admin123`);
  } else {
    // Update admin password just in case
    await prisma.user.update({
      where: { email: adminEmail },
      data: { password: passwordHash }
    });
    console.log(`✅ Admin updated: ${adminEmail} / admin123`);
  }

  // 2. Generate 20 random executives
  const departments = ["PRE_SALES", "SALES", "LEASING", "CRM"];
  
  console.log("Generating 20 dummy staff members...");
  
  for (let i = 1; i <= 20; i++) {
    const email = `executive${i}@triumph.com`;
    const exists = await prisma.user.findUnique({ where: { email } });
    
    if (!exists) {
      await prisma.user.create({
        data: {
          name: `Staff Member ${i}`,
          email: email,
          password: passwordHash,
          role: "EXECUTIVE",
          department: departments[i % departments.length],
          officeNumber: `${100 + i}`,
          phone: `+971 50 123 45${i.toString().padStart(2, '0')}`,
          emailVerified: true,
          isActive: i % 5 !== 0 // make every 5th inactive just for data variety
        }
      });
    }
  }
  
  console.log("✅ Seed complete! Added 20 staff members.");

  // 3. Seed Developers
  console.log("Seeding 71 developers from Rohit Resources.xlsx...");
  const { DEVELOPERS_LIST } = await import("../src/modules/inventory/inventory.constants.js");
  for (const name of DEVELOPERS_LIST) {
    await prisma.developer.upsert({
      where: { name },
      update: {},
      create: { name, isActive: true }
    });
  }
  console.log(`✅ Seeded ${DEVELOPERS_LIST.length} developers.`);

  // 4. Seed Inventory Properties, Areas, Media & Project Units
  const { seedInventoryProperties } = await import("./seedInventoryData.js");
  await seedInventoryProperties();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
