const [getTheme] = new NativeFunctions(
  "getTheme",
);
const [getWallpaper] = NativeFunctions("getWallpaper");
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
    const [setWallpaper] = SharedState("wall");
    setWallpaper(wallpaper);
  });

let lastThemeMTime;
const setTheme = () =>
  getTheme(lastThemeMTime).then(async (theme) => {
    console.log("Theme: ", theme);
    browser.theme.update(JSON.parse(theme.source));
    lastThemeMTime = theme.mTime;
    await setWallpaper();
  }).then(setTheme);
setTheme().catch((error) => {
  console.error("error in setTheme");
  throw error;
});
