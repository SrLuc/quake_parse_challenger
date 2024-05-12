require("dotenv/config");
import app from "./app";

app.listen(process.env.API_PORT, () => {
  console.log("Games processed!");
  console.log(`server started at http://localhost:${process.env.API_PORT}`);
});
