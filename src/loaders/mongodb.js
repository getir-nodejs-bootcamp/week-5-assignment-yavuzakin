const Mongoose = require("mongoose");

const db = Mongoose.connection;

db.once("open", () => {
  console.log("MongoDB'ye baglanti basarilidir..");
});

const connectDB = async () => {
  const { DB_PASSWORD, DB_NAME } = process.env;
  // 'mongodb://username:password@host:port/database?options...'
  // mongodb+srv://mongodb:<password>@cluster0.wfk78.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
  await Mongoose.connect(`mongodb+srv://mongodb:${DB_PASSWORD}@cluster0.wfk78.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

module.exports = {
  connectDB,
};
