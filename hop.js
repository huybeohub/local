const axios = require("axios");
const fs = require("fs");

const PLACE_ID = 2753915549;

let usedServers = new Set();

async function scanServers() {
    let cursor = "";
    let servers = [];

    console.log("🔍 Đang scan server...");

    try {
        for (let i = 0; i < 15; i++) {
            const url = `https://games.roblox.com/v1/games/${PLACE_ID}/servers/Public?limit=100&cursor=${cursor}`;
            
            const res = await axios.get(url);
            const data = res.data;

            if (!data.data) break;

            const filtered = data.data
                .filter(s => s.playing > 0 && s.playing < s.maxPlayers)
                .filter(s => !usedServers.has(s.id))
                .map(s => ({
                    id: s.id,
                    players: s.playing,
                    maxPlayers: s.maxPlayers
                }));

            servers.push(...filtered);

            if (!data.nextPageCursor) break;
            cursor = data.nextPageCursor;
        }

        // ưu tiên server ít người
        servers.sort((a, b) => a.players - b.players);

        return servers;

    } catch (err) {
        console.log("❌ Lỗi:", err.message);
        return [];
    }
}

async function main() {
    while (true) {
        let servers = await scanServers();

        if (servers.length === 0) {
            console.log("⚠️ Không có server, thử lại...");
            await new Promise(r => setTimeout(r, 5000));
            continue;
        }

        let target = servers[0];

        console.log(`🎯 Chọn server: ${target.id} (${target.players}/${target.maxPlayers})`);

        usedServers.add(target.id);

        // lưu JSON
        fs.writeFileSync("server.json", JSON.stringify(target, null, 2));

        console.log("📄 Đã lưu server.json");

        // delay trước khi hop tiếp
        await new Promise(r => setTimeout(r, 8000));
    }
}

main();
