/**
 * @file Reads in the config values set in config.yaml and provides them for
 * the rest of the code to use
 */

import { load } from "js-yaml";
import { readFileSync } from "fs";

export const {
  showLogs,
  markAsBot,
  dryRun,
  minimumKarma,
  onlyImages,
  sendMessages,
  removalMessage,
  removeFromAllCommunities,
  instances,
} = (() => {
  let config = load(readFileSync("config.yaml", "utf8"));

  config.showLogs = config.showLogs ?? true;
  config.markAsBot = config.markAsBot ?? true;
  config.dryRun = config.dryRun ?? false;
  config.minimumKarma = config.minimumKarma ?? 25;
  config.onlyImages = config.onlyImages ?? true;
  config.sendMessages = config.sendMessages ?? true;
  config.removalMessage =
    config.removalMessage ??
    "Your ${POST_TYPE} ${POST_LINK} has been removed as you do not have enough activity on your account to create ${POST_CONTENT_TYPE} in that community";
  config.removeFromAllCommunities = config.removeFromAllCommunities ?? true;
  config.instances = config.instances ?? {};

  return config;
})();
