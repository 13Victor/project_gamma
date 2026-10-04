import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    // Iconos de campeones (Data Dragon). Ver `imageUrl` en types/champion.ts.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ddragon.leagueoflegends.com",
        pathname: "/cdn/**",
      },
    ],
  },
};

export default nextConfig;
