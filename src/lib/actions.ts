"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession, requireAdmin, requireCustomer } from "@/lib/auth";

// Note: server actions used as <form action> must return void or
// Promise<void> in Next.js 15 types, so validation failures throw an Error
// instead of returning a result object.

export async function logoutAction(): Promise<void> {
  const { clearSession } = await import("@/lib/auth");
  await clearSession();
}

export async function adminAddCustomer(form: FormData): Promise<void> {
  await requireAdmin();
  const name = String(form.get("name") || "").trim();
  const phone = String(form.get("phone") || "").trim();
  const plate = String(form.get("plate") || "").trim().toUpperCase();
  const make = String(form.get("make") || "").trim();
  const model = String(form.get("model") || "").trim();
  const year = Number(form.get("year") || 2022);
  const color = String(form.get("color") || "").trim();
  const planId = String(form.get("planId") || "");
  const qrCode = String(form.get("qrCode") || "").trim().toUpperCase();
  if (!name || !phone || !plate || !make || !model || !planId || !qrCode) throw new Error("Name, phone, plate, vehicle, plan and QR code are required.");
  const existingPhone = await db.user.findUnique({ where: { phone } });
  if (existingPhone) throw new Error("A customer with this phone already exists.");
  const existingPlate = await db.vehicle.findUnique({ where: { plate } });
  if (existingPlate) throw new Error("This plate is already registered.");
  const qr = await db.qrCode.findUnique({ where: { code: qrCode } });
  if (!qr) throw new Error("QR code not found in inventory.");
  if (qr.vehicleId) throw new Error("QR code is already assigned.");
  const plan = await db.subscriptionPlan.findUnique({ where: { id: planId } });
  if (!plan) throw new Error("Plan not found.");
  const user = await db.user.create({ data: { role: "CUSTOMER", name, phone } });
  const vehicle = await db.vehicle.create({ data: { plate, make, model, year, color, ownerId: user.id } });
  await db.qrCode.update({ where: { id: qr.id }, data: { vehicleId: vehicle.id, status: "ACTIVE", assignedAt: new Date() } });
  const start = new Date();
  const end = new Date(start);
  end.setMonth(end.getMonth() + plan.durationMonths);
  await db.subscription.create({ data: { userId: user.id, planId: plan.id, startDate: start, endDate: end, status: "ACTIVE" } });
  await db.notification.create({ data: { userId: user.id, title: "Welcome to M-Park", body: `Your QR sticker ${qrCode} is active for ${plate}.` } });
  revalidatePath("/admin/customers");
  revalidatePath("/admin");
}

export async function adminToggleBlock(userId: string, blocked: boolean): Promise<void> {
  await requireAdmin();
  await db.user.update({ where: { id: userId }, data: { isBlocked: blocked } });
  revalidatePath("/admin/customers");
}

export async function adminQrStatus(qrId: string, status: "ACTIVE" | "INACTIVE" | "LOST"): Promise<void> {
  await requireAdmin();
  await db.qrCode.update({ where: { id: qrId }, data: { status } });
  revalidatePath("/admin/qr-codes");
  revalidatePath("/admin");
}

export async function adminGenerateBatch(count: number): Promise<void> {
  await requireAdmin();
  const n = Math.min(Math.max(Number(count) || 50, 1), 200);
  const last = await db.qrCode.findFirst({ orderBy: { code: "desc" } });
  let startNum = 1001;
  if (last) {
    const m = last.code.match(/MPK-(\d+)/);
    if (m) startNum = Number(m[1]) + 1;
  }
  const batches = await db.qrCode.groupBy({ by: ["batch"] });
  const batchNo = batches.length + 1;
  const batch = `B-${String(batchNo).padStart(3, "0")}`;
  for (let i = 0; i < n; i++) {
    await db.qrCode.create({ data: { code: `MPK-${startNum + i}`, batch, status: "ACTIVE" } });
  }
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/qr-codes");
}

export async function adminPlanCreate(form: FormData): Promise<void> {
  await requireAdmin();
  const name = String(form.get("name") || "").trim();
  const pricePkr = Number(form.get("pricePkr") || 0);
  const durationMonths = Number(form.get("durationMonths") || 1);
  const description = String(form.get("description") || "").trim();
  if (!name || pricePkr <= 0 || durationMonths < 1) throw new Error("Plan name, a price above 0, and a duration of at least 1 month are required.");
  const existing = await db.subscriptionPlan.findUnique({ where: { name } });
  if (existing) throw new Error("A plan with this name already exists.");
  await db.subscriptionPlan.create({ data: { name, pricePkr, durationMonths, description: description || null } });
  revalidatePath("/admin/subscriptions");
}

export async function adminPlanUpdate(form: FormData): Promise<void> {
  await requireAdmin();
  const id = String(form.get("id") || "");
  const pricePkr = Number(form.get("pricePkr") || 0);
  const isActive = String(form.get("isActive") || "true") === "true";
  if (!id || pricePkr <= 0) throw new Error("A price above 0 is required.");
  await db.subscriptionPlan.update({ where: { id }, data: { pricePkr, isActive } });
  revalidatePath("/admin/subscriptions");
}

export async function customerUpdateVehicle(form: FormData): Promise<void> {
  const s = await requireCustomer();
  const vehicleId = String(form.get("vehicleId") || "");
  const plate = String(form.get("plate") || "").trim().toUpperCase();
  const make = String(form.get("make") || "").trim();
  const model = String(form.get("model") || "").trim();
  const year = Number(form.get("year") || 2022);
  const color = String(form.get("color") || "").trim();
  const vehicle = await db.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle || vehicle.ownerId !== s.id) throw new Error("Vehicle not found.");
  if (plate !== vehicle.plate) {
    const other = await db.vehicle.findUnique({ where: { plate } });
    if (other) throw new Error("This plate is already registered.");
  }
  await db.vehicle.update({ where: { id: vehicleId }, data: { plate, make, model, year, color } });
  revalidatePath("/customer");
  revalidatePath("/customer/vehicle");
}

export async function customerEmergencyUpsert(form: FormData): Promise<void> {
  const s = await requireCustomer();
  const name = String(form.get("name") || "").trim();
  const phone = String(form.get("phone") || "").trim();
  const relationship = String(form.get("relationship") || "").trim();
  if (!name || !phone) throw new Error("Emergency contact name and phone are required.");
  await db.emergencyContact.upsert({
    where: { userId: s.id },
    create: { userId: s.id, name, phone, relationship: relationship || null },
    update: { name, phone, relationship: relationship || null },
  });
  revalidatePath("/customer/emergency");
}

export async function customerEmergencyDelete(): Promise<void> {
  const s = await requireCustomer();
  await db.emergencyContact.deleteMany({ where: { userId: s.id } });
  revalidatePath("/customer/emergency");
}

export async function customerRequestAction(requestId: string, status: "APPROVED" | "IGNORED"): Promise<void> {
  const s = await requireCustomer();
  const req = await db.contactRequest.findUnique({ where: { id: requestId }, include: { vehicle: true } });
  if (!req || req.vehicle.ownerId !== s.id) throw new Error("Request not found.");
  await db.contactRequest.update({ where: { id: requestId }, data: { status } });
  revalidatePath("/customer/requests");
  revalidatePath("/customer");
}

export async function adminOrderPayment(form: FormData): Promise<void> {
  await requireAdmin();
  const id = String(form.get("id") || "");
  const paymentStatus = String(form.get("paymentStatus") || "") as "PAID" | "UNPAID";
  if (!id || (paymentStatus !== "PAID" && paymentStatus !== "UNPAID")) throw new Error("Order and payment status are required.");
  await db.stickerOrder.update({ where: { id }, data: { paymentStatus } });
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

export async function adminOrderStatus(form: FormData): Promise<void> {
  await requireAdmin();
  const id = String(form.get("id") || "");
  const orderStatus = String(form.get("orderStatus") || "") as "ORDERED" | "PRINTED" | "SHIPPED" | "DELIVERED" | "ACTIVATED";
  if (!id || !["ORDERED", "PRINTED", "SHIPPED", "DELIVERED", "ACTIVATED"].includes(orderStatus)) throw new Error("Order and order status are required.");
  await db.stickerOrder.update({ where: { id }, data: { orderStatus } });
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

export async function adminProductPrice(form: FormData): Promise<void> {
  await requireAdmin();
  const id = String(form.get("id") || "");
  const pricePkr = Number(form.get("pricePkr") || 0);
  if (!id || pricePkr <= 0) throw new Error("A price above 0 is required.");
  await db.product.update({ where: { id }, data: { pricePkr } });
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

export async function markNotificationsRead(): Promise<void> {
  const s = await getSession();
  if (!s) return;
  await db.notification.updateMany({ where: { userId: s.id, isRead: false }, data: { isRead: true } });
  revalidatePath("/customer/notifications");
  revalidatePath("/admin/notifications");
}
