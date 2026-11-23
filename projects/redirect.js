const projects = {
  "ai-bidding": "ai-bidding-platform",
  "agent-platform": "agent-platform",
  "writing": "ai-writing-platform",
  "alpha-mining": "alpha-mining",
  "commerce-video": "commerce-video-agent",
  "listing": "listing-compliance",
  "amazon-image": "ai-image-editing",
  "agent-open": "agent-system-design",
  "ai-quant": "ai-quant-platform",
  "business-data-analysis": "business-data-analysis",
  "ai-bidding-platform": "ai-bidding-platform",
  "ai-writing-platform": "ai-writing-platform",
  "commerce-video-agent": "commerce-video-agent",
  "listing-compliance": "listing-compliance",
  "ai-image-editing": "ai-image-editing",
  "agent-system-design": "agent-system-design",
  "ai-quant-platform": "ai-quant-platform"
};
const id = new URLSearchParams(location.search).get("id");
if (Object.hasOwn(projects, id)) location.replace("./projects/" + projects[id] + ".html" + location.hash);
