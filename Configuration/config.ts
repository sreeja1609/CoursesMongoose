import mongoose, { Connection } from "mongoose";
export const connect: Connection = mongoose.createConnection('mongodb://localhost/');
console.log("Successfully connected")
