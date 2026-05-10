from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncpg
import asyncio
import httpx
import os
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()

DB_URL = os.getenv("DATABASE_URL")
APIFY_TOKEN = os.getenv("APIFY_TOKEN")

db_pool = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global db_pool
    db_pool = await asyncpg.create_pool(DB_URL)
    await init_db()
    yield
    await db_pool.close()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

async def init_db():
    async with db_pool.acquire() as conn:
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                github_handle TEXT,
                codeforces_handle TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        """)
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS scores (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                event_type TEXT,
                points INTEGER DEFAULT 0,
                source TEXT,
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        """)
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS mentorship_sessions (
                id SERIAL PRIMARY KEY,
                mentor_id INTEGER REFERENCES users(id),
                mentee_id INTEGER REFERENCES users(id),
                code_snippet TEXT,
                review TEXT,
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        """)
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS ai_impact (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                copilot_lines INTEGER DEFAULT 0,
                ai_tools_used TEXT,
                logged_at TIMESTAMPTZ DEFAULT NOW()
            )
        """)

class UserRegister(BaseModel):
    name: str
    email: str
    github_handle: str

async def fetch_github_stats(github_handle: str):
    url = f"https://api.apify.com/v2/acts/muscular_quadruplet~github-scraper/run-sync-get-dataset-items?token={APIFY_TOKEN}&timeout=30"
    payload = {
        "mode": "user",
        "username": github_handle,
        "maxResults": 100
    }
    async with httpx.AsyncClient(timeout=40) as client:
        try:
            response = await client.post(url, json=payload)
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                total_repos = len(data)
                total_stars = sum(repo.get("stars", 0) for repo in data)
                total_forks = sum(repo.get("forks", 0) for repo in data)
                score = (total_repos * 10) + (total_stars * 5) + (total_forks * 3)
                return score
            return 50
        except Exception as e:
            print("APIFY ERROR:", str(e))
            return 50
         
@app.post("/users/register")
async def register_user(user: UserRegister):
    async with db_pool.acquire() as conn:
        existing = await conn.fetchrow("SELECT id FROM users WHERE email = $1", user.email)
        if existing:
            return {"error": "Email already registered"}

        row = await conn.fetchrow(
            "INSERT INTO users (name, email, github_handle) VALUES ($1, $2, $3) RETURNING id",
            user.name, user.email, user.github_handle
        )
        user_id = row["id"]

        score = await fetch_github_stats(user.github_handle)

        await conn.execute(
            "INSERT INTO scores (user_id, event_type, points, source) VALUES ($1, $2, $3, $4)",
            user_id, "github_seed", score, "apify"
        )

        return {"message": "User registered", "user_id": user_id, "initial_score": score}

@app.get("/leaderboard")
async def get_leaderboard():
    async with db_pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT u.name, u.github_handle, COALESCE(SUM(s.points), 0) as total_points
            FROM users u
            LEFT JOIN scores s ON u.id = s.user_id
            GROUP BY u.id, u.name, u.github_handle
            ORDER BY total_points DESC
            LIMIT 20
        """)
        return [dict(r) for r in rows]
    
@app.delete("/admin/reset-hard")
async def reset_hard():
    async with db_pool.acquire() as conn:
        await conn.execute("TRUNCATE TABLE scores, mentorship_sessions, ai_impact, users RESTART IDENTITY CASCADE")
    return {"message": "Hard reset complete"}

@app.get("/health")
async def health():
    return {"status": "ok"}

from groq import Groq

class MentorRequest(BaseModel):
    mentee_id: int
    code_snippet: str
    problem_description: str

@app.post("/agents/mentor")
async def mentor_agent(request: MentorRequest):
    groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    
    prompt = f"""You are an expert code mentor reviewing code for an Indian developer community platform called BuildersHub.

Problem the developer was solving:
{request.problem_description}

Code submitted for review:
{request.code_snippet}

Provide a structured code review with exactly these sections:
1. SUMMARY: One sentence overall assessment
2. STRENGTHS: 2-3 things done well
3. ISSUES: 2-3 specific problems found
4. SUGGESTIONS: Concrete fixes with corrected code snippets
5. SCORE: A score out of 100

Be direct, specific, and encouraging."""

    chat_completion = groq_client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.3-70b-versatile",
    )
    
    review = chat_completion.choices[0].message.content
    
    async with db_pool.acquire() as conn:
        await conn.execute(
            """INSERT INTO mentorship_sessions 
               (mentee_id, code_snippet, review, status) 
               VALUES ($1, $2, $3, $4)""",
            request.mentee_id, request.code_snippet, review, "completed"
        )
        
        await conn.execute(
            """INSERT INTO scores (user_id, event_type, points, source) 
               VALUES ($1, $2, $3, $4)""",
            request.mentee_id, "mentorship", 20, "zynd_mentor_agent"
        )
    
    return {"review": review, "status": "completed", "points_awarded": 20}