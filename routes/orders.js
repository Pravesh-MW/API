const router = require("express").Router();
const { MongoClient } = require("mongodb");

const mongoURI =
  "mongodb+srv://db_user_read:LdmrVA5EDEv4z3Wr@cluster0.n10ox.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

let db;

MongoClient.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then((client) => {
    console.log("Connected to MongoDB");
    db = client.db("RQ_Analytics");
  })
  .catch((err) => console.error("MongoDB connection error:", err));

router.get("/total-sales", async (req, res) => {
  const type = req.query.value;
  let l = 10;
  switch (type) {
    case "daily":
      l = 10;
      break;
    case "monthly":
      l = 7;
      break;
    case "quarterly":
      l = 7;
      break;
    case "yearly":
      l = 4;
      break;
  }
  try {
    const result = await db
      .collection("shopifyOrders")
      .aggregate([
        {
          $group: {
            _id: { $substr: ["$created_at", 0, l] },
            totalSpend: { $sum: { $toDouble: "$total_line_items_price" } },
          },
        },
        {
          $sort: { _id: 1 },
        },
        {
          $limit: 30,
        },
      ])
      .toArray();

    if (type === "quarterly") {
      const response = [];
      for (const element of result) {
        let date = element._id;
        let q = Math.floor(Number(date.substr(5, 2)) / 4) + 1;
        let Q = `${date.substr(0, 4)}-Q${q}`;
        // console.log(q);
        const existingObject = response.find((obj) => obj._id === Q);
        if (existingObject) {
          existingObject.totalSpend += Number(element.totalSpend);
        } else {
          response.push({ _id: Q, totalSpend: element.totalSpend });
        }
      }
      return res.json(response);
    }
    res.json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.get("/Growth-Rate", async (req, res) => {
  // console.log("Growth Rate");
  const type = req.query.value;
  let l = 10;
  switch (type) {
    case "daily":
      l = 10;
      break;
    case "monthly":
      l = 7;
      break;
    case "quarterly":
      l = 7;
      break;
    case "yearly":
      l = 4;
      break;
  }
  try {
    const result = await db
      .collection("shopifyOrders")
      .aggregate([
        {
          $group: {
            _id: { $substr: ["$created_at", 0, l] },
            totalSpend: { $sum: { $toDouble: "$total_line_items_price" } }
          },
        },
        {
          $sort: { _id: 1 },
        },
        {
          $limit: 30,
        },
      ])
      .toArray();

    if (type === "quarterly") {
      const response = [];
      for (const element of result) {
        let date = element._id;
        let q = Math.floor(Number(date.substr(5, 2)) / 4) + 1;
        let Q = `${date.substr(0, 4)}-Q${q}`;
        const existingObject = response.find((obj) => obj._id === Q);
        if (existingObject) {
          existingObject.totalSpend += Number(element.totalSpend);
        } else {
          response.push({ _id: Q, totalSpend: element.totalSpend });
        }
      }
      // response = calculateSalesGrowthRate(response);
      return res.json(calculateSalesGrowthRate(result));
    }
    // result = calculateSalesGrowthRate(result);
    // console.log(calculateSalesGrowthRate(result));
    res.json(calculateSalesGrowthRate(result));
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

function calculateSalesGrowthRate(data) {
  const SellsGrowthRate = [];
  for (let i = 1; i < data.length; i++) {
    const currentPeriod = data[i];
    const previousPeriod = data[i - 1];

    if (previousPeriod) {
      const growthRate =
        ((currentPeriod.totalSpend - previousPeriod.totalSpend) /
          previousPeriod.totalSpend) *
        100;
      SellsGrowthRate.push({ _id: data[i]._id, growthRate: growthRate });
    }
  }

  return SellsGrowthRate;
}
module.exports = router;
