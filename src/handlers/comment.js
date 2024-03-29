import "dotenv/config";

import {
  instances,
  minimumKarma,
  removalMessage,
  removeFromAllCommunities,
  sendMessages,
} from "../common/config.js";
import {
  checkWhitelist,
  detectImageComment,
  getInstanceFromActorId,
  getKarma,
} from "../common/helpers.js";
import { LogCategory, log } from "../common/log.js";

export default {
  sort: "New",
  handle: async ({
    commentView: { creator, community, comment },
    botActions: { sendPrivateMessage, removeComment },
    __httpClient__,
  }) => {
    // Check if comment has an image
    if (!detectImageComment(comment)) {
      return;
    }

    const instanceName = getInstanceFromActorId(community.actor_id);

    // Check if the user is whitelisted
    if (checkWhitelist(`${creator.name}@${instanceName}`)) {
      return;
    }

    // Check if the user has enough karma
    const personDetails = await __httpClient__.getPersonDetails({
      person_id: creator.id,
      sort: "New",
      limit: 50,
    });
    const karma = getKarma(personDetails);

    if (karma >= minimumKarma) {
      return;
    }

    // Detect if community is one of the ones we want to remove from OR if remove from all communities is true
    const removalCommunity = Object.keys(instances).find((instance) => {
      if (instance !== instanceName) return false;

      return Object.keys(instances[instance]).find(
        (instanceCommunity) => community.name === instanceCommunity
      );
    });

    if (!removeFromAllCommunities && !removalCommunity) {
      return;
    }

    removeComment({
      comment_id: comment.id,
      reason: "Not enough karma",
    });

    // Send a message to the user
    if (sendMessages) {
      // Check if community or user is in the bots instance
      const botinstance = process.env.LEMMY_INSTANCE;

      const userInstanceName = getInstanceFromActorId(creator.actor_id);

      if (instanceName !== botinstance && userInstanceName !== botinstance) {
        return;
      }

      // Replace vars in the removal message
      const message = removalMessage
        .replace("${POST_TYPE}", "comment")
        .replace("${POST_LINK}", comment.ap_id)
        .replace("${POST_CONTENT_TYPE}", "image comments");

      sendPrivateMessage({
        recipient_id: creator.id,
        content: message,
      });
    }

    // Remove the comment
    log(
      "REMOVED",
      `Removed comment from ${creator.actor_id} in ${community.actor_id}`,
      LogCategory.SUCCESS
    );
  },
};
