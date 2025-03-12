import * as os from "os";
import * as std from "std";

const CACHE_DIR = std.getenv("HOME") + "/.cache/baremetal";
const PATHS = {
  wallpaper: CACHE_DIR + "/wallpaperPath.txt",
  theme: CACHE_DIR + "/themeFilePath.txt",
};

async function watchAndLoadFile(cachePath, lastMTime) {
  while (true) {
    // Check file stats
    const [fileStats, err] = os.stat(cachePath);
    if (err !== 0) {
      throw Error(`Failed to read ${cachePath} stats.\nError code: ${err}`);
    }
    // Skip if file hasn't changed
    if (lastMTime && fileStats.mtime <= lastMTime) {
      await os.sleepAsync(500);
      continue;
    }

    // Load and validate target file path
    const targetPath = std.loadFile(cachePath)?.trim();
    if (!targetPath) {
      throw Error(`Failed to read path from cache file: ${cachePath}`);
    }

    // Load and validate target file content
    const content = std.loadFile(targetPath);
    if (!content) {
      throw Error(`Failed to read content from file: ${targetPath}`);
    }

    return {
      mTime: fileStats.mtime,
      source: content,
    };
  }
}

export function getWallpaper(lastMTime) {
  return watchAndLoadFile(PATHS.wallpaper, lastMTime);
}

export function getTheme(lastMTime) {
  return watchAndLoadFile(PATHS.theme, lastMTime);
}

// power buttons
export function systemctl(opt) {
  const cmd = ["systemctl"];
  switch (opt) {
    case "shutdown":
      cmd.push("shutdown");
      break;
    case "hibernate":
      cmd.push("hibernate");
      break;
    case "reboot":
      cmd.push("reboot");
      break;
    case "sleep":
      cmd.push("sleep");
      break;
    case "logout":
      cmd.push("logout");
      break;
    case "lockscreen":
      break;
  }

  os.exec(cmd);
}

export async function setVolume(percent) {
  await execAsync([
    "pactl",
    "set-sink-volume",
    "@DEFAULT_SINK@",
    `${percent}%`,
  ]);
}

export async function setBrightness(percent) {
  await execAsync(["brightnessctl", "set", `${percent}%`]);
}

export async function getVolume() {
  const volumeStat = await execAsync([
    "pactl",
    "get-sink-volume",
    "@DEFAULT_SINK@",
  ]);

  return volumeStat.split(" ").find((w) => w.endsWith("%"));
}

let maxBrightness;
export async function getBrightness() {
  const currentBrightness = parseInt(await execAsync("brightnessctl g"));
  if (maxBrightness) return ((currentBrightness * 100) / maxBrightness);
  maxBrightness = parseInt(await execAsync("brightnessctl max"));
  return ((currentBrightness * 100) / maxBrightness);
}

export function screenShot() {
  return execAsync("hyprshot -m region", { newSession: true });
}

export async function isWifiConnected() {
  const wifiState = await execAsync("iwctl station wlan0 show");

  const result = {};
  const isConnected =
    wifiState.split("\n").find((line) =>
      line.split(" ").find((word) => word.trim() === "State")
    ).split(" ").filter(Boolean)?.[1] === "connected";

  if (isConnected) {
    result.isConnected = true;
    result.network = wifiState.split("\n").find((line) =>
      line.split(" ").find((word) => word.trim() === "network")
    ).split(" ").filter(Boolean)?.slice(2)?.join();
  }

  return result;
}

export function getAvailableWifiConnections() {
  return execAsync("iwctl station wlan0 get-networks")
    .then((res) => res.replace(/\x1B\[([0-9]{1,2}(;[0-9]{1,2})?)?[mGK]/g, ""))
    .then((result) => {
      print(result);
      const networks = [];
      const lines = result.split("\n"); //.map(ansi.stripStyle);
      for (let i = 4; i < lines.length; i++) {
        const line = lines[i].split(/ {2,}/g).map((word) => word.trim()).filter(
          Boolean,
        );
        print(line);
        const network = {};
        if (line[0] === ">") {
          network.connected = true;
          network.name = line[2];
        } else network.name = line[0];
        networks.push(network);
      }
      return networks;
    });
}

export function connectWifi(name, password) {
  const passphrase = password ? `--passphrase "${password}"` : "";
  return execAsync(`iwctl ${passphrase} station wlan0 connect ${name}`);
}
