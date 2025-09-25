**Live demo**: [cf-ai-agent-demo on Cloudflare Workers](https://cf-ai-agent-demo.7adamyasingh.workers.dev)

***Cloudflare Recruiters!***: please click the link above to test the application.

## CF AI Agent Demo

A minimal AI agent built from a starter template and extended to work with a Supabase PostgreSQL database. The agent includes a tool that lets it query your database using natural language (free‑text search) and return structured results.

### What’s included
- **Supabase PostgreSQL connection**: The app connects to your Supabase project to read data from Postgres. Credentials are supplied via environment variables.
- **Free‑text database query tool**: A custom agent tool translates natural‑language prompts into SQL, runs the query against Supabase, and returns results for the model to use.

### How it works (high level)
- The agent runs in the app runtime and can call the database tool when a user asks data‑related questions.
- The tool handles prompt → SQL translation, executes safely against Supabase, and provides structured answers back to the agent.


### Notes
- This project started from a template; the primary additions are the Supabase integration and the free‑text query tool.

### License
MIT — see `LICENSE`.


