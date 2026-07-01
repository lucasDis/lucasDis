import { dbConnect } from "../lib/db";
import { UserModel } from "../models/User";
import bcrypt from "bcryptjs";

async function main() {
  const password = process.argv[2];
  if (!password) {
    console.error("Uso: npx tsx --env-file=.env.local scripts/set-admin-password.ts <nueva_contraseña>");
    process.exit(1);
  }

  await dbConnect();
  const hash = await bcrypt.hash(password, 10);
  
  const adminEmail = "lg_ruizdiaz@hotmail.com";
  
  await UserModel.updateOne(
    { role: "admin" },
    { 
      $set: { 
        email: adminEmail,
        passwordHash: hash,
        name: "Lucas"
      }
    },
    { upsert: true }
  );

  console.log(`✔ Usuario administrador configurado.`);
  console.log(`Email: ${adminEmail}`);
  console.log(`Contraseña: ${password}`);
  process.exit(0);
}

main().catch(console.error);
