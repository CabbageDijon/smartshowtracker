// js/appwrite.js

// Destructure the classes we need from the global Appwrite object (loaded via CDN)
const { Client, Account, Databases, ID, Query } = Appwrite;

// Initialize the Appwrite Client
const client = new Client()
    .setEndpoint('https://[YOUR_COOLIFY_APPWRITE_DOMAIN]/v1') // e.g., https://appwrite.yourdomain.com/v1
    .setProject('[YOUR_PROJECT_ID]');                         // e.g., 65a8f9b...

// Initialize the services we will use
const account = new Account(client);
const databases = new Databases(client);

// Constants for your database (You'll need these in the next phase)
const DATABASE_ID = '[YOUR_DATABASE_ID]';
const COLLECTION_ID = '[YOUR_COLLECTION_ID]';
