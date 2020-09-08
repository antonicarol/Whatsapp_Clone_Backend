import express from "express";
import mongoose from "mongoose";
import Messages from "./models/dbMessages.js";
import Rooms from "./models/dbRooms.js";
import Users from "./models/dbUsers.js";
import Pusher from "pusher";
import cors from "cors";

//APP config

const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
  appId: "1067876",
  key: "6691ae274f3b1afd4e4b",
  secret: "878d80a4063ad235ce73",
  cluster: "eu",
  encrypted: true,
});

//MIDDLEWARE
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"),
    res.setHeader("Access-Control-Allow-Headers", "*"),
    next();
});

//DB CONFIG
const connectionUrl =
  "mongodb+srv://admin:vujhFFphbWNA9jSM@clusterwhatsappclone.qaagq.mongodb.net/whatsapp?retryWrites=true&w=majority";
mongoose.connect(connectionUrl, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
//ONCE CONNECTION IS OPEN
db.once("open", () => {
  console.log("DB CONNECTED");
  const roomCollection = db.collection("roomcontents");
  const roomChangeStream = roomCollection.watch();

  roomChangeStream.on("change", (change) => {
    console.log(change);
    if (change.operationType === "insert") {
      const roomDetails = change.fullDocument;
      pusher.trigger("rooms", "inserted", {
        name: roomDetails.name,
        user: roomDetails.users,
      });
    } else {
      console.log("Error Trigerring pusher");
    }
  });

  const msgCollection = db.collection("messagecontents");
  const changeStream = msgCollection.watch();

  // WE WILL WATCH OUR COLLECTION ANS WHEN IT CHANGE WE WILL USE PUSHER
  changeStream.on("change", (change) => {
    console.log(change);

    if (change.operationType === "insert") {
      const messageDetails = change.fullDocument;
      pusher.trigger("messages", "inserted", {
        name: messageDetails.name,
        message: messageDetails.message,
        timeStamp: messageDetails.timeStamp,
        recieved: messageDetails.recieved,
      });
    } else {
      console.log("Error triggering pusher");
    }
  });
});

//API ROUTES
app.get("/", (req, res) =>
  res
    .status(200)
    .send(
      "Welcome To the Watsapp Clone APi, Made by Antoni Carol Mateo 2020 💯"
    )
);

app.get("/messages/sync/:roomID", (req, res) => {
  const roomID = req.params;
  console.log(roomID);
  Messages.find()
    .where({ roomId: roomID.roomID })
    .exec((err, data) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).send(data);
      }
    });
});

app.get("/rooms/sync", (req, res) => {
  Rooms.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

//ROOMS that the user is in!

app.get("/rooms/:user", (req, res) => {
  const user = req.params;
  console.log(user);

  Rooms.find({ users: user.user }).exec((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

//POST A MESSAGe
app.post("/api/v1/messages/new", (req, res) => {
  const dbMessage = req.body;
  console.log(dbMessage);
  Messages.create(dbMessage, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(`new message created: \n ${data}`);
    }
  });
});

app.post("/rooms/new", (req, res) => {
  const dbRoom = req.body;

  Rooms.create(dbRoom, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(`new room create: \n ${data}`);
    }
  });
});
// We wil do it with no encryption, its just a demo
app.post("/users/new", (req, res) => {
  const user = req.body;
  const _user = Users.findOne({ user: user.name }, (err, data) => {
    return data;
  });
  console.log(_user);
  if (_user == null) {
    Users.create(user, (err, data) => {
      if (err) {
        res.send(500).send(err);
      } else {
        res.status(201).send(`User Registered : \n ${data}`);
      }
    });
  } else {
    res.send(201).send(`User already created!`);
  }
});

//LISTEN

app.listen(port, () => console.log(`Listening on localhost, port = ${port}`));
