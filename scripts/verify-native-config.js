#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const androidManifestPath = path.join(
  ROOT,
  "android/app/src/main/AndroidManifest.xml"
);
const iosInfoPlistPath = path.join(ROOT, "ios", "driverhelperapp", "Info.plist");

const requiredAndroidPermissions = [
  "android.permission.ACCESS_COARSE_LOCATION",
  "android.permission.ACCESS_FINE_LOCATION",
  "android.permission.ACCESS_BACKGROUND_LOCATION",
  "android.permission.FOREGROUND_SERVICE",
  "android.permission.FOREGROUND_SERVICE_LOCATION",
  "android.permission.IGNORE_BATTERY_OPTIMIZATIONS",
  "android.permission.WAKE_LOCK",
];

const requiredIosKeys = [
  "NSLocationWhenInUseUsageDescription",
  "NSLocationAlwaysAndWhenInUseUsageDescription",
  "UIBackgroundModes",
  "<string>location</string>",
];

function readFileIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf8");
}

function missingEntries(content, requiredValues) {
  return requiredValues.filter((value) => !content.includes(value));
}

const manifestContent = readFileIfExists(androidManifestPath);
const infoPlistContent = readFileIfExists(iosInfoPlistPath);

let hasFailure = false;
let hasMissingNative = false;

if (manifestContent) {
  const missingAndroid = missingEntries(manifestContent, requiredAndroidPermissions);
  if (missingAndroid.length) {
    hasFailure = true;
    console.error("Missing Android permissions:");
    missingAndroid.forEach((item) => console.error(` - ${item}`));
  }
} else {
  hasMissingNative = true;
  console.log("Android manifest not found in this checkout.");
}

if (infoPlistContent) {
  const missingIos = missingEntries(infoPlistContent, requiredIosKeys);
  if (missingIos.length) {
    hasFailure = true;
    console.error("Missing iOS Info.plist keys/values:");
    missingIos.forEach((item) => console.error(` - ${item}`));
  }
} else {
  hasMissingNative = true;
  console.log("iOS Info.plist not found in this checkout.");
}

if (hasFailure) {
  console.error("Native config verification failed.");
  process.exit(1);
}

if (hasMissingNative) {
  console.log("Run `npx expo prebuild --no-install` and re-run this verifier:");
  console.log("  npm run verify:native-config");
}

console.log("Native config verification passed for driver app.");
