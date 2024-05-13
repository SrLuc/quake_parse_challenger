require("dotenv/config");
import app from "./app";

app.listen(4545, () => {
  console.log("Games processed!");
  console.log(`server started at http://localhost:${4545}`);
});
