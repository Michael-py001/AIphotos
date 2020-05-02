// miniprogram/pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    img: "/images/img/cloud.png",
    labels:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },
  upload_img: function() {
    const that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'], //所选的图片的尺寸
      sourceType: ['album', 'camera'], //选择图片的来源
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths[0]  //获取本地地址
        const tempFilePaths_type = res.tempFilePaths[0].split('.')[3] //获取文件后缀
        console.log(tempFilePaths_type)
        wx.cloud.uploadFile({
          cloudPath: 'photo_check/' + new Date().getTime() + "-" + Math.floor(Math.random() * 1000) + "." + tempFilePaths_type,  //云端文件路径
          filePath: tempFilePaths  //本地路径
        }).then(res => {
          // get resource ID
          let file_id = res.fileID  //获取返回的file id
          let cloud_file_paths = file_id.split('/') //分割字符串,得到下面用的云存储路径
          // console.log(cloud_file_paths)
          let cloud_file_path = cloud_file_paths[3] + '/' + cloud_file_paths[4]  //拼接字符串得到云存储路径
          console.log(cloud_file_path)
          console.log("上传成功")
          console.log(res.fileID)
          //调用云函数
          wx.cloud.callFunction({
            // 要调用的云函数名称
            name: 'photo_check',
            // 传递给云函数的event参数
            data: {
              file_path: cloud_file_path
            },
            complete: res => {   //图片检测成功返回，callback风格
              console.log("云函数返回值")
              console.log(res)
              if (res.result.data.isSuccess) { //判断返回是否为true
                wx.cloud.callFunction({
                  name: 'photo_label',
                  data:{
                    file_path: cloud_file_path
                  }
                }).then(res => {  //获取标签成功返回，promis风格
                  console.log(res)
                  const labels = res.result.data.labelsList
                  that.setData({
                    img: tempFilePaths,
                    labels: labels
                  })
                  console.log("输出data")
                  console.log(that.data.labels)
                }).catch(err => {
                  console.log(err)
                })
              } else {
                console.log(res)
              }
            }
          
            // handle error
          })
        }).catch(error =>{
          console.log(error)
        })
        // console.log(res)
        // console.log(tempFilePaths)
       
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})