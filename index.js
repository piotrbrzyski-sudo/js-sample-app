import { createServer } from "./src/server.js";

const port = process.env.PORT || 3000;
const app = createServer();

app.listen(port, () => {
  console.log(`Task Tracker is running at http://localhost:${port}`);
});
