# Warcraft 3 Map Veto Tool

A streamlined ban/pick map process for Warcraft 3 leagues and tournaments.

## Features

- Multiple pre-configured map pools (W3Champions 1v1, 2v2, 4v4, GNL Season 17, etc.)
- Various pick/ban modes (ABBAAB, Bo3, Bo5, AB, AABB)
- Real-time lobby synchronization
- Custom map pool options
- Shareable lobby links

## Contributing Custom Map Pools

If you would like to add your own custom map pool, you are free to open a PR. The process is pretty simple:

1. Define the map pool in `src/utils/customMapPools.ts`
2. Implement it using the `createMapPoolByMapNames` function in `src/app/page.tsx`

Look at how existing map pools are implemented if you need an example.
