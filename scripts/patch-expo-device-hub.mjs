import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const expoDirectory = path.dirname(require.resolve("expo/package.json"));
const prerequisitePath = path.join(
  expoDirectory,
  "node_modules/@expo/cli/build/src/start/doctor/apple/SimulatorAppPrerequisite.js",
);
const launcherPath = path.join(
  expoDirectory,
  "node_modules/@expo/cli/build/src/start/platforms/ios/ensureSimulatorAppRunning.js",
);
const deviceManagerPath = path.join(
  expoDirectory,
  "node_modules/@expo/cli/build/src/start/platforms/ios/AppleDeviceManager.js",
);

const oldResolver = `async function getSimulatorAppIdAsync() {
    return await getSimulatorAppIdViaAppleScriptAsync() ?? await getSimulatorAppIdFromBundleAsync();
}`;

const newResolver = `async function getSimulatorAppIdAsync() {
    const simulatorAppId = await getSimulatorAppIdViaAppleScriptAsync() ?? await getSimulatorAppIdFromBundleAsync();
    if (simulatorAppId) return simulatorAppId;
    try {
        return (await (0, _osascript().execAsync)('id of app "DeviceHub"')).trim();
    } catch {}
    try {
        const { stdout: developerDir } = await (0, _spawnasync().default)('xcode-select', [
            '--print-path'
        ]);
        const deviceHubInfoPlist = _path().default.join(developerDir.trim(), '..', 'Applications', 'DeviceHub.app', 'Contents', 'Info.plist');
        const { stdout: bundleId } = await (0, _spawnasync().default)('/usr/libexec/PlistBuddy', [
            '-c',
            'Print :CFBundleIdentifier',
            deviceHubInfoPlist
        ]);
        return bundleId.trim() || null;
    } catch {}
    return null;
}`;

const oldValidation = `if (result !== 'com.apple.iphonesimulator' && result !== 'com.apple.CoreSimulator.SimulatorTrampoline') {`;
const newValidation = `if (result !== 'com.apple.dt.Devices' && result !== 'com.apple.iphonesimulator' && result !== 'com.apple.CoreSimulator.SimulatorTrampoline') {`;

let source = fs.readFileSync(prerequisitePath, "utf8");

if (source.includes("com.apple.dt.Devices")) {
  console.log("Expo CLI DeviceHub support is already present.");
} else if (!source.includes(oldResolver) || !source.includes(oldValidation)) {
  throw new Error(
    "Unsupported Expo CLI layout; update the DeviceHub patch for the installed Expo version.",
  );
} else {
  source = source
    .replace(oldResolver, newResolver)
    .replace(oldValidation, newValidation);

  fs.writeFileSync(prerequisitePath, source);
  console.log("Patched Expo CLI to support Xcode DeviceHub.");
}

const oldRunningCheck = `'tell app "System Events" to count processes whose name is "Simulator"'`;
const newRunningCheck = `'tell app "System Events" to (count processes whose name is "Simulator") + (count processes whose name is "DeviceHub")'`;
const oldLauncher = `    await (0, _spawnasync().default)('open', args);`;
const newLauncher = `    try {
        await (0, _spawnasync().default)('open', args);
    } catch {
        args[1] = 'DeviceHub';
        await (0, _spawnasync().default)('open', args);
    }`;

let launcherSource = fs.readFileSync(launcherPath, "utf8");

if (launcherSource.includes(newRunningCheck)) {
  console.log("Expo CLI DeviceHub launcher support is already present.");
} else if (
  !launcherSource.includes(oldRunningCheck) ||
  !launcherSource.includes(oldLauncher)
) {
  throw new Error(
    "Unsupported Expo CLI launcher layout; update the DeviceHub patch for the installed Expo version.",
  );
} else {
  launcherSource = launcherSource
    .replace(oldRunningCheck, newRunningCheck)
    .replace(oldLauncher, newLauncher);

  fs.writeFileSync(launcherPath, launcherSource);
  console.log("Patched Expo CLI to launch Xcode DeviceHub.");
}

const oldActivation = `        await _osascript().execAsync(\`tell application "Simulator" to activate\`);`;
const newActivation = `        try {
            await _osascript().execAsync(\`tell application "Simulator" to activate\`);
        } catch {
            await _osascript().execAsync(\`tell application "DeviceHub" to activate\`);
        }`;

let deviceManagerSource = fs.readFileSync(deviceManagerPath, "utf8");

if (deviceManagerSource.includes('tell application "DeviceHub" to activate')) {
  console.log("Expo CLI DeviceHub window activation is already present.");
} else if (!deviceManagerSource.includes(oldActivation)) {
  throw new Error(
    "Unsupported Expo CLI device manager layout; update the DeviceHub patch for the installed Expo version.",
  );
} else {
  deviceManagerSource = deviceManagerSource.replace(oldActivation, newActivation);
  fs.writeFileSync(deviceManagerPath, deviceManagerSource);
  console.log("Patched Expo CLI to activate the Xcode DeviceHub window.");
}
