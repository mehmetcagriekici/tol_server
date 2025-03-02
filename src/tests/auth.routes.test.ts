//Integration tests
//test API routes (signup, login, auth validation)

//imports
import request from "supertest";
import app from "@src/app";
import pool from "@src/config/db";

beforeAll(async () => {
  await pool.query("DELETE FROM romans"); //clean up test users
});

afterAll(async () => {
  await pool.end();
});

describe("Authentication API Tests", () => {
  let token: string;

  test("should sign up a new user", async () => {
    const res = await request(app).post("/auth/register").send({
      email: "test@example.com",
      username: "exmaple",
      password: "Password123!",
    });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("User registered successfully");
  });

  test("should log in an existing user", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "test@example.com",
      password: "Password123!",
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  test("should reject login with incorrect password", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "test@example.com",
      password: "WrongPassword",
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid credentials");
  });

  test("should get profile with valid token", async () => {
    const res = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("You are authenticated");
  });

  test("should reject profile access with invalid token", async () => {
    const res = await request(app)
      .get("/auth/me")
      .set("Authorization", "Bearer invalidtoken");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("jwt malformed");
  });
});
