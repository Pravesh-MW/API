const express = require("express");
const router = express.Router();

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

// 1. New Customers Added Over Time
router.get("/new-customers", async (req, res) => {
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
      .collection("shopifyCustomers")
      .aggregate([
        {
          $group: {
            _id: { $substr: ["$created_at", 0, l] },
            totalNewCustomer: { $sum: { $toDouble: 1 } },
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
          existingObject.totalNewCustomer += element.totalNewCustomer;
        } else {
          response.push({ _id: Q, totalNewCustomer: element.totalNewCustomer });
        }
        console.log(response);
      }
      return res.json(response);
    }
    res.json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// 2. Number of Repeat Customers
// router.get('/repeat-customers', async (req, res) => {
//     try {
//         const { interval } = req.query;
//         const repeatCustomers = await ShopifyOrder.aggregate([
//             {
//                 $group: {
//                     _id: {
//                         customer_id: '$customer.id',
//                         interval: {
//                             $dateToString: {
//                                 format: getDateFormat(interval),
//                                 date: '$created_at'
//                             }
//                         }
//                     },
//                     totalPurchases: { $sum: 1 }
//                 }
//             },
//             {
//                 $match: {
//                     totalPurchases: { $gt: 1 }
//                 }
//             },
//             {
//                 $group: {
//                     _id: '$_id.interval',
//                     repeatCustomers: { $sum: 1 }
//                 }
//             }
//         ]);

//         res.json(repeatCustomers);
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server error');
//     }
// });

// 3. Geographical Distribution of Customers
router.get('/geographical-distribution', async (req, res) => {
  try {
    const result = await db.collection("shopifyCustomers").aggregate([
        {
          $group: {
            _id: "$default_address.city",
            NumberOfCustomer: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ])
      .toArray();
    res.json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// // 4. Customer Lifetime Value by Cohorts
// router.get('/lifetime-value-cohorts', async (req, res) => {
//     try {
//         const cohorts = await ShopifyCustomer.aggregate([
//             {
//                 $lookup: {
//                     from: 'shopifyOrders',
//                     localField: 'id',
//                     foreignField: 'customer.id',
//                     as: 'orders'
//                 }
//             },
//             {
//                 $unwind: '$orders'
//             },
//             {
//                 $group: {
//                     _id: {
//                         cohort: {
//                             $dateToString: {
//                                 format: '%Y-%m',
//                                 date: '$created_at'
//                             }
//                         },
//                         customerId: '$id'
//                     },
//                     lifetimeValue: { $sum: '$orders.total_price_set.shop_money.amount' }
//                 }
//             },
//             {
//                 $group: {
//                     _id: '$_id.cohort',
//                     averageLifetimeValue: { $avg: '$lifetimeValue' },
//                     totalCustomers: { $sum: 1 }
//                 }
//             },
//             {
//                 $sort: { _id: 1 }
//             }
//         ]);

//         res.json(cohorts);
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server error');
//     }
// });

// Helper function to format the date based on the interval
function getDateFormat(interval) {
  switch (interval) {
    case "daily":
      return "%Y-%m-%d";
    case "monthly":
      return "%Y-%m";
    case "quarterly":
      return "%Y-Q%q";
    case "yearly":
      return "%Y";
    default:
      return "%Y-%m-%d";
  }
}

module.exports = router;
