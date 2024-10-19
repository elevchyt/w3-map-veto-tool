// This is the w3champions API endpoint to fetch ladder maps data (aka map pools)
export const w3championsLadderMapsDataURL =
  "https://website-backend.w3champions.com/api/ladder/active-modes";

// This is the warcraft3.info API endpoint to fetch maps data
// At the moment, we only use it to get the images of each map and
// fetching it by adding it at the end of their current image hosting domain
// which is the one stored in the w3InfoMapsDomain constant
export const warcraft3InfoMapsURL =
  "https://website-backend.w3champions.com/api/ladder/active-modes";
export const w3InfoMapsDomain = "https://d3upx5peno0o6w.cloudfront.net";
