// server.js
import fs from "fs";
import http from "http";
import https from "https";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT) || 3000;
const nextHostname =
  process.env.RENDER_EXTERNAL_HOSTNAME ||
  process.env.HOST ||
  process.env.HOSTNAME ||
  "localhost";

const app = next({ dev, hostname: nextHostname, port });
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

    https
      .createServer(httpsOptions, requestListener)
      .listen(port, "localhost", () => {
        console.log(`🚀 HTTPS server ready at https://localhost:${port}`);
      });
  } else {
    http
      .createServer(requestListener)
      .listen(port, "0.0.0.0", () => {
        console.log(
          `✅ Server ready on 0.0.0.0:${port} (external host: ${nextHostname})`
        );
      });
  }
});
