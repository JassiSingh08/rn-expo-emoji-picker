const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const root = path.resolve(__dirname, '..');
const pak = require('../package.json');

const config = getDefaultConfig(__dirname);

// The library is symlinked from the repo root (file:..). Watch the root so
// edits rebuild, but force every peer dependency to resolve to the example's
// copy — otherwise Metro would bundle two Reacts.
const modules = Object.keys(pak.peerDependencies ?? {});

config.watchFolders = [root];

config.resolver.blockList = new RegExp(
  modules
    .map((m) => `^${escape(path.join(root, 'node_modules', m))}/.*$`)
    .join('|')
);

config.resolver.extraNodeModules = modules.reduce((acc, name) => {
  acc[name] = path.join(__dirname, 'node_modules', name);
  return acc;
}, {});

module.exports = config;
