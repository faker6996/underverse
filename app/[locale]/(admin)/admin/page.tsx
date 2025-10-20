import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function AdminIndexRedirect() {
  // Redirect the root admin to the referee view
  // Locale segment is preserved by Next since this file lives under [locale]
  redirect("./referee");
}
