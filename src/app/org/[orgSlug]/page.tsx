import { redirect } from "next/navigation";

export default function OrgRedirectPage() {
  redirect("/app/groups");
}