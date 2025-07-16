This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [Clerk account](https://clerk.com/)
- [ngrok account](https://ngrok.com/)

## Getting Started

1. Create the `.env` file.

Copy the `.env.example` file to `.env`. We will fill in the values in the subsequent steps.

2. Create a new Clerk application.

Sign in to Clerk and navigate to the home page. From there, press the Create Application button to create a new application. Enter a title, select your sign-in options, and click Create Application.

Find the publishable key and secret key on the application page and add them to the `.env` file (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY).

3. Initialize database with Prisma

Run the following command to set up a postgres database with Prisma Postgres.

```bash
npx prisma init --db
```

Include the connection string in the `.env` file (DATABASE_URL).

4. Set up ngrok

Create a new [ngrok account](https://ngrok.com/) and set up your authtoken on your machine. Create a free domain and forward it to your local server.

```bash
npm install --global ngrok
ngrok http --url=[your-domain].ngrok-free.app 3000
```

Copy the ngrok Forwarding URL. This will be used to set the webhook URL in Clerk.

5. Add the webhook URL to Clerk

Navigate to the Webhooks section of your Clerk application located near the bottom of the Configure tab under Developers.

Click Add Endpoint and paste the ngrok URL into the Endpoint URL field and add /api/webhooks/clerk to the end of the URL. It should look similar to this:

```
https://[your-domain].ngrok-free.app/api/webhooks/clerk
```

Copy the Signing Secret and add it to your `.env` file (CLERK_WEBHOOK_SECRET).

6. Create blob storage

Create a new blob store in Vercel. Copy its token and add it to the `.env` file (BLOB_READ_WRITE_TOKEN).

7. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The commands `npm run build` and `npm run start` are used to build and start the production server. It is recommended to test these commands for any build issues before deploying to production.

## Deploying to Production

This project requires you to use your own domain name when deploying to production. If your domain is `example.com`, you will need to include both `example.com` and `*.example.com` as valid domains for your project.

Also, use this domain name for the webhook URL in your production Clerk application (for instance, `https://example.com/api/webhooks/clerk`). There is no need to use ngrok for production.

### Deploying to Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
