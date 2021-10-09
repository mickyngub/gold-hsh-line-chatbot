const request = require("request");
const axios = require("axios");
const { text } = require("body-parser");

const convertTimezone = (date, tzString) => {
  return new Date(date.toLocaleString("en-US", { timeZone: tzString }));
};

const getTime = () => {
  //This depends on the server, since it runs on HEROKU the time is UTC and needs to convert to GMT+7
  let date_ob_UTC = new Date();
  let date_ob_GMT7 = convertTimezone(date_ob_UTC, "Asia/Bangkok");
  let date = ("0" + date_ob_GMT7.getDate()).slice(-2);
  let month = ("0" + (date_ob_GMT7.getMonth() + 1)).slice(-2);
  let year = date_ob_GMT7.getFullYear();
  let hours = ("0" + date_ob_GMT7.getHours()).slice(-2);
  let minutes = ("0" + date_ob_GMT7.getMinutes()).slice(-2);
  let seconds = ("0" + date_ob_GMT7.getSeconds()).slice(-2);
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

//Check whether it's 2am or not, if it is then returns true, else return false
const checkAvailableTime = () => {
  let date_ob_UTC = new Date();
  let date_ob_GMT7 = convertTimezone(date_ob_UTC, "Asia/Bangkok");
  let hours = date_ob_GMT7.getHours();
  if (hours === 2) {
    return false;
  }
  return true;
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

const broadcastMsgToUser = (msg) => {
  let headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + process.env.CHANNEL_ACCESS_TOKEN,
  };
  body = JSON.stringify({
    messages: [
      {
        type: "text",
        text: msg,
      },
    ],
    notificationDisabled: false,
  });
  request.post(
    {
      url: "https://api.line.me/v2/bot/message/broadcast",
      headers: headers,
      body: body,
    },
    (err, res, body) => {
      switch (res.statusCode) {
        case 200:
          console.log(
            "status = " +
              res.statusCode +
              " Successfully broadcasting messages..."
          );
          break;
        case 400:
          console.log("status = " + res.statusCode + " bad request");
          console.log("errors...", err);
          break;
        default:
          console.log("unknown error occurred ", res.statusCode);
          console.log("errors...", err);
          break;
      }
    }
  );
};

const broadcast = (goldPrice, type) => {
  let headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + process.env.CHANNEL_ACCESS_TOKEN,
  };
  let textMsg;
  let notiBoolean = true;
  if (type === "alertUP") {
    textMsg =
      "💚HSH Gold Price has gone UP more than 50 baht in the last 15 mins!!!...";
    notiBoolean = false;
  } else if (type === "alertDOWN") {
    textMsg =
      "💔HSH Gold Price has gone DOWN more than 50 baht in the last 15 mins!!!...";
    notiBoolean = false;
  } else {
    textMsg = "📢HSH Gold Price Every 15 mins🥇...";
  }
  body = JSON.stringify({
    messages: [
      {
        type: "text",
        text: `${textMsg}\r\nCurrent Time is ${getTime()}\r\nBuy Price is ${
          goldPrice.Buy
        }\r\nSell Price is ${goldPrice.Sell}`,
      },
    ],
    notificationDisabled: notiBoolean,
  });
  request.post(
    {
      url: "https://api.line.me/v2/bot/message/broadcast",
      headers: headers,
      body: body,
    },
    (err, res, body) => {
      switch (res.statusCode) {
        case 200:
          console.log(
            "status = " +
              res.statusCode +
              " Successfully broadcasting gold price..."
          );
          break;
        case 400:
          console.log("status = " + res.statusCode + " bad request");
          console.log("errors...", err);
          break;
        default:
          console.log("unknown error occurred ", res.statusCode);
          console.log("errors...", err);
          break;
      }
    }
  );
};

module.exports = {
  getTime: getTime,
  getGoldPrice: getGoldPrice,
  broadcast: broadcast,
  checkAvailableTime: checkAvailableTime,
  broadcastMsgToUser: broadcastMsgToUser,
};
