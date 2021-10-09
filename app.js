require("dotenv").config();
const express = require("express");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 4000;

const {
  getGoldPrice,
  broadcast,
  reply,
  checkAvailableTime,
  broadcastMsgToUser,
  broadcastLineNotify,
} = require("./helpful_functions");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

let intPreviousBuyGoldPrice;
const setPreviousGoldPrice = async () => {
  previousGoldPrice = await getGoldPrice();
  intPreviousBuyGoldPrice = parseInt(
    previousGoldPrice.Buy.replace(/,/g, ""),
    10
  );
};

const goldPriceNoti15secs_lineNotify = setInterval(async () => {
  let goldPrice = await getGoldPrice();
  let intBuyGoldPrice = parseInt(goldPrice.Buy.replace(/,/g, ""), 10);
  let differenceBuyPrice = intBuyGoldPrice - intPreviousBuyGoldPrice;
  if (differenceBuyPrice >= 10) {
    broadcastLineNotify(goldPrice, "alertUP");
    console.log("broadcast alertUP...");
  } else if (differenceBuyPrice <= -10) {
    broadcastLineNotify(goldPrice, "alertDOWN");
    console.log("broadcast alertDOWN...");
  } else {
    broadcastLineNotify(goldPrice);
    console.log("normal broadcast...");
  }
  intPreviousBuyGoldPrice = intBuyGoldPrice;
}, 5000);

const goldPriceNoti15mins = setInterval(async () => {
  let goldPrice = await getGoldPrice();
  let intBuyGoldPrice = parseInt(goldPrice.Buy.replace(/,/g, ""), 10);
  let differenceBuyPrice = intBuyGoldPrice - intPreviousBuyGoldPrice;
  if (differenceBuyPrice >= 10) {
    broadcast(goldPrice, "alertUP");
    console.log("broadcast alertUP...");
  } else if (differenceBuyPrice <= -10) {
    broadcast(goldPrice, "alertDOWN");
    console.log("broadcast alertDOWN...");
  } else {
    broadcast(goldPrice);
    console.log("normal broadcast...");
  }
  intPreviousBuyGoldPrice = intBuyGoldPrice;
}, 900000);

//prevent Heroku dyno from sleeping
const pingAppEvery29mins = setInterval(async () => {
  let isHSHOpen = checkAvailableTime();
  if (isHSHOpen) {
    await axios.get("https://gold-hsh-line-chatbot.herokuapp.com/webhook");
    console.log("...ping!");
  }
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

app.listen(port, async () => {
  console.log("listening on port...", port);
  //set initial gold price to compare with future price
  await setPreviousGoldPrice();
  // broadcastMsgToUser(
  //   "Sorry for the inconvenience, the testing was done. One more functionality has been added. If the price increase or decrease more than 50 baht in the past 15 minutes, the bot will automatically alert users"
  // );
});
