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

let maxVolume;
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
