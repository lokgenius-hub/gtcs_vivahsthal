import { redirect } from "next/navigation";

// Redirect old /partner/register → /partner-register
export default function OldPartnerRegister() {
  redirect("/partner-register");
}
