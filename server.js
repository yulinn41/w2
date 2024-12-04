const WebSocket = require("ws");
const express = require("express");
const http = require("http");
const path = require("path");

// 建立 Express 應用
const app = express();
const server = http.createServer(app);

// 設定靜態文件夾
app.use(express.static(path.join(__dirname, "public")));

// WebSocket 伺服器設置
const wss = new WebSocket.Server({ server });
console.log("WebSocket 伺服器啟動");

let unitySocket = null;

// 監聽來自網頁的 WebSocket 連接
wss.on("connection", (ws) => {
    console.log("網頁客戶端已連接");

    ws.on("message", (message) => {
        const messageString = message.toString();
        console.log("收到網頁字串: ", messageString);

        // 將字串轉發給 Unity
        if (unitySocket && unitySocket.readyState === WebSocket.OPEN) {
            unitySocket.send(messageString);
            console.log("已將字串轉發給 Unity");
        } else {
            console.log("Unity 尚未連接，無法轉發字串");
        }
    });

    ws.on("close", () => {
        console.log("網頁客戶端已斷開");
    });
});

// 另一個 WebSocket 伺服器端口（8081）專為 Unity 使用
const unityWSS = new WebSocket.Server({ port: 8081 });
console.log("Unity 伺服器啟動，監聽 ws://localhost:8081");

unityWSS.on("connection", (ws) => {
    console.log("Unity 客戶端已連接");
    unitySocket = ws;

    ws.on("close", () => {
        console.log("Unity 客戶端已斷開");
        unitySocket = null;
    });
});

// 設定 HTTP 伺服器的監聽端口
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`伺服器正在監聽端口 ${PORT}`);
});
