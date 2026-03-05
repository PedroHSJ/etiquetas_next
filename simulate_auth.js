const axios = require('axios');

async function testAuth() {
  console.log("Starting backend authentication simulation...");
  try {
    const api = axios.create({
      baseURL: "http://localhost:3000/api",
      headers: { "Content-Type": "application/json" }
    });

    console.log("1. Authenticating as marcilio@etiqueta.com...");
    const loginRes = await api.post("/auth/sign-in/email", {
      email: "marcilio@etiqueta.com",
      password: "Junhim16!@#"
    });

    console.log("Login Status:", loginRes.status);
    
    // Extrai o cookie da resposta
    let cookieStr = "";
    if (loginRes.headers['set-cookie']) {
       cookieStr = loginRes.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
       console.log("Captured Auth Cookies:", cookieStr);
    }

    console.log("\n2. Requesting user organizations to get the active OrganizationId...");
    const orgsRes = await api.get("/organization", {
      headers: { Cookie: cookieStr }
    });
    
    const orgs = orgsRes.data;
    console.log("Organizations received:", JSON.stringify(orgs));
    
    if (!orgs || !Array.isArray(orgs.data) || orgs.data.length === 0) {
       console.error("No organizations found for this user!");
       return;
    }
    
    const activeOrgId = orgs.data[0].id;
    console.log(`Active Organization ID mapped: ${activeOrgId}`);

    console.log("\n3. Testing GET /devices/printers simulating theApiClient interceptor...");
    try {
        const printersRes = await api.get("/devices/printers", {
            headers: { 
                Cookie: cookieStr,
                "X-Organization-Id": activeOrgId
            }
        });
        console.log("Printers Endpoint SUCCESS:", printersRes.status);
        console.log("Printers Output:", printersRes.data);
    } catch (err) {
        console.log("Printers Endpoint FAILED:", err.response?.status);
        console.log("Response data:", err.response?.data);
    }

    console.log("\n4. Testing POST /devices/token...");
    try {
        const tokenRes = await api.post("/devices/token", {}, {
            headers: { 
                Cookie: cookieStr,
                "X-Organization-Id": activeOrgId
            }
        });
        console.log("Token Endpoint SUCCESS:", tokenRes.status);
        console.log("Token Output:", tokenRes.data);
    } catch (err) {
        console.log("Token Endpoint FAILED:", err.response?.status);
        console.log("Response data:", err.response?.data);
    }

  } catch (err) {
     console.error("Global Test Error:", err.message);
     if (err.response) {
         console.error(err.response.data);
     }
  }
}

testAuth();
