import "dotenv/config";

import {
  instances,
  minimumKarma,
  onlyImages,
  removalMessage,
  removeFromAllCommunities,
  sendMessages,
} from "../common/config.js";
import {
  detectImage,
  getInstanceFromActorId,
  getKarma,
} from "../common/helpers.js";
import { LogCategory, log } from "../common/log.js";

export default {
  sort: "New",
  handle: async ({
    postView: { creator, community, post },
    botActions: { sendPrivateMessage, removePost },
    __httpClient__,
  }) => {
    // Check if post has an image
    if (onlyImages && !detectImage(post)) {
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
    const instanceName = getInstanceFromActorId(community.actor_id);
    console.log(instanceName);

    const removalCommunity = Object.keys(instances).find((instance) => {
      if (instance !== instanceName) return false;

      return instances[instance].find((instanceCommunity) => {
        return community.name === instanceCommunity;
      });
    });

    if (!removeFromAllCommunities && !removalCommunity) {
      return;
    }

    // Remove the post

    removePost({
      post_id: post.id,
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
        .replace("${POST_TYPE}", "post")
        .replace("${POST_LINK}", post.ap_id)
        .replace("${POST_CONTENT_TYPE}", onlyImages ? "image posts" : "posts");

      sendPrivateMessage({
        recipient_id: creator.id,
        content: message,
      });
    }

    log(
      "REMOVED",
      `Removed post from ${creator.actor_id} in ${community.actor_id}`,
      LogCategory.SUCCESS
    );
  },
};
