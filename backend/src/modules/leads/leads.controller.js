import fs from "fs";
import * as csv from "fast-csv";
import { prisma } from "../../config/database.js";
import { asyncHandler } from "../../shared/asyncHandler.js";

export const importLeads = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  const results = [];
  const errors = [];
  let rowCount = 0;

  // Assuming it's a CSV upload
  fs.createReadStream(req.file.path)
    .pipe(csv.parse({ headers: true, ignoreEmpty: true }))
    .on("error", (error) => {
      res.status(400).json({ success: false, message: "Error parsing CSV", error: error.message });
    })
    .on("data", (row) => {
      rowCount++;
      // Basic validation
      if (!row.firstName || !row.lastName) {
        errors.push(`Row ${rowCount}: Missing firstName or lastName`);
      } else {
        results.push({
          firstName: row.firstName,
          lastName: row.lastName,
          email: row.email || null,
          phone: row.phone || null,
        });
      }
    })
    .on("end", async () => {
      // Remove temp file
      fs.unlinkSync(req.file.path);

      if (results.length > 0) {
        // Bulk insert leads
        await prisma.lead.createMany({
          data: results,
          skipDuplicates: true
        });
      }

      res.json({
        success: true,
        data: {
          inserted: results.length,
          errors
        }
      });
    });
});
