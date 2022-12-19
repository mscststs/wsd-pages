
import { sendData, handleData } from "./utils.js";

const socketUrl = "wss://broadcastlv.chat.bilibili.com:2245/sub";


class Danmaku extends EventTarget{
  constructor({
    roomid,
  }) {
    super();

    this.roomid = roomid;
    this.socket = null;
    this.timer = setInterval(() => {
      const heartData = '[object Object]';
      if(this.socket){
        this.socket.send(sendData(heartData, 1, 2, 1))
      }
    }, 3000);

    this.openSocket()
  }

  openSocket() {
    const firstData = {
      'uid': 0,
      'roomid': parseInt(this.roomid, 10),
      'protover': 2,
      'platform': 'web',
      'clientver': '1.8.5',
      'type': 2,
    };
    if (typeof (WebSocket) == "undefined") {
      alert("您的浏览器不支持WebSocket，显示弹幕功能异常，请升级你的浏览器版本，推荐谷歌，连接弹幕服务器失败");
    } else {
      console.log("弹幕服务器正在连接");

      if (this.socket != null) {
        this.socket.close();
        this.socket = null;
      }
      try {
        this.socket = new WebSocket(socketUrl);
      } catch (err) {
        console.log(err);
      }
      // 打开事件
      this.socket.onopen =  () => {
        console.log("连接已打开");
        this.socket.send(sendData(JSON.stringify(firstData), 1, 7, 1));
      };
      // 获得消息事件
      this.socket.onmessage = (msg) => {
        // 发现消息进入 开始处理前端触发逻辑
        var reader = new FileReader();
        reader.readAsArrayBuffer(msg.data); //把blob对象变成arraybuffer
        reader.onload = (event) => {
          var content = reader.result;
          let messages = handleData(content); // 处理
          Array.isArray(messages) && messages.map(item=>{
            if(item && item.type){
              let rawEvent = new Event(item.type, {bubbles: true, composed: true});
              rawEvent.data = item;
              this.dispatchEvent(rawEvent);
            }
          });
        };
      };
      // 关闭事件
      this.socket.onclose = function () {
        console.log("连接已关闭，网页显示弹幕失败");
      };
      // 发生了错误事件
      this.socket.onerror = function () {
        console.log("连接到弹幕服务器发生了错误，网页显示弹幕失败");
      }
    }
  }

}

export default Danmaku