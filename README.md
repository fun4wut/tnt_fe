# Introduction

This repo contains the code for Azure function side of the project Track and Trace. The task is to fetch the information from Carrier API, and then generate the preview page.

# Framework

![](/public/framework.png)

# Attention
1. This project used [Incremental Static Regeneration](https://nextjs.org/docs/basic-features/data-fetching#incremental-static-regeneration), the shipment was fetched in build time. And the pages will be cached by CDNs. That means you won't need to wait twice for the same shipment in a short period.
2. So deploying it on own server(such as Node.js) could be very difficult. Since it's just a static page, I decided to deploy it on [Vercel](https://vercel.com)
3. Cannot directly fetch details from DHL(Always timeout, but it works locally). So I had to fetch it from the Azure function
