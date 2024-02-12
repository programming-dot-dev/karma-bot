export function getInstanceFromActorId(actorId) {
  return actorId.match(/\/\/(.*)\/[cu]\//)[1];
}

export function detectImage(post) {
  // Regex to find images in post.url
  const urlRegex = /https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp)/;
  // Regex to find ![]() in post.body for embedded images
  const imageRegex = /!\[.*\]\(.*\)/g;
  return imageRegex.test(post.body) || urlRegex.test(post.url);
}

export function detectImageComment(comment) {
  // Regex to find ![]() in comment.content for embedded images
  const imageRegex = /!\[.*\]\(.*\)/g;
  return imageRegex.test(comment.content);
}

export function getKarma(personDetails) {
  let karma = 0;

  for (const comment of personDetails.comments) {
    karma += comment.counts.score - 1; // -1 to exclude self vote
  }

  for (const post of personDetails.posts) {
    karma += post.counts.score - 1;
  }

  return karma;
}

const whitelist = [
  "saptodon@programming.dev",
  "htammen@saptodon.org",
  "ChubakPDP11@programming.dev",
  "Vast_Emptiness@programming.dev",
];

export function checkWhitelist(user) {
  return whitelist.includes(user);
}
