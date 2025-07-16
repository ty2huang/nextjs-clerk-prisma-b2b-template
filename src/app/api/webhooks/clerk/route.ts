import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) return new Response("Missing secret", { status: 500 });

  const wh = new Webhook(secret);
  const body = await req.text();
  const headerPayload = await headers();

  const event = wh.verify(body, {
    "svix-id": headerPayload.get("svix-id")!,
    "svix-timestamp": headerPayload.get("svix-timestamp")!,
    "svix-signature": headerPayload.get("svix-signature")!,
  }) as WebhookEvent;

  if (event.type === "user.created" || event.type === "user.updated") {
    const { id, email_addresses, first_name, last_name } = event.data;
    const name = `${first_name} ${last_name}`;
    const email = email_addresses[0].email_address;
    await prisma.user.upsert({
      where: { clerkId: id },
      update: { name, email },
      create: {
        clerkId: id, name, email
      },
    });
  }
  else if (event.type === "user.deleted") {
    const { id } = event.data;
    await prisma.user.delete({
      where: { clerkId: id },
    });
  }
  else if (event.type === "organization.created" || event.type === "organization.updated") {
    const { id, name, slug } = event.data;
    await prisma.organization.upsert({
      where: { clerkId: id },
      update: { name, slug },
      create: { clerkId: id, name, slug },
    });
  }
  else if (event.type === "organization.deleted") {
    const { id } = event.data;
    await prisma.organization.delete({
      where: { clerkId: id },
    });
  }

  return new Response("OK");
}