// 云函数入口文件
const cloud = require('wx-server-sdk')
const extCi = require("@cloudbase/extension-ci");
const tcb = require("tcb-admin-node");

cloud.init()
tcb.init({
  env: "cloud-55mf5"
});

tcb.registerExtension(extCi);
// 取出查询结果
const getResCode = (res) => { //传入接口查询返回的res
  if (res.statusCode === 200) {
    let result = res.data //取出data结果
    if (result.RecognitionResult) {
      const finalResult = result.RecognitionResult
      if (Object.keys(finalResult).length === 0) return finalResult || {} //处理接口返回keys是空的情况
      console.log(finalResult)
      return finalResult
    } else {
      throw result
    }
  } else {
    throw res.data
  }
}
// 云函数入口函数
exports.main = async (event, context) => {
  const { file_path } = event //结构复制，把event中的file_path取出
  if (!file_path) {
    console.log('请设置file_path');
    return
  }
  if(file_path) {
    try{
      const res = await tcb.invokeExtension("CloudInfinite", {
        action: "DetectLabel",
        cloudPath: file_path // 需要分析的图像的绝对路径，与tcb.uploadFile中一致
      });
      const { Labels } = getResCode(res)
      const tempLabels = Labels.length>1 ? Labels : [Labels]

      const labelsList = tempLabels.map(item => ({
        confidence: item.Confidence,   //可信度
        name: item.Name    //标签名字
      }))
      return {
        data: {labelsList},
        time: new Date(),
        status: 0,
        message:'返回标签成功'
      }
    }catch (error) {
      console.log(error)
      return {
        data: { },
        time: new Date(),
        status: -1,
        message: '返回失败'
      }
    }
  }
  return{
    data: {},
    time: new Date(),
    status: -2,
    message: '请传入正确的file_path'
  }
}