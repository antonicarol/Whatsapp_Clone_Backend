import mongoose from "mongoose";

const userShema = mongoose.Schema({
  name: String,
  photo: String,
  rooms: Array,
});

export default mongoose.model("users", userSchema);
