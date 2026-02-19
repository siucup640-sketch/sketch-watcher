const readline = require("readline");
const fetch = require("node-fetch");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function getPrice(coin) {
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd&include_24hr_change=true`
    );
    const data = await res.json();

    if (!data[coin]) {
      console.log("Coin not found.\n");
      return;
    }

    const price = data[coin].usd;
    const change = data[coin].usd_24h_change.toFixed(2);

    console.log("\n──────────── SKETCH DATA ────────────");
    console.log(`Asset        : ${coin.toUpperCase()}`);
    console.log(`USD Price    : $${price}`);
    console.log(`24h Change   : ${change}%`);
    console.log("─────────────────────────────────────\n");

  } catch (err) {
    console.log("Error fetching data.\n");
  }
}

function header() {
  console.clear();
  console.log("░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░");
  console.log("      🎨 SKETCH WATCHER v1.0");
  console.log("░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░\n");

  console.log("Commands:");
  console.log("price <coin>   → fetch live price");
  console.log("watch <coin>   → auto refresh (5s)");
  console.log("exit           → quit\n");
}

async function watchCoin(coin) {
  console.log(`Watching ${coin}... (Ctrl+C to stop)\n`);
  setInterval(() => {
    getPrice(coin);
  }, 5000);
}

header();

rl.on("line", async (input) => {
  const [command, coin] = input.split(" ");

  if (command === "price" && coin) {
    await getPrice(coin);
  }

  else if (command === "watch" && coin) {
    watchCoin(coin);
  }

  else if (command === "exit") {
    console.log("Shutting down Sketch Watcher...");
    process.exit();
  }

  else {
    console.log("Invalid command.\n");
  }
});
