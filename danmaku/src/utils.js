export const sendData = function (data, p, o, s) {
  let dataUint8Array = stringToUint(data);
  let buffer = new ArrayBuffer(dataUint8Array.byteLength + 16);
  let dv = new DataView(buffer);
  //包长
  dv.setUint32(0, dataUint8Array.byteLength + 16);
  //头部长度 固定16
  dv.setUint16(4, 16);
  //协议版本号
  dv.setUint16(6, parseInt(p, 10));
  //协议类型
  dv.setUint32(8, parseInt(o, 10));
  //序列号 通常为1
  dv.setUint32(12, parseInt(s, 10));
  for (let i = 0; i < dataUint8Array.byteLength; i++) {
    dv.setUint8(16 + i, dataUint8Array[i]);
  }
  return buffer;
}

export const handleData = function (data) {
  const dv = new DataView(data);
  //包长
  const packageLen = dv.getUint32(0);
  //头部长度 固定16
  const headerLen = dv.getUint16(4);
  //协议版本号
  const protover = dv.getUint16(6);
  //协议类型
  const operation = dv.getUint32(8);
  //序列号 通常为1
  const sequence = dv.getUint32(12);
  data = data.slice(headerLen, packageLen);
  switch (protover) {
    case 0:
      //广播信息
      const str = uintToString(new Uint8Array(data));
      //        console.log(str);
      let msg = parseDanmuMessage(str);
      return [msg];
    // break;
    case 1:
      const dataV = new DataView(data);
      if (operation === 3) {
        console.log("人气值为：" + dataV.getUint32(0));
      } else if (operation === 8) {
        //连接成功返回{code:0}
        const str = uintToString(new Uint8Array(data));
        console.log(str);
      } else {
        console.log("unknown data")
      }
      break;
    case 2:
      if (operation === 5) {
        //解压
        //          try {
        let messages = unzip(pako.inflate(new Uint8Array(data)).buffer);
        //          } catch (err) {
        //            console.log(err);
        //          }
        return messages;

      } else {
        console.log("unknown data");
      }
      break;
    default:
      console.log("unknown data");
      break;
  }
}
//处理解压后的arraybuffer
export const unzip = function (data) {
  var offect = 0;
  var len = 0
  const maxLength = data.byteLength;
  while (offect < maxLength) {
    data = data.slice(len, maxLength);
    const dv = new DataView(data);
    const packageLen = dv.getUint32(0);
    const headerLen = dv.getUint16(4);
    const protover = dv.getUint16(6);
    const operation = dv.getUint32(8);
    const sequence = dv.getUint32(12);
    var datas = data.slice(headerLen, packageLen)

    let messages = [];
    switch (protover) {
      case 0:
        //处理解压后一般数据
        const str = uintToString(new Uint8Array(datas));
        let msg = parseDanmuMessage(str);
        messages.push(msg);
        //          console.log(str);
        break;
      case 1:
        const dataV = new DataView(datas);
        if (operation === 3) {
          console.log("人气值为：" + dataV.getUint32(0));
        } else if (operation === 8) {
          //连接成功返回{code:0}
          const str = uintToString(new Uint8Array(datas));
          console.log(str);
        } else {
          console.log("unknown data")
        }
        break;
      case 2:
        if (operation === 5) {
          //解压
          try {
            console.log(pako.inflate(new Uint8Array(datas), {
              to: 'string'
            }));
          } catch (err) {
            console.log(err);
          }

        } else {
          console.log("unknown data");
        }
        break;
      default:
        console.log("unknown data");
        break;
    }
    offect += packageLen;
    len = packageLen;
    return messages;
  }
}

export const uintToString = function (uintArray) {
  return decodeURIComponent(escape(String.fromCodePoint.apply(null, uintArray)));
}
//字符串转Uint8Array
export const stringToUint = function (s) {
  const charList = s.split('');
  const uintArray = [];
  for (let i = 0; i < charList.length; i++) {
    uintArray.push(charList[i].charCodeAt(0));
  }
  return new Uint8Array(uintArray);
}

export const parseDanmuMessage = function (jsons) {
  jsons = JSON.parse(jsons);
  if (jsons.cmd.startsWith("DANMU_MSG")) {
    // console.log(jsons);
    const danmu = {
      type: "DANMU_MSG",
      name: '',
      message: ''
    };
    danmu.name = jsons.info[2][1];
    danmu.message = jsons.info[1];
    return danmu;
  } else {
    // console.log("new data:",jsons);
  }
}