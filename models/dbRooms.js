import mongoose from "mongoose";

const roomSchema = mongoose.Schema({
  name: String,
  users: Array,
});

export default mongoose.model("roomcontents", roomSchema);
