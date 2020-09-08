import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: String,
  photo: String,
});

export default mongoose.model("users", userSchema);
