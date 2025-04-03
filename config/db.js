const mongoose = require("mongoose");

const MONGO_URI = "mongodb+srv://Abhinav:abhinav123@userdb.kvuyu.mongodb.net/usersDB?retryWrites=true&w=majority";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`✅ MongoDB Connected to: ${conn.connection.db.databaseName}`);
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
        process.exit(1);
    }
};

module.exports = connectDB;
