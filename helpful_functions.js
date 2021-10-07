const request = require("request");
const axios = require("axios");

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
  let hours = date_ob_GMT7.getHours();
  let minutes = date_ob_GMT7.getMinutes();
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
        text: `📢HSH Gold Price Every 15 mins🥇... \r\nCurrent Time is ${getTime()}\r\nBuy Price is ${
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

const reply = (reply_token, msg) => {
  let headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + process.env.CHANNEL_ACCESS_TOKEN,
  };
  let body;
  let log;
  if (msg === "helping") {
    body = JSON.stringify({
      replyToken: reply_token,
      messages: [
        {
          type: "text",
          text: `🤖GOLD_HSH_PRICE_BOT by @mickyngub has 2 functionalities
                    \r\n1. User can type "gold" in the chat to get the current HSH 96.50 Gold price⛽
                    \r\n2. The bot will send the HSH 96.50 Gold price with no push notification every 15 minutes📢
                    \r\nFor further information please contact me @mickyngub in Twitter
      
                    \r\n🤖GOLD_HSH_PRICE_BOT by @mickyngub มีสองฟังก์ชั่นหลัก
                    \r\n1. คุณสามารถพิมพ์คำว่า "gold" ลงในช่องแชทเพื่อเชคราคาทองฮั่วเซ่งเฮง 96.50% ในขณะนี้⛽
                    \r\n3. บอทจะคอยเชคและส่งราคาทองฮั่วเซ่งเฮง 96.50% ให้คุณทุกๆสิบห้านาที โดยบอทจะส่งข้อความแจ้งเตือนแบบไม่มีเสียง📢
                    \r\nหากมีคำถามเพิ่มเติมสามารถติดต่อผมได้ที่ @mickyngub ในทวิตเตอร์
                    `,
        },
      ],
    });
    log = " successfully sending help instructions....";
  } else if (msg.Buy) {
    body = JSON.stringify({
      replyToken: reply_token,
      messages: [
        {
          type: "text",
          text: `🥇Current HSH 96.50 Gold Price... \r\nCurrent Time is ${getTime()}\r\n\r\nBuy Price is ${
            msg.Buy
          } \r\nSell Price is ${msg.Sell} `,
        },
      ],
    });
    log = " successfully sending real-time hsh gold price....";
  } else {
    body = JSON.stringify({
      replyToken: reply_token,
      messages: [
        {
          type: "text",
          text: `${msg} is not a command, please type "help" to see all the commands`,
        },
      ],
    });
    log = " successfully sending help commands....";
  }

  request.post(
    {
      url: "https://api.line.me/v2/bot/message/reply",
      headers: headers,
      body: body,
    },
    (err, res, body) => {
      switch (res.statusCode) {
        case 200:
          console.log("status = " + res.statusCode + log);
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
  reply: reply,
};
