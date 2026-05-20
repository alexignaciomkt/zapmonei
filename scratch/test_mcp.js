const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { SSEClientTransport } = require("@modelcontextprotocol/sdk/client/sse.js");

async function main() {
  const transport = new SSEClientTransport(new URL("https://auto.euattendo.com.br/mcp-server/http"), {
    requestInit: {
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyY2ZkYmNlOS05MzY5LTQzNmQtOGU2NC00ZjQxNGFhYmJlZDIiLCJpc3MiOiJuOG4iLCJhdWQiOiJtY3Atc2VydmVyLWFwaSIsImp0aSI6IjBhNzBmNTA1LTMyZjItNGMxNC1iOGQ3LTIyZTdiYzNhMjM1ZCIsImlhdCI6MTc3ODI3NDk1OX0.J446SmR5qyZ_2qUiUfwkChyi0VgS4rsNyrP84lEEV4U"
      }
    }
  });

  const client = new Client({
    name: "test-client",
    version: "1.0.0"
  }, {
    capabilities: {}
  });

  try {
    await client.connect(transport);
    console.log("Connected successfully!");
    const tools = await client.listTools();
    console.log("Tools:", JSON.stringify(tools, null, 2));
  } catch (error) {
    console.error("Failed to connect:", error);
  } finally {
    process.exit();
  }
}

main();
