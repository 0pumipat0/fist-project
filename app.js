const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();

app.use(express.json());

let db;
const client = new MongoClient("mongodb://localhost:27017", {
    useUnifiedTopology: true,
});

client
    .connect()
    .then(() => {
        db = client.db("IIT");
        console.log("mongodb connected");

        // ตรวจสอบการเชื่อมต่อ
        return db.command({ ping: 1 });
    })
    .then(() => {
        console.log("MongoDB connection is alive.");
    })
    .catch((err) => {
        console.error("mongodb unconnected", err);
        process.exit(1);
    });

// Graceful shutdown: ปิดการเชื่อมต่อ MongoDB เมื่อเซิร์ฟเวอร์หยุดทำงาน
process.on("SIGINT", async () => {
    await client.close();
    console.log("MongoDB connection closed.");
    process.exit(0);
});

// ดึงข้อมูลทั้งหมด
app.get('/number', async (req, res) => {
    try {
        const number = await db.collection("number").find().toArray();
        res.json(number);
    } catch (err) {
        res.json("error");
    }
});

//ดูเฉพาะตัวที่หา name
app.get('/number/name/:name', async (req, res) => {
    try {
        const name = req.params.name;
        const product = await db.collection("product").find({
            "name": { $in: [{ "name": name }] }
        }).toArray();
        res.json(product);
    } catch (err) {
        res.json("error");
    }
});

// เริ่มต้นเซิร์ฟเวอร์
app.listen(3000, () => {
    console.log('Server started : success');
});
