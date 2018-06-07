
// 获取权限相关的配置
exports.auth = {
  password: "e10adc3949ba59abbe56e057f20f883e",
  username: "superuser",
  grant_type: "password",
  scope: "read write",
  client_secret: 123456,
  client_id: "clientapp",
}

// 请求接口配置

exports.api = {
  base: 'http://192.168.11.88:8083/api/',              // api 根路径
  PathForPersonDetail: 'intellif/person/detail/',      // 获取 name 字段接口
  PathForCaptureDetail: 'intellif/face/',              // 获取 faceUrl 字段接口
  PathForBigImage: 'intellif/image/face/json/',        // 获取 imageUrl 字段接口
  PathForCameraData: 'intellif/zone/child',            // 获取相机数据接口，通过获取的相机数据，可获取Area、Station、Locationz字段
  PathForToken: 'oauth/token'                      // 获取Token接口
}