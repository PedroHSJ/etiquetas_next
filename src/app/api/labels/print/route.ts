import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await req.json();

    // The print agent is usually running on port 5000 of the client machine
    // But since this is a server route, we need a way to reach the client or
    // simply proxy the request if the print agent is accessible by the server.
    // In this specific architecture, it seems the print agent is expected
    // to be called from the browser or through a proxy.

    const printServiceUrl =
      process.env.PRINT_SERVICE_URL || "http://localhost:5000/print";

    console.log("Proxying print request to:", printServiceUrl);
    console.log("Payload:", payload);

    const printResponse = await axios.post(printServiceUrl, payload);

    return NextResponse.json(printResponse.data, {
      status: printResponse.status,
    });
  } catch (error: any) {
    console.error("Proxy print error:", error.message);
    return NextResponse.json(
      { error: "Failed to reach print service", details: error.message },
      { status: 502 },
    );
  }
}
