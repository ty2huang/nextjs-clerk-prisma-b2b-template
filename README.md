This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [Clerk account](https://clerk.com/)
- [ngrok account](https://ngrok.com/)

## Getting Started

1. Create a new Clerk application

Sign in to Clerk and navigate to the home page. From there, press the Create Application button to create a new application. Enter a title, select your sign-in options, and click Create Application.

2. Initialize Prisma

```bash
npx prisma init --db --output ../src/generated/prisma
```

3. Set up ngrok

Create a new [ngrok account](https://ngrok.com/) and set up your authtoken on your machine. Create a free domain and forward it to your local server.

```bash
npm install --global ngrok
ngrok http --url=[your-domain].ngrok-free.app 3000
```

Copy the ngrok Forwarding URL. This will be used to set the webhook URL in Clerk.

4. Add the webhook URL to Clerk

Navigate to the Webhooks section of your Clerk application located near the bottom of the Configure tab under Developers.

Click Add Endpoint and paste the ngrok URL into the Endpoint URL field and add /api/webhooks/clerk to the end of the URL. It should look similar to this:

```
https://your-domain.ngrok-free.app/api/webhooks/clerk
```

Copy the Signing Secret and add it to your .env file.

5. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
