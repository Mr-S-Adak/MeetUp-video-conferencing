import { verifyWebhook } from "@clerk/express/webhooks";
import { sql } from "../config/db.js";
export const handleClerkWebhook = async (req, res) => {
  try {
    const evt = await verifyWebhook(req);

    const eventType = evt.type;
    const data = evt.data;

    switch (eventType) {
      // case "user.created": {
      //   const userId = data.id;
      //   const primaryEmail = data.email_addresses?.[0]?.email_address || "";
      //   const name = `${data.first_name || "User"} ${data.last_name}`;
      //   const image = data.image_url || "";
      //   const plan = "free";

      //   await sql`
      //   INSERT INTO users (id,name,email,image,plan)
      //   VALUES (${userId},${name},${primaryEmail},${image},${plan})
      //   ON CONFLICT (id) DO UPDATE SET
      //   email = COALESCE(NULLIF(EXCLUDED.email, ''), users.email),
      //   id = EXCLUDED.id,
      //   name = EXCLUDED.name,
      //   image = EXCLUDED.image,
      //   plan = EXCLUDED.plan,
      //   updated_at = NOW()`;
      //   break;
      // }
      case "user.created": {
        const userId = data.id;

        const primaryEmail =
          data.email_addresses?.find(
            (email) => email.id === data.primary_email_address_id,
          )?.email_address ||
          data.email_addresses?.[0]?.email_address ||
          "";

        // const name =
        //   `${data.first_name || ""} ${data.last_name || ""}`.trim() || "User";

        // const image = data.image_url || "";

        const name =
          [data.first_name, data.last_name].filter(Boolean).join(" ") || "User";

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

        console.log(`Clerk user synced: ${userId}`);

        break;
      }

      // case "user.updated": {
      //   const userId = data.id;
      //   const primaryEmail = data.email_addresses?.[0]?.email_address || "";
      //   const name = `${data.first_name || "User"} ${data.last_name}`;
      //   const image = data.image_url || "";

      //   await sql`
      //   INSERT INTO users (id,name,email,image)
      //   VALUES (${userId},${name},${primaryEmail},${image})
      //   ON CONFLICT (id) DO UPDATE SET
      //   email = EXCLUDED.email,
      //   id = EXCLUDED.id,
      //   name = EXCLUDED.name,
      //   image = EXCLUDED.image,
      //   updated_at = NOW()`;
      //   break;
      // }

      case "user.updated": {
        const userId = data.id;

        const primaryEmail =
          data.email_addresses?.find(
            (email) => email.id === data.primary_email_address_id,
          )?.email_address ||
          data.email_addresses?.[0]?.email_address ||
          "";

        // const name =
        //   `${data.first_name || ""} ${data.last_name || ""}`.trim() || "User";

        const name =
          [data.first_name, data.last_name].filter(Boolean).join(" ") || "User";

        const image = data.image_url || "";

        await sql`
    INSERT INTO users (
      id,
      name,
      email,
      image
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

        console.log(`Clerk user updated/synced: ${userId}`);

        break;
      }

      case "user.deleted": {
        const userId = data.id;
        if (userId) {
          await sql`DELETE FROM users WHERE id = ${userId}`;
        }
        break;
      }
      default:
        console.log(`Unhandled Clerk webhook event type: ${eventType}`);
        break;
    }
    return res.status(200).json({ success: true, eventType });
  } catch (error) {
    console.error("Error verifying Clerk webhook:", error.message || error);
    return res.status(400).json({
      error: "Webhook verification failed:" + (error.message || error),
    });
  }
};
