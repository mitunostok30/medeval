# Deployment Guide: Vercel + Neon PostgreSQL

This guide explains how to deploy the **MedEval** application using [Vercel](https://vercel.com) and [Neon PostgreSQL](https://neon.tech).

## Step 1: Prepare the Database (Neon)

1.  **Sign up** for a free account at [Neon.tech](https://neon.tech).
2.  **Create a new project** named `medeval`.
3.  In the Neon Dashboard, go to **Connection Details**.
4.  Copy the **Connection String** (PostgreSQL URI). It should look like this:
    `postgres://alex:pwd@db-host.neon.tech/neondb?sslmode=require`

## Step 2: Connect Neon to Vercel

1.  In your **Vercel Dashboard**, go to your project.
2.  Go to **Storage** -> **Connect Database**.
3.  Select **Neon** from the list of integrations.
4.  Follow the prompts to connect your Neon project. This will automatically add the required environment variables (`POSTGRES_URL`, etc.).
5.  **Redeploy** the project to ensure the new environment variables are active. (Go to **Deployments** -> find your latest deployment -> **Redeploy**).

## Step 3: Initialize and Seed the Database

Once the project is redeployed with the database connection:

1.  Navigate to your deployed URL followed by `/api/init`.
    *Example: `https://medeval-app.vercel.app/api/init`*
2.  You should see: `{"message": "Database initialized and seeded successfully"}`.
3.  The tables are now created and pre-filled with the default academic staff.

## Troubleshooting

If you see an error like `relation "teachers" does not exist`, it means Step 3 was skipped or failed. Simply visit `/api/init` again.

## Local Development with Neon

To use your Neon database locally, add the variables above to your `.env.local` file.

> [!TIP]
> You can also use the **Vercel Integration** for Neon to automatically sync environment variables. In Vercel, go to **Storage** -> **Connect Database** -> **Neon**.
