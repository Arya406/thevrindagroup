import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/agent/",
          "/account/",
          "/api/",
          "/login",
          "/register",
          "/verify-otp",
          "/forgot-password",
        ],
      },
    ],
    sitemap: "https://thevrindagroup.com/sitemap.xml",
  };
}
