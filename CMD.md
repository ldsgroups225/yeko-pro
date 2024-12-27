// cSpell:disable

# Next.js v15 Docker Deployment Guide with Bun

## Build and Deploy Commands

Build the Docker image with build arguments:

```bash
docker build -t nextjs-app --build-arg NODE_ENV=production .
```

Run the container with resource limits:

```bash
docker run -p 3000:3000 --memory=1g --cpus=1 nextjs-app
```

Deploy using Docker Compose:

```bash
docker compose -f compose.yml up -d
```

## Best Practices and Security Considerations

1. **Environment Variables**

   - Use `.env.production` for production environment variables
   - Never commit sensitive environment variables to version control
   - Use secrets management in production

2. **Security**

   - Regular security updates: `docker compose pull && docker compose up -d`
   - Implement rate limiting for API routes
   - Use security headers (configured in next.config.js)
   - Run containers with non-root user (implemented in Dockerfile)

3. **Monitoring**

   - Use the health check endpoint for container orchestration
   - Implement logging strategy
   - Monitor resource usage

4. **Performance**

   - Multi-stage builds minimize image size
   - Use build caching effectively
   - Implement resource limits
   - Configure proper garbage collection

5. **Maintenance**
   - Regular updates for dependencies
   - Backup strategy for persistent data
   - Monitoring and alerting setup
