// server.js
import fs from "fs";
import http from "http";
import https from "https";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = Number(process.env.PORT) || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const requestListener = (req, res) => {
    if (dev) {
      res.setHeader(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains; preload"
      );
    }
    return handle(req, res);
  };

  if (dev) {
    const httpsOptions = {
      key: fs.readFileSync("./certs/server.key"),
      cert: fs.readFileSync("./certs/server.pem"),
    };

    https.createServer(httpsOptions, requestListener).listen(port, () => {
      console.log(`🚀 HTTPS server ready at https://localhost:${port}`);
    });
  } else {
    http.createServer(requestListener).listen(port, hostname, () => {
      console.log(`✅ Server ready at http://${hostname}:${port}`);
    });
  }
});
