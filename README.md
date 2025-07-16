# B2B Template

This is a [Next.js](https://nextjs.org) template for building B2B applications. It uses [Clerk](https://clerk.com/) for authentication and [Prisma](https://www.prisma.io/) for database and ORM.

## Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [Clerk account](https://clerk.com/)
- [ngrok account](https://ngrok.com/)

## Getting Started

1. Install dependencies

```bash
npm install
```

2. Create the `.env` file.

Copy the `.env.example` file to `.env`. We will fill in the values in the subsequent steps.

3. Create a new Clerk application.

Sign in to Clerk and navigate to the home page. From there, press the Create Application button to create a new application. Enter the application name, select your sign-in options, and click Create Application.

Find the publishable key and secret key for the application in the "Overview" tab, and add them to the `.env` file (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY).

In the "Configure" tab, go to the Organization Management Settings and ensure that the "Enable organizations" toggle is on.

The following changes in the "Configure" tab are optional but worth considering:
- "User & Authentication" > "Email, phone, username" > Enable "First and last name" > "Require first and last name"
- "Organization Management" > "Settings" > Disable "Allow new users to create organizations" and "Allow new members to delete organizations"

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

Pick the events to subscribe to. The following events are recommended to include:
- organization.created, organization.updated, organization.deleted
- user.created, user.updated, user.deleted

After creating the webhook, copy the Signing Secret and add it to your `.env` file (CLERK_WEBHOOK_SECRET).

6. Create blob storage

Create a new blob store in Vercel. Copy its token and add it to the `.env` file (BLOB_READ_WRITE_TOKEN).

7. Initialize database with Prisma

Run the following command to set up a postgres database with Prisma Postgres.

```bash
npx prisma init --db
```

Include the connection string in the `.env` file (DATABASE_URL).

8. Set up the database

Run the following command to create the database tables.

```bash
npx prisma migrate dev
```

9. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The commands `npm run build` and `npm run start` are used to build and start the production server. It is recommended to test these commands for any build issues before deploying to production.

## Deploying to Production

This project requires you to use your own domain name when deploying to production. If your domain is `example.com`, you will need to include both `example.com` and `*.example.com` as valid domains for your project. This includes setting the environment variable NEXT_PUBLIC_ROOT_DOMAIN for the production environment.

Also, use this domain name for the webhook URL in your production Clerk application (for instance, `https://example.com/api/webhooks/clerk`). There is no need to use ngrok for production.

Note that the subdomain is used to identify the current organization in the user session. To be robust, you should create a new organization without members in Clerk with the slug "www" such that it cannot be used as a slug for other organizations.

### Deploying to Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
