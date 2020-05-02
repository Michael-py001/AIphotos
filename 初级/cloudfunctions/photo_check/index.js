// 云函数入口文件
const cloud = require('wx-server-sdk')
const extCi = require("@cloudbase/extension-ci");
const tcb = require("tcb-admin-node");

cloud.init()
tcb.init({
  env: "cloud-55mf5"
});

tcb.registerExtension(extCi);
// 云函数入口函数
exports.main = async(event, context) => {
  return imgCheck(event)
}
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
// 处理检测结果
const getCheckResult = (data) => {
  const {
    PornInfo = [], TerroristInfo = [], PoliticsInfo = []
  } = data
  const pornResult = PornInfo || {}
  const terrorResult = TerroristInfo || {}
  const politResult = PoliticsInfo || {}

  let result = {}

  if (pornResult.HitFlag != 1 && terrorResult.HitFlag === 0 && politResult.HitFlag === 0) {
    result.status = 0
    result.data = {
      isSuccess: true
    }
    result.message = "检测通过"
  } else if (pornResult.HitFlag || terrorResult.HitFlag || politResult.HitFlag) {
    console.log(pornResult.HitFlag)
    result.status = -100
    result.message = "存在违禁图片"
  } else if (pornResult.Code || terrorResult.Code || politResult.Code) {
    result.status = -101
    result.message = 'pornResult:${pornResult.Code}-terrorResult:${terrorResult.Code}-politResult:${politResult.Code}'
  } else {
    result.status = 404
    result.message = '请求失败'
  }

  console.log('审核结果：', result);
  return result
}
// 主函数，图像检测
async function imgCheck(event) {
  const {file_path} = event //结构复制，把event中的file_path取出
  if(!file_path) {
    console.log('请设置file_path');
    return
  }
  try{
    const res = await tcb.invokeExtension('CloudInfinite', {
      action: 'DetectType',
      cloudPath: file_path, //需要分析的图像的绝对路径
      operations: {
        type: ["porn", "terrorist", "politics"]
      }
    })
    // console.log(res)
    let data = getResCode(res)   //检测状态，提取结果
    let result = getCheckResult(data)  //分析结果，返回数据
    return result
  } catch (error) {
    console.log('error :', error)
    return error
  }
  
}