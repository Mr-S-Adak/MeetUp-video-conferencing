import { verifyWebhook } from "@clerk/express/webhooks";
import { sql } from "../config/db.js";

export const handleClerkWebhook = async (req, res) => {
  try {
    const evt = await verifyWebhook(req);

    const eventType = evt.type;
    const data = evt.data;

    console.log("========== CLERK WEBHOOK ==========");
    console.log("Event:", eventType);
    console.log("User ID:", data?.id);
    console.log("===================================");

    switch (eventType) {
      case "user.created": {
        const userId = data.id;

        const primaryEmail =
          data.email_addresses?.find(
            (email) => email.id === data.primary_email_address_id,
          )?.email_address ||
          data.email_addresses?.[0]?.email_address ||
          "";

        const name =
          `${data.first_name || ""} ${data.last_name || ""}`.trim() || "User";

        const image = data.image_url || "";

        console.log("Creating user in Neon:", {
          userId,
          name,
          email: primaryEmail,
        });

        await sql`
          INSERT INTO users (
            id,
            name,
            email,
            image,
            plan
          )
          VALUES (
            ${userId},
            ${name},
            ${primaryEmail},
            ${image},
            'free'
          )
          ON CONFLICT (id)
          DO UPDATE SET
            name = EXCLUDED.name,
            email = EXCLUDED.email,
            image = EXCLUDED.image,
            updated_at = NOW()
        `;

        console.log(`✅ Clerk user synced to Neon: ${userId}`);

        break;
      }

      case "user.updated": {
        const userId = data.id;

        const primaryEmail =
          data.email_addresses?.find(
            (email) => email.id === data.primary_email_address_id,
          )?.email_address ||
          data.email_addresses?.[0]?.email_address ||
          "";

        const name =
          `${data.first_name || ""} ${data.last_name || ""}`.trim() || "User";

        const image = data.image_url || "";

        await sql`
          INSERT INTO users (
            id,
            name,
            email,
            image,
            plan
          )
          VALUES (
            ${userId},
            ${name},
            ${primaryEmail},
            ${image}
          )
          ON CONFLICT (id)
          DO UPDATE SET
            name = EXCLUDED.name,
            email = EXCLUDED.email,
            image = EXCLUDED.image,
            updated_at = NOW()
        `;

        console.log(`✅ Clerk user updated in Neon: ${userId}`);

        break;
      }

      case "user.deleted": {
        const userId = data.id;

        if (userId) {
          await sql`
            DELETE FROM users
            WHERE id = ${userId}
          `;
        }

        console.log(`✅ Clerk user deleted from Neon: ${userId}`);

        break;
      }

      default:
        console.log(`Unhandled Clerk event: ${eventType}`);
    }

    return res.status(200).json({
      success: true,
      eventType,
    });
  } catch (error) {
    console.error("❌ Clerk webhook failed:", error);

    return res.status(400).json({
      success: false,
      error: "Webhook verification/processing failed",
      message: error.message,
    });
  }
};
