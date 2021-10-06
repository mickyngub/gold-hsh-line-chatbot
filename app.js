require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 4000;

const { getGoldPrice, broadcast, reply } = require("./helpful_functions");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const goldPriceNoti = setInterval(async () => {
  let goldPrice = await getGoldPrice();
  broadcast(goldPrice);
}, 10000);

app.post("/webhook", async (req, res) => {
  let reply_token = req.body.events[0].replyToken;
  switch (req.body.events[0].message.text.toLowerCase()) {
    case "gold":
      let goldPrice = await getGoldPrice();
      reply(reply_token, goldPrice);
      break;
    case "help":
      reply(reply_token, "helping");
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
