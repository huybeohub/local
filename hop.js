const axios = require("axios");
const fs = require("fs");

const PLACE_ID = 2753915549;

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

// fetch an toàn
async function fetchServer() {
    const url = `https://games.roblox.com/v1/games/${PLACE_ID}/servers/Public?limit=100`;

    for (let i = 0; i < 5; i++) {
        try {
            const res = await axios.get(url, {
                timeout: 5000,
                headers: {
                    "User-Agent": "Mozilla/5.0"
                }
            });

            return res.data;

        } catch (err) {
            console.log(`⚠️ Lỗi request (${i + 1})`);

            // nếu bị rate limit
            if (err.response && err.response.status === 429) {
                console.log("⛔ 429 → nghỉ 5s");
                await sleep(5000);
            } else {
                await sleep(2000);
            }
        }
    }

    return null;
}

async function getServer() {
    console.log("⚡ Đang lấy server...");

    const data = await fetchServer();

    if (!data || !data.data || data.data.length === 0) {
        console.log("❌ Không có data, thử lại...");
        return;
    }

    // lấy server random
    const available = data.data.filter(s => s.playing < s.maxPlayers);

    if (available.length === 0) {
        console.log("❌ Không có server trống");
        return;
    }

    const server = available[Math.floor(Math.random() * available.length)];

    fs.writeFileSync("server.json", JSON.stringify({
        id: server.id,
        players: server.playing,
        maxPlayers: server.maxPlayers
    }, null, 2));

    console.log("🔥 SERVER:", server.id, `(${server.playing}/${server.maxPlayers})`);
}

// chạy an toàn
setInterval(getServer, 7000);
getServer();