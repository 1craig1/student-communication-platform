// server.js
import fs from "fs";
import https from "https";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync("./certs/server.key"),
  cert: fs.readFileSync("./certs/server.pem"),
};

app.prepare().then(() => {
  https
    .createServer(httpsOptions, (req, res) => {
      res.setHeader(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains; preload"
      );
      // only accepy https https://localhost:3000
      return handle(req, res);
    })
    .listen(3000, () => {
      console.log("🚀 HTTPS Server ready at https://localhost:3000");
    });
});
