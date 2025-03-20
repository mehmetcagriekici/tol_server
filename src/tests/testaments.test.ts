//Tests for testaments after authentication, checks RBAC

//imports
import request from "supertest";
import app from "@src/app";
import pool from "@src/config/db";

describe("Testaments API Tests", () => {
  let token: string;
  let testamentId: string;
  let deletedTestamentId: string;
  let creatorToken: string;

  beforeAll(async () => {
    //register a user
    await request(app).post("/auth/register").send({
      email: "testamentuser@example.com",
      username: "testamentuser",
      password: "Password123!",
    });

    //login to get a valid token
    const loginRes = await request(app).post("/auth/login").send({
      email: "testamentuser@example.com",
      password: "Password123!",
    });

    token = loginRes.body.token;

    //default user created in beforeAll has the user role, not authorized to INSERT
    //register a new user with the creator role
    //register a user
    await request(app).post("/auth/register").send({
      email: "creatoruser@example.com",
      username: "creatoruser",
      password: "Password123!",
    });

    //give user the creator role
    await pool.query(
      "UPDATE romans SET testament_role = 'creator' WHERE email = $1",
      ["creatoruser@example.com"]
    );

    //login new user and get a new token
    const creatorLoginRes = await request(app).post("/auth/login").send({
      email: "creatoruser@example.com",
      password: "Password123!",
    });

    creatorToken = creatorLoginRes.body.token;

    //insert a sample testament and store its ID
    const testamentRes = await pool.query(
      `
        INSERT INTO testaments (title, content, created_by, members)
        VALUES ('Testament 1', '{}'::jsonb, (SELECT id FROM romans WHERE email = $1), '{}'::jsonb)
        RETURNING id
        `,
      ["creatoruser@example.com"]
    );

    const deletedTestamentRes = await pool.query(
      `
        INSERT INTO testaments (title, content, created_by, members)
        VALUES ('Testament 1', '{}'::jsonb, (SELECT id FROM romans WHERE email = $1), '{}'::jsonb)
        RETURNING id
        `,
      ["creatoruser@example.com"]
    );

    testamentId = testamentRes.rows[0].id;
    deletedTestamentId = deletedTestamentRes.rows[0].id;
  });

  /**
   * GET /testaments
   * Ensure an authorized user with SELECT permission can retrieve testaments 200 OK
   * All authenticated users are allowed to SELECT from the testaments
   */
  describe("Testaments API Tests", () => {
    test("Should return all testaments for an authorized user", async () => {
      const res = await request(app)
        .get("/testaments/all")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  /**
   * Get /testaments/:id
   * Sould return a specific testament for an authorized user (200 OK)
   * Should return 404 Not Found for a non-existent testament
   * Shoud return 400 Bad Request for an invail UUID format
   */
  describe("Get /testaments/:id", () => {
    test("Should return a specific testament for an authorized user", async () => {
      const res = await request(app)
        .get(`/testaments/single/${testamentId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(testamentId);
      expect(res.body.title).toBeDefined();
      expect(res.body.content).toBeDefined();
      expect(res.body.created_by).toBeDefined();
      expect(res.body.members).toBeDefined();
    });

    test("Should return 404 Not Found for a non-existent testament", async () => {
      const res = await request(app)
        .get(`/testaments/single/8f3a91d5-4b9e-438e-bfa1-abcdef123456`) //Random UUID
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Testament not found");
    });

    test("Shoud return 400 Bad Request for an invail UUID format", async () => {
      const res = await request(app)
        .get(`/testaments/single/invalid-uuid`) //Random UUID
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Invalid testament ID");
    });
  });

  /**
   * POST /testaments
   * First test ensures authorized users can create testaments (201 Created).
   * Second test ensures missing fields result in 400 Bad Request.
   * Third test ensures users without INSERT permission get 403 Forbidden.
   */
  describe("POST /testaments", () => {
    test("Should create a new testament for an authorized user", async () => {
      //get the creator id
      const creatorRes = await pool.query(
        `
        SELECT id FROM romans WHERE email = $1
        `,
        ["creatoruser@example.com"]
      );
      //uses the new user
      const res = await request(app)
        .post("/testaments/new")
        .set("Authorization", `Bearer ${creatorToken}`)
        .send({
          title: "Testament1",
          content: {},
          created_by: creatorRes.rows[0].id,
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.title).toBe("Testament1");
      expect(res.body.content).toBeDefined();
      expect(res.body.created_by).toBeDefined();
      expect(res.body.members).toBeDefined();
    });

    test("Should return 400 Bad request if required fields are missing", async () => {
      const res = await request(app)
        .post("/testaments/new")
        .set("Authorization", `Bearer ${creatorToken}`)
        .send({ content: {}, members: {} });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Missing required fields");
    });

    test("Should return 403 Forbidden if the user lacks INSERT permission", async () => {
      const res = await request(app)
        .post("/testaments/new")
        .set("Authorization", `Bearer ${token}`) //default token
        .send({ title: "Testament1", content: {}, members: {} });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe("Forbidden: Insufficient permissions");
    });
  });

  /**
   * PUT /testaments/:id (Updating a testmanent)
   * First test ensures an authorized user can update a testament (200 OK)
   * Second test ensures unauthorized users cannot update (403 Forbidden)
   * Third test ensures non-existent IDs return 404 Not Found
   * Fourth test ensures invalid UUIDs return 400 Bad Request
   */
  describe("PUT /testaments/:id", () => {
    test("Should update a testament for an authorized user", async () => {
      //update the existing testament
      const res = await request(app)
        .put(`/testaments/modified/${testamentId}`)
        .set("Authorization", `Bearer ${creatorToken}`)
        .send({ title: "Updated Testament Title", content: {}, members: {} });

      //expect 200 OK and updated fields
      expect(res.status).toBe(200);
      expect(res.body.title).toBe("Updated Testament Title");
    });

    test("Should return 403 Forbidden if the user lacks UPDATE permission", async () => {
      //update the existing testament
      const res = await request(app)
        .put(`/testaments/modified/${testamentId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Updated Testament Title", content: {}, members: {} });

      //expect 403 Forbidden
      expect(res.status).toBe(403);
      expect(res.body.error).toBe("Forbidden: Insufficient permissions");
    });

    test("Should return 404 Not Found if the testament does not exist", async () => {
      //update the existing testament
      const res = await request(app)
        .put(`/testaments/modified/8f3a91d5-3b9e-438e-bfa1-abcdef123456`) //random valid uuid
        .set("Authorization", `Bearer ${creatorToken}`)
        .send({ title: "Updated Testament Title", content: {}, members: {} });

      //expect 404 Not Found
      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Testament not found");
    });

    test("Should return 400 Bad Request for an invalid UUID", async () => {
      //update the existing testament
      const res = await request(app)
        .put(`/testaments/modified/invalid uuid`)
        .set("Authorization", `Bearer ${creatorToken}`)
        .send({ title: "Updated Testament Title", content: {}, members: {} });

      //expect 400 Bad Request
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Invalid testament ID");
    });
  });

  /**
   * DELETE /testaments/:id
   * First test ensures an authorized user can delete a testament (200 OK)
   * Second test ensures unauthorized users cannot delete (403 Forbidden)
   * Third test ensures non-existent IDs return 404 Not Found
   * Fourth test ensures invalid UUIDs return 400 Bad Request
   */
  describe("DELETE /testaments/:id", () => {
    test("Should delete a testmament for an authorized user", async () => {
      const res = await request(app)
        .delete(`/testaments/expired/${deletedTestamentId}`)
        .set("Authorization", `Bearer ${creatorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Testament deleted successfully");

      //ensure the testament no longer exists
      const checkRes = await pool.query(
        "SELECT * FROM testaments WHERE id = $1",
        [deletedTestamentId]
      );

      expect(checkRes.rows.length).toBe(0);
    });

    test("Should return 403 Forbidden if the user lacks DELETE permission", async () => {
      const res = await request(app)
        .delete(`/testaments/expired/${testamentId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe("Forbidden: Insufficient permissions");
    });

    test("Should return 404 Not Found if the testament does not exist", async () => {
      const res = await request(app)
        .delete(
          `/testaments/expired/8f3a91d5-3b9e-438e-bfa1-abcaef123451` //Random UUID
        )
        .set("Authorization", `Bearer ${creatorToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Testament not found");
    });

    test("Should return 400 Bad Request for an invalid UUID", async () => {
      const res = await request(app)
        .delete("/testaments/expired/invalid uuid")
        .set("Authorization", `Bearer ${creatorToken}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Invalid testament ID");
    });
  });

  afterAll(async () => {
    //remove test data
    await pool.query("DELETE FROM testaments");
    await pool.query("DELETE FROM romans");

    //close the database connection
    await pool.end();
  });
});
