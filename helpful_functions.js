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

const reply = (reply_token, msg) => {
  let headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + process.env.CHANNEL_ACCESS_TOKEN,
  };
  let body;
  if (msg === "helping") {
    body = JSON.stringify({
      replyToken: reply_token,
      messages: [
        {
          type: "text",
          text: `🤖GOLD_HSH_PRICE_BOT by @mickyngub has 2 functionalities
                    \r\n1. User can type "gold" in the chat to get the current HSH 96.50 Gold price⛽
                    \r\n2. The bot will send the HSH 96.50 Gold price with no push notification every 5 minutes📢
                    \r\nFor further information please contact me @mickyngub in Twitter
      
                    \r\n🤖GOLD_HSH_PRICE_BOT by @mickyngub มีสองฟังก์ชั่นหลัก
                    \r\n1. คุณสามารถพิมพ์คำว่า "gold" ลงในช่องแชทเพื่อเชคราคาทองฮั่วเซ่งเฮง 96.50% ในขณะนี้⛽
                    \r\n3. บอทจะคอยเชคและส่งราคาทองฮั่วเซ่งเฮง 96.50% ให้คุณทุกๆสิบนาที โดยบอทจะส่งข้อความแจ้งเตือนแบบไม่มีเสียง📢
                    \r\nหากมีคำถามเพิ่มเติมสามารถติดต่อผมได้ที่ @mickyngub ในทวิตเตอร์
                    `,
        },
      ],
    });
  }
};
module.exports = {
  getTime: getTime,
  getGoldPrice: getGoldPrice,
  broadcast: broadcast,
  reply: reply,
};
