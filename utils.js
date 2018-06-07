const request = require('request-promise');

const config = require('./config')
const urlForToken = config.api.base + config.api.PathForToken;


const Authorization = "Basic Y2xpZW50YXBwOjEyMzQ1Ng=="

const getAccess_token =  function() {
  var getAccess_token_options = {
    method: 'POST',
    url: urlForToken,
    formData: config.auth,
    headers: {"Authorization": Authorization}
  }
  return request(getAccess_token_options)
}

// 通过personID获取姓名
const getName = function (access_token, personId) {
    const urlForPersonDetail = config.api.base + config.api.PathForPersonDetail + personId;
    const getName_options = {
      method: 'GET',
      url: urlForPersonDetail,
      headers: {"Authorization": "Bearer " + access_token}
    };
    return request(getName_options);
}

// 通过faceID获取捕获的相机ID、 识别到的人脸图像faceUrl
const getCaptureDetailByface = function(access_token, faceid) {
  const urlForCaptureDetail = config.api.base + config.api.PathForCaptureDetail + faceid;

  CaptureDetail_options = {
    url: urlForCaptureDetail,
    method: 'GET',
    headers: {"Authorization": "Bearer " + access_token}
  }
  return request(CaptureDetail_options);
}

// 通过faceID获取采集场景大图imageUrl
const getBigImageByface = function(access_token, faceid) {
  const urlForBigImage = config.api.base + config.api.PathForBigImage + faceid;
  var BigImage_options = {
    method: 'GET',
    url: urlForBigImage,
    headers: {"Authorization": "Bearer " + access_token}
  };
  return request(BigImage_options);
}

// 获取全部相机数据
const getCameraData = function(access_token) {
  var CameraData_options = {
    method: 'POST',
    url: config.api.base + config.api.PathForCameraData,
    body: {
      id: "0",
      countNodeType:"camera",
      nodeType:"district",
      spreadNodeType:"camera",
      userId:null
    },
    json: true,
    headers: {"Authorization": "Bearer " + access_token}
  };
  return request(CameraData_options);
}

module.exports = {getAccess_token, getName, getCaptureDetailByface, getCameraData, getBigImageByface};
