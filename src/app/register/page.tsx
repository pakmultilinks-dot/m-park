import { db } from "@/lib/db";
import RegisterClient from "./RegisterClient";

export default async function RegisterPage() {
  const plans = await db.subscriptionPlan.findMany({ where: { isActive: true }, orderBy: { pricePkr: "asc" } });
  return <RegisterClient plans={plans.map((p) => ({ id: p.id, name: p.name, pricePkr: p.pricePkr, durationMonths: p.durationMonths }))} />;
}
