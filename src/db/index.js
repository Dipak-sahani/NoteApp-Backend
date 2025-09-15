import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        let mongoUri = process.env.MONGODB_URI;

        // Parse DB name presence in the URI
        const uriHasDbName = /mongodb(\+srv)?:\/\/[^/]+\/[^/?]+/.test(mongoUri);

        // Add DB_NAME if not present
        let connectionString = uriHasDbName ? mongoUri : mongoUri.replace(/\/?$/, `/${DB_NAME}`);
        //      ^ ensures there's exactly one slash before DB_NAME

        const connectionInstance = await mongoose.connect(connectionString);
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1);
    }
}

export default connectDB;
