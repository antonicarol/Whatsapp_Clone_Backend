import mongoose from "mongoose";

// DEFINING OUR DATA SHCEMA!
const messageSchema = mongoose.Schema({
  roomId: String,
  message: String,
  name: String,
  timeStamp: String,
  recieved: Boolean,
});

export default mongoose.model("messagecontents", messageSchema);
