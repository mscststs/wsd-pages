import Danmaku from "./danmaku.class.js"
import { createApp } from "/lib/vue/vue.esm-browser.js"

let queryParams = new URL(location.href).searchParams;

if(queryParams.get('roomid')) {
  let danmaku = new Danmaku({
    roomid: parseInt(queryParams.get('roomid'))
  });

  createApp({
    data(){
      return {
        messages:[],
      }
    },
    mounted(){
      danmaku.addEventListener("DANMU_MSG", (e) => {
        let message = e.data;
        this.messages.unshift(message);
        if(this.messages.length > 100){
          this.messages.slice(0,100);
        }
      });
      
    }
  }).mount("#app")

  if(queryParams.get("publish")){
    danmaku.addEventListener("DANMU_MSG", (e)=>{
      window.parent.postMessage(JSON.stringify(e.data), "*");
    })
  }
}else{
  // 隐藏表单
  document.querySelector("#form").style.display = "block";
}