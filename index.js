const utils = require('./utils');
const mqtt = require('mqtt');
const request = require('request-promise');
const fs = require('fs');
var base64 = require('node-base64-image');
// var client  = mqtt.connect('ws://192.168.2.235:9001/mqtt')
var client  = mqtt.connect('ws://192.168.11.88:9001/mqtt')
// var message=JSON.stringify({ 'AlarmId':1,'PersonId':149,'RepoId':2,'TaskId':5,'BlackId':1,'FaceId':'1407503725622449','Confidence':0.9600212,'Time':'20171013T061931','AlarmType':2,'ServerId':0,'UrgentType':0});

let i = 0;
main();
process.on('uncaughtException',function(){
  main();
})

function main() {
  let CameraData = {};    // 照相机及采集地数据
  let Access_Token = '';  
  utils.getAccess_token().then(function(data){
  
    Access_Token = JSON.parse(data).access_token;
    const CameraData_promise = utils.getCameraData(Access_Token).then(function(data){
  
      // 处理CameraData数据
      data.data[0].childList.forEach(function(item, index) {
        item.nextList.forEach(function(childItem, childIndex){
          childItem.nextList.forEach(function(tarItem, tarIndex) {
            CameraData[tarItem.id] = {
              Area: data.data[0].districtName,
              Station: item.districtName,
              Location: tarItem.addr,
              geoString: tarItem.geoString
            }
          })
        })
      })
      // 连接和监听mqtt服务
      client.on('connect', function () {
        client.subscribe('0/#');
        // client.publish('0/1', message);
      })
      client.on('message', function (topic, alarm) {
        let message = JSON.parse(alarm.toString());

        // 收到mqtt服务器消息时，调用处理函数
        handle(client, message.AlarmId, message.PersonId, message.Confidence, message.Time, message.FaceId, Access_Token, CameraData);
      })
  
    }).catch(function(e) {
      console.log(e);
    })
  }).catch(function(e) {
    console.log(e);
  });
}


function handle(client, alarmId, PersonId, Confidence, Time, FaceID, Access_Token, CameraData) {
  
  const compareSuccess = (alarmId != -1 &&  Confidence > 0.919) ? true : false;  // 判断比对是否成功

  // 若比对失败，则不获取name，若比对成功，获取name_promise
  const name_promise = compareSuccess ? utils.getName(Access_Token, PersonId) : null;    
  const CaptureDetail_promise = utils.getCaptureDetailByface(Access_Token, FaceID)
  const BigImageByface_promise = utils.getBigImageByface(Access_Token, FaceID)
  
  // 若比对失败，则不获取name，若比对成功，获取name
  const promiseArray =  compareSuccess ? [CaptureDetail_promise, BigImageByface_promise, name_promise] : [CaptureDetail_promise, BigImageByface_promise];
  Promise.all(promiseArray).then(function(result) {
    let name = "";
    let faceUrl = "";
    let CameraId;
    let imageUrl = "";
    
    compareSuccess && (name = JSON.parse(result[2]).data[0].realName);
    // promiseArray && (name = JSON.parse(result[2]).data[0].realName);   // 识别比对成功的人员姓名

    faceUrl = JSON.parse(result[0]).data.imageData;  // 识别的人脸图像
    CameraId = JSON.parse(result[0]).data.sourceId;  // 照相机的ID
    imageUrl = JSON.parse(result[1]).data.uri;       // 采集场景大图     
    const targetCamera = CameraData[CameraId];
    
    const geoStr = targetCamera.geoString ? (/\((.+)\)/.exec(targetCamera.geoString)[1]) : "";

    base64.encode(imageUrl, {string: true}, function(err, imageBase64) {
      base64.encode(faceUrl, {string: true}, function(err, faceBase64) {
        const messageToPublish = {
          'IsWorker': compareSuccess ? 1 : 0,
          'ID': compareSuccess ? PersonId : 0,
          'imageUrl': imageUrl,
          'faceUrl': faceUrl,
          'Name': name,
          'Area': targetCamera.Area,
          'Station': targetCamera.Station,
          'geoString': geoStr,
          'Location': targetCamera.Location,
          'Confidence': Confidence,
          'Time': Time,
          'imageBase64': imageBase64,
          'faceBase64': faceBase64
        };
        // fs.appendFile('./data' + i++ + '.txt', JSON.stringify(messageToPublish), () => {})
        console.log(i++)
      })
    })

    // request({
    //   method: 'POST',
    //   url: 'http://ip:port/faceCompareResult',
    //   body: messageToPublish,
    //   json: true 
    // })
  }).catch(function(e) {
    // 出现401错误时， 重新登录获取token, 
    utils.getAccess_token().then(function(data){
      Access_Token = JSON.parse(data).access_token;
      handle(client, alarmId, PersonId, Confidence, Time, FaceID, Access_Token, CameraData)
    }).catch(function(e){console.log('获取token失败！')})
  })
}
