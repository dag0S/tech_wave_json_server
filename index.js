const jsonServer = require("json-server");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const server = jsonServer.create();

const db = JSON.parse(fs.readFileSync(path.join(__dirname, "db.json")));
const router = jsonServer.router(db);

server.use(cors());
server.use(jsonServer.defaults({}));
server.use(jsonServer.bodyParser);

// LOGIN
server.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;
    const users = router.db.get("users").value();

    const userFromBd = users.find(
      (user) => user.email === email && user.password === password
    );

    if (userFromBd) {
      return res.json(userFromBd);
    }

    return res.status(403).json({ message: "User not found" });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: e.message });
  }
});

// REGISTRATION
server.post("/register", (req, res) => {
  const { email, name, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const users = router.db.get("users").value();
  const existingUser = users.find((user) => user.email === email);

  if (existingUser) {
    return res.status(409).json({ error: "User already exists." });
  }

  const newUser = { id: users.length + 1, email, password, name };
  router.db.get("users").push(newUser).write();

  res.status(201).json(newUser);
});

// CURRENT
server.get("/current", (req, res) => {
  if (!req.headers.authorization) {
    res.status(401).jsonp({ message: "Not authenticated" });
  }

  const users = router.db.get("users").value();
  const user = users.find((user) => user.email === req.headers.authorization);

  res.status(200).json(user);
});

server.use(router);

// Запуск сервера
server.listen(4321, () => {
  console.log("server is running on 4321 port");
});
