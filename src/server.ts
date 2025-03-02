//imports
import dotenv from "dotenv";
import app from "./app";

dotenv.config();

const PORT = process.env.PORT || 5000;

//start Express server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
