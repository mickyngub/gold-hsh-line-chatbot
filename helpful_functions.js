const request = require("request");
const axios = require("axios");

const getTime = () => {
  let date_ob = new Date();
  let date = ("0" + date_ob.getDate()).slice(-2);
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  let year = date_ob.getFullYear();
  let hours = date_ob.getHours() + 7;
  let minutes = date_ob.getMinutes();
  let seconds = date_ob.getSeconds();
  const dateString =
    year +
    "-" +
    month +
    "-" +
    date +
    " " +
    hours +
    ":" +
    minutes +
    ":" +
    seconds +
    " (GMT+7)";
  return dateString;
};

const getGoldPrice = async () => {
  try {
    const response = await axios.get(
      "https://apicheckprice.huasengheng.com/api/values/getprice/"
    );
    //response.data[0] is HSH 96.50 gold price
    return response.data[0];
  } catch (err) {
    console.log("error occurred", err);
  }
};

const broadcast = (goldPrice) => {
  let headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + process.env.CHANNEL_ACCESS_TOKEN,
  };
  let body = JSON.stringify({
    messages: [
      {
        type: "text",
        text: `📢HSH Gold Price Every 5 mins... \r\nCurrent Time is ${getTime()}\r\nBuy Price is ${
          goldPrice.Buy
        }\r\nSell Price is ${goldPrice.Sell}`,
      },
    ],
    notificationDisabled: true,
  });
  request.post(
    {
      url: "https://api.line.me/v2/bot/message/broadcast",
      headers: headers,
      body: body,
    },
    (err, res, body) => {
      console.log("status = " + res.statusCode);
    }
  );
};

module.exports = {
  getTime: getTime,
  getGoldPrice: getGoldPrice,
};
