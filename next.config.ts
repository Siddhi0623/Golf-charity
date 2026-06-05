import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // typedRoutes disabled until all app routes exist (Phase 3+)
  // experimental: { typedRoutes: true },
  turbopack: {
    // Point Turbopack to this project's root, not the OneDrive workspace root.
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
      // Supabase Storage public URLs follow this pattern:
      //   <project-ref>.supabase.co/storage/v1/object/public/<bucket>/<path>
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
