require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 4000;

const {
  getGoldPrice,
  broadcast,
  reply,
  checkAvailableTime,
  broadcastMsgToUser,
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

const goldPriceNoti30mins = setInterval(async () => {
  if (checkAvailableTime) {
    let goldPrice = await getGoldPrice();
    let intBuyGoldPrice = parseInt(goldPrice.Buy.replace(/,/g, ""), 10);
    let differenceBuyPrice = intBuyGoldPrice - intPreviousBuyGoldPrice;
    if (differenceBuyPrice >= 30) {
      broadcast(goldPrice, "alertUP");
      console.log("broadcast alertUP...");
    } else if (differenceBuyPrice <= -30) {
      broadcast(goldPrice, "alertDOWN");
      console.log("broadcast alertDOWN...");
    } else {
      broadcast(goldPrice);
      console.log("normal broadcast...");
    }
    intPreviousBuyGoldPrice = intBuyGoldPrice;
  }
}, 1800000);

app.get("/webhook", (req, res) => {
  res.send("...ping!!!");
});

app.listen(port, async () => {
  console.log("listening on port...", port);
  await setPreviousGoldPrice();
  // broadcastMsgToUser(
  //   "Sorry for the inconvenience, the testing was done. One more functionality has been added. If the price increase or decrease more than 50 baht in the past 15 minutes, the bot will automatically alert users"
  // );
});
