import express from "express";
import routes from './routes/index.js'
import cors from 'cors';
import 'dotenv/config';
import { SERVER_HOST,  SERVER_PORT } from "./utils/constants.js";

const app = express();


app.use(cors());
app.use(express.static("public"));
app.use(express.json());
app.use('/api', routes);

app.listen(3000, () => {
  console.log(`Server is running on http://${SERVER_HOST}:${SERVER_PORT}`);
});

