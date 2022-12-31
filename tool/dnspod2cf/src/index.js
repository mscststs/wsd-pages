import { createApp } from "/lib/vue/vue.esm-browser.js";


function loadFile(fileName, content){
  const aLink = document.createElement('a');
  const blob = new Blob([content], {
      type: 'text/plain'
  });
  // const evt = new Event('click');
  aLink.download = fileName;
  aLink.href = URL.createObjectURL(blob);
  aLink.click();
  URL.revokeObjectURL(blob);
}


createApp({
  data(){
    return {

    }
  },
  mounted(){
  },
  methods:{
    fileDrop(e){
      const file = e.dataTransfer.files[0];
      this.solveTxtFile(file);
    },
    chooseUploadFile(e){
      const file = e.target.files.item(0);
      this.solveTxtFile(file);
    },

    getDomainName(file){
      try{
        let filename = file.name;
        let domain = filename.split(".").slice(0,-2);
        return domain.join(".");
      }catch(e){
        return prompt("未能自动获取域名，请输入域名");
      }
    },
    async solveTxtFile(file){
      console.log(file)
      let domain = this.getDomainName(file);
      const reader = new FileReader();
      reader.readAsText(file, 'utf-8');
      await new Promise((resolve,reject)=>{
        reader.onload = resolve;
        reader.onerror = reject;
      });
      let content = reader.result;


      const result = [];
      content.split("\n").slice(1).filter(line=>{
        if(!line){
          return false
        }
        if(line.startsWith(";")){
          return false
        }
        if(line.startsWith("$ORIGIN")){
          domain = line.split(/\s/)[1].slice(0,-1);
          console.log(domain, "domain")
          result.push(line);
          return false
        }
        return true
      }).map(line=>{
        let [key, a, b, type, ...values] = line.split("	");
        let value = values.join(" ");
        if(b === "SOA"){
          return; // 过滤
        }

        if(key === "@" && type === "NS"){
          return; // 过滤 NS 记录
        }

        key = `${key}.${domain}.`.replace(/^@\./, "");

        result.push([key, "1", "IN", type ,value].join("\t"));
      });
      const result_content = result.join("\n");

      this.$refs.fileinput.value = null;
      loadFile(`${domain}.zone`, result_content);
      // console.log(this.$refs.fileinput)
    }
  },
}).mount("#app")