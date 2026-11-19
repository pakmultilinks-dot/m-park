// SMS sender stub. No real SMS is sent until the client gives a real provider.
// Supported when configured: Twilio via env keys. Add your Pakistan gateway
// (JazzCash, Easypaisa, or a local SMS gateway) by adding a branch here and
// its keys to .env.example. In development, with no provider configured,
// the OTP is logged to the server console and, only in dev mode, returned
// to the screen labelled as a dev code. That is not a production flow.

export async function sendSms(phone: string, message: string): Promise<{ sent: boolean; provider: string; note: string }> {
  const provider = process.env.SMS_PROVIDER || "";
  if (!provider) {
    console.log(`[SMS DEV] To ${phone}: ${message}`);
    return { sent: false, provider: "none", note: "No SMS provider configured. OTP is shown on screen in dev mode only." };
  }
  if (provider === "twilio") {
    const sid = process.env.TWILIO_ACCOUNT_SID || "";
    const token = process.env.TWILIO_AUTH_TOKEN || "";
    const from = process.env.TWILIO_FROM || "";
    if (!sid || !token || !from) {
      return { sent: false, provider: "twilio", note: "Twilio keys are missing in env." };
    }
    const auth = Buffer.from(`${sid}:${token}`).toString("base64");
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ To: phone, From: from, Body: message }),
    });
    if (!res.ok) return { sent: false, provider: "twilio", note: `Twilio returned ${res.status}.` };
    return { sent: true, provider: "twilio", note: "SMS sent via Twilio." };
  }
  return { sent: false, provider, note: `SMS provider "${provider}" is not implemented yet. Add it in src/lib/sms.ts.` };
}
