<h1 align="center" - click me!>

<img src="https://github.com/user-attachments/assets/68dd9728-5083-443e-84e8-e85cce29463b" alt="Rizzed fox">

Foxpanel

<h4 align="center"> Highly feature rich, firfox new tab page, built for Baremetal</h4>

</h1>

## Features:

- Various web based widgets like Digital clock, Weather report, Calender, Github
  repo stats, Random quoates.
- System control panel for Arch linux including Volume control, Brightness
  control, Power management, Wifi and bluetooth management.
- Dynamically changing browser theme and new tab page wallpaper and theme.

## Gallery

![2025-02-10-032016_hyprshot](https://github.com/user-attachments/assets/15272ae6-0995-4b7c-bd40-54d0dd12d21f)
![2025-02-10-031929_hyprshot](https://github.com/user-attachments/assets/1890facb-718b-41c8-b57e-f753682529d9)
![2025-02-10-031850_hyprshot](https://github.com/user-attachments/assets/ef4c100e-b8ea-4356-be08-398eccf74254)

[Live demo](https://5hubham5ingh.github.io/foxpanel/)

## Requirements:-

1. [Baremetal](https://github.com/5hubham5ingh/baremetal?tab=readme-ov-file#baremetal)
   browser extension.
2. Firefox
3. [Baremetal](https://github.com/5hubham5ingh/baremetal?tab=readme-ov-file#native-function-integration)
   native app
4. [WallRizz + baremetal extension]() for generating and updating dynamic themes
   and wallpaper.

**Note:** Foxpanel is currently under development so some things will break or
not work properly yet.

## Setup

- Install and setup baremetal addon for firefox and install its native app.
  [see](https://github.com/5hubham5ingh/baremetal).
- Clone this repo and modify it to your pleasing then upload all the index and
  background.js files to baremetal and put main.js at `~/.config/baremetal/`.
- Restart the browser and open a new tab to test.
- For dynamic theme and wallpaper scripting is required. You can use
  [WallRizz](https://github.com/5hubham5ingh/WallRizz) with its firefox
  extensions
  [1](https://github.com/5hubham5ingh/WallRizz/blob/main/themeExtensionScripts/firefoxWallpaper%405hubham5ingh.js)
  [2](https://github.com/5hubham5ingh/WallRizz/blob/main/themeExtensionScripts/firefox%405hubham5ingh.js).
  or impliment your own theme and wallpaper generation, caching and update
  mechanism.
