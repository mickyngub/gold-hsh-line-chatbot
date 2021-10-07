require("dotenv").config();
const express = require("express");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 4000;

const { getGoldPrice, broadcast, reply } = require("./helpful_functions");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const goldPriceNoti = setInterval(async () => {
  let goldPrice = await getGoldPrice();
  broadcast(goldPrice);
}, 900000);

const pingAppEvery29mins = setInterval(async () => {
  await axios.get("https://gold-hsh-line-chatbot.herokuapp.com/webhook");
  console.log("...ping!");
}, 1740000);

app.get("/webhook", (req, res) => {
  res.send("...ping!!!");
});
app.post("/webhook", async (req, res) => {
  let reply_token = req.body.events[0].replyToken;
  switch (req.body.events[0].message.text.toLowerCase()) {
    case "gold":
      let goldPrice = await getGoldPrice();
      reply(reply_token, goldPrice);
      break;
    case "help":
      reply(reply_token, "helping");
      break;
    default:
      reply(reply_token, req.body.events[0].message.text);
      break;
  }
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log("listening on port...", port);
  getGoldPrice();
});
