const url = 'https://auto.euattendo.com.br/mcp-server/http';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyY2ZkYmNlOS05MzY5LTQzNmQtOGU2NC00ZjQxNGFhYmJlZDIiLCJpc3MiOiJuOG4iLCJhdWQiOiJtY3Atc2VydmVyLWFwaSIsImp0aSI6IjMxNGZhMWQ3LWQ2MzktNDI4My1hYWE4LTM2N2Q2MjUzY2U2ZiIsImlhdCI6MTc3NzI0NDIyNX0.pbRmdj0uczhie3DM9GbVlrifa2suJZeVMNRz-KgBhWU';

async function listTools() {
  const req = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/list",
    params: {}
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(req)
    });
    const text = await res.text();
    console.log("Response:", text);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

listTools();
