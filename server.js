const express = require("express");
const connectDB = require("./db");
const cors = require("cors");

const app = express();
connectDB();
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));
app.get("/", (req, res) => {
  res.send("Hello World");
});
// Import routes
const ordersRoute = require("./routes/orders");
const customersRoute = require("./routes/customers");

app.use("/api/orders", ordersRoute);
app.use("/api/customers", customersRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
