var path = require('path'), rootPath = path.normalize(__dirname + '/..');
//server
module.exports = {
	GOOGLE_API_KEY : "AIzaSyBVu7vcbWHESuqrseixQDD22uLMg0jejh8",
	IMAGE_SERVER : "52.39.183.201",
	IMAGE_SERVER_URL : "http://52.39.183.201:8080",
	IMAGE_SERVER_USER : "ec2-user",
	IMAGE_SERVER_PASSWORD: "",
	IMAGE_SERVER_KEYFILE : rootPath + "/canhmua.pem",
	IMAGE_SERVER_PORT : "22",
	IMAGE_SERVER_PATH: "usr/src/zebra_server/",
	IMAGE_EXTENSION : ".jpg",
	PATIENT_AVATAR_DIR: "public/upload/",
	SMTP_HOST : 'smtp.gmail.com',
	SMTP_PORT : 465,
	SMTP_ACCOUNT : "dev@niw.com.vn",
	SMTP_PASSWORD : "niwcomvn",
	root: rootPath,
	 "database": "mongodb://dbgrowadmin:A84ePPo9mjX1GcUL@us-west-20.dbgrow.com:27017/zebra?ssl=true&sslAllowInvalidHostnames=true&authMechanism=SCRAM-SHA-1",
	//"database": "mongodb://localhost:27017/zebra",
    "port": process.env.PORT || 8080,
    "secretKey": "YourSecretKey"
};