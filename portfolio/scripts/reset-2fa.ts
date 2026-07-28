import { dbConnect } from "../lib/db";
import { UserModel } from "../models/User";

async function reset2FA() {
  await dbConnect();
  await UserModel.updateOne(
    { role: "admin" },
    {
      $set: { totpEnabled: false, backupCodes: [] },
      $unset: { totpSecret: "" },
    }
  );
  console.log("✔ 2FA desactivado correctamente en la base de datos.");
  process.exit(0);
}

reset2FA().catch(console.error);
