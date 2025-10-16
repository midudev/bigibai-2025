import { supabase } from "@/supabase";
import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  cookies.delete("sb-access-token", { path: "/" });
  cookies.delete("sb-refresh-token", { path: "/" });

  // sign out from supabase
  const { error } = await supabase.auth.signOut()
  if (error) {
    return new Response(error.message, { status: 500 });
  }

  return redirect("/");
};