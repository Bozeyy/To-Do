import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const dynamic = "force-dynamic";

console.log("NEXTAUTH_HANDLER_INIT");
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
