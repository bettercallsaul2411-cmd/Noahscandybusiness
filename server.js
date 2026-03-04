const fs = require("fs");
const path = require("path");
const http = require("http");
const net = require("net");
const {
  blockedWords,
  includesBlockedWord,
  maskBlockedWords
} = require("./lib/moderation");

const DEFAULT_PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "::";
const communityPosts = [];
const workerApplications = [];
let nextId = 1;

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}

function serveFile(res, filePath, contentType) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      sendJson(res, 404, { error: "Not found" });
      return;
    }

    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
}

function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "GET" && requestUrl.pathname === "/") {
    return serveFile(res, path.join(__dirname, "public", "index.html"), "text/html; charset=utf-8");
  }

  if (req.method === "GET" && requestUrl.pathname === "/styles.css") {
    return serveFile(res, path.join(__dirname, "public", "styles.css"), "text/css; charset=utf-8");
  }

  if (req.method === "GET" && requestUrl.pathname === "/app.js") {
    return serveFile(res, path.join(__dirname, "public", "app.js"), "application/javascript; charset=utf-8");
  }

  if (req.method === "GET" && requestUrl.pathname === "/game.js") {
    return serveFile(res, path.join(__dirname, "public", "game.js"), "application/javascript; charset=utf-8");
  }

  if (req.method === "GET" && requestUrl.pathname === "/api/posts") {
    return sendJson(res, 200, { posts: communityPosts });
  }

  if (req.method === "GET" && requestUrl.pathname === "/health") {
    return sendJson(res, 200, { ok: true });
  }

  if (req.method === "POST" && requestUrl.pathname === "/api/posts") {
    try {
      const { author, message, category } = await parseRequestBody(req);

      if (!author || !message || !category) {
        return sendJson(res, 400, { error: "author, message, and category are required" });
      }

      if (includesBlockedWord(message)) {
        return sendJson(res, 400, {
          error: "Message contains blocked words. Please rewrite it.",
          sanitizedPreview: maskBlockedWords(message)
        });
      }

      const post = {
        id: nextId++,
        author: author.trim(),
        category,
        message: message.trim(),
        createdAt: new Date().toISOString()
      };

      communityPosts.unshift(post);
      return sendJson(res, 201, post);
    } catch {
      return sendJson(res, 400, { error: "Invalid JSON" });
    }
  }

  if (req.method === "DELETE" && requestUrl.pathname.startsWith("/api/posts/")) {
    const id = Number(requestUrl.pathname.split("/").pop());
    const index = communityPosts.findIndex((post) => post.id === id);

    if (index === -1) {
      return sendJson(res, 404, { error: "Post not found" });
    }

    const [deletedPost] = communityPosts.splice(index, 1);
    return sendJson(res, 200, { deleted: deletedPost });
  }

  if (req.method === "GET" && requestUrl.pathname === "/api/blocked-words") {
    return sendJson(res, 200, { blockedWords });
  }

  if (req.method === "POST" && requestUrl.pathname === "/api/review-language") {
    try {
      const { message } = await parseRequestBody(req);
      if (!message || !String(message).trim()) {
        return sendJson(res, 400, { error: "message is required" });
      }

      const clean = !includesBlockedWord(message);
      return sendJson(res, 200, {
        clean,
        sanitizedPreview: maskBlockedWords(message)
      });
    } catch {
      return sendJson(res, 400, { error: "Invalid JSON" });
    }
  }

  if (req.method === "POST" && requestUrl.pathname === "/api/worker-applications") {
    try {
      const { schoolId, name } = await parseRequestBody(req);
      if (!schoolId || !name) {
        return sendJson(res, 400, { error: "schoolId and name are required" });
      }

      const application = {
        id: workerApplications.length + 1,
        schoolId: String(schoolId).trim(),
        name: String(name).trim(),
        submittedAt: new Date().toISOString()
      };

      workerApplications.push(application);
      return sendJson(res, 201, { application });
    } catch {
      return sendJson(res, 400, { error: "Invalid JSON" });
    }
  }

  return sendJson(res, 404, { error: "Not found" });
});

function printLocalUrls(port) {
  console.log("Candy Business app running at:");
  console.log(`- http://localhost:${port}`);
  console.log(`- http://127.0.0.1:${port}`);
  console.log(`- http://[::1]:${port}`);
}

function findAvailablePort(startPort) {
  return new Promise((resolve, reject) => {
    const tester = net.createServer();

    tester.once("error", (error) => {
      if (error.code === "EADDRINUSE") {
        resolve(findAvailablePort(startPort + 1));
        return;
      }

      reject(error);
    });

    tester.once("listening", () => {
      tester.close(() => resolve(startPort));
    });

    tester.listen(startPort, HOST);
  });
}

async function startServer() {
  try {
    const port = await findAvailablePort(DEFAULT_PORT);
    if (port !== DEFAULT_PORT) {
      console.warn(`Port ${DEFAULT_PORT} is in use. Starting on ${port} instead.`);
    }

    server.listen(port, HOST, () => {
      printLocalUrls(port);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
