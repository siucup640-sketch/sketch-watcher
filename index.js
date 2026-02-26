#!/usr/bin/env node

import readline from "readline"

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const neon = {
  green: "\x1b[92m",
  red: "\x1b[91m",
  cyan: "\x1b[96m",
  yellow: "\x1b[93m",
  magenta: "\x1b[95m",
  reset: "\x1b[0m"
}

const symbolMap = {
  BTCUSDT: "bitcoin",
  ETHUSDT: "ethereum",
  SOLUSDT: "solana",
  BNBUSDT: "binancecoin"
}

let priceHistory = []

async function getPrice(symbol) {
  try {
    const coinId = symbolMap[symbol]
    if (!coinId) return null

    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
    )

    const data = await res.json()
    return data[coinId].usd
  } catch {
    return null
  }
}

function drawChart(data) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const height = 10

  console.log("\n" + neon.magenta + "Price Chart (Last 20 ticks)" + neon.reset)

  for (let i = height; i >= 0; i--) {
    let line = ""
    for (let price of data) {
      const scaled = Math.floor(((price - min) / (max - min || 1)) * height)
      line += scaled >= i ? "█" : " "
    }
    console.log(line)
  }

  console.log("-".repeat(data.length))
}

async function showPrice(symbol) {
  const price = await getPrice(symbol)

  if (!price) {
    console.log(neon.red + "Failed to fetch price." + neon.reset)
    return
  }

  if (priceHistory.length >= 20) {
    priceHistory.shift()
  }

  priceHistory.push(price)

  console.clear()
  console.log(neon.cyan + "=== SKETCH WATCHER PRO ===" + neon.reset)
  console.log("Monitoring:", symbol)
  console.log("-----------------------------")

  const last = priceHistory[priceHistory.length - 2]
  const change = last ? price - last : 0
  const color = change >= 0 ? neon.green : neon.red

  console.log("Current Price:", color + "$" + price + neon.reset)
  console.log("Change:", color + change.toFixed(4) + neon.reset)

  drawChart(priceHistory)
}

function startMonitor(symbol) {
  setInterval(() => {
    showPrice(symbol)
  }, 5000)

  showPrice(symbol)
}

function main() {
  console.log(neon.yellow + "Available pairs: BTCUSDT ETHUSDT SOLUSDT BNBUSDT" + neon.reset)
  console.log("Enter trading pair:")

  rl.question("> ", (symbol) => {
    const clean = symbol.toUpperCase().trim()
    rl.close()
    startMonitor(clean)
  })
}

main()
