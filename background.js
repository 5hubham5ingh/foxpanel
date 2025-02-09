const [getWallpaper, getTheme] = NativeFunctions("getWallpaper", "getTheme");
const [getWall, setWallpaperState] = SharedState("wall");
let lastWallpaperMTime;
const setWallpaper = () =>
  getWallpaper(lastWallpaperMTime).then((wallpaper) => {
    console.log(
      "wallpaper: ",
      wallpaper.source.length,
      "mTime: ",
      wallpaper.mTime,
    );
    lastWallpaperMTime = wallpaper.mTime;
    setWallpaperState(wallpaper);
  }).then(setWallpaper);

let lastThemeMTime;
const setTheme = () =>
  getTheme(lastThemeMTime).then(async (theme) => {
    console.log("Theme: ", theme);
    await browser.theme.update(JSON.parse(theme.source));
    lastThemeMTime = theme.mTime;
  }).then(setTheme);

setWallpaper();
setTheme();
