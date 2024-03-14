require("dotenv").config();
const express = require("express");
const cors = require("cors");
const PORT = process.env.PORT || 3000;
const resourcesRouter = require("./routes/resources");
const mailRouter = require("./routes/mail");
const postsRouter = require("./routes/posts");
const commentsRouter = require("./routes/comments");
const { sequelize } = require("./config/database");

/*TODO: 
-SETUP firebase SDK
*/
const app = express();
app.use(express.json());
app.use(cors());

app.use("/api", resourcesRouter);
app.use("/api", mailRouter);
app.use("/api", postsRouter);
app.use("/api", commentsRouter);

app.get("/", (req, res) => {
  const baseUrl = req.protocol + "://" + req.get("host");
  res.json({
    resources: baseUrl + "/api/resources",
    posts: baseUrl + "/api/posts",
  });
});

sequelize.sync().then(() => {
  console.log("Database synced successfully.");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
