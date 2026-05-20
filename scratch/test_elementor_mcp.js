const url = 'https://zapmonei.com.br/wp-json/mcp/elementor-mcp-server';
const auth = 'Basic QWRtaW46ZmtXRyBXaG13IHlBSksgM3ZRVSA3WXpLIHF6RFU=';

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
        'Authorization': auth
      },
      body: JSON.stringify(req)
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error:", err.message);
  }
}

listTools();
