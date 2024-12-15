const config = {
  providers: [
    {
      // Configure CLERK_JWT_ISSUER_DOMAIN on the Convex Dashboard
      // See https://docs.convex.dev/auth/clerk#configuring-dev-and-prod-instances
      domain: 'https://clear-feline-59.clerk.accounts.dev',
      applicationID: 'convex',
    },
  ],
}

export default config
