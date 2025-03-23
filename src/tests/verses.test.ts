//Tests for verses
//for five main features (SELCET ALL, SELECT BY ID, INSTERT, UPDATE, DELETE)

//imports
import request from "supertest";
import app from "@src/app";
import pool from "@src/config/db";

describe("Verses API Tests", () => {
  //authentication tokens
  //without the persmission
  let unauthorizedToken: string;
  //with the permission
  let authorizedToken: string;
  //parent testamentId
  let testamentId: string;
  //verse id
  let verseId: string;
  //deleted verse id - will be deleted
  let deletedVerseId: string;

  /**
   * before the tests
   * register an authorized user
   * register an unauthorized user
   * login the authorized user (authorizedToken)
   * login the unauthorized user (unAuthorizedToken)
   * insert a testament with the authorized user (testamentId)
   * insert a verse with the authorized user (verId)
   * insert a verse that is going to be deleted with the authorized user (deletedVerseId)
   */
  beforeAll(async () => {
    //register a user who will not receive authorization (admin role)
    await request(app).post("/auth/register").send({
      email: "unauthorizedUser@example.com",
      username: "unauthorizedUser",
      password: "Password123!",
    });

    //register a user who will receive authorization (admin role)
    await request(app).post("/auth/register").send({
      email: "adminUser@example.com",
      username: "adminUser",
      password: "Password123!",
    });

    //login the users and assign tokens
    const unauthorizedLoginRes = await request(app).post("/auth/login").send({
      email: "unauthorizedUser@example.com",
      password: "Password123!",
    });

    const adminLoginRes = await request(app).post("/auth/login").send({
      email: "adminUser@example.com",
      password: "Password123!",
    });

    //give user the authorization
    await pool.query(
      `
      UPDATE romans
      SET testament_role = 'admin'
      WHERE email = $1
        `,
      ["adminUser@example.com"]
    );

    unauthorizedToken = unauthorizedLoginRes.body.token;
    authorizedToken = adminLoginRes.body.token;

    //insert a parent testament for the verses and store its id
    const testamentRes = await pool.query(
      `
        INSERT INTO testaments
        (title, content, created_by, members)
        VALUES ('Parent Testament', '{}'::jsonb, (SELECT id FROM romans WHERE email = $1), '{}'::jsonb)
        RETURNING id
        `,
      ["adminUser@example.com"]
    );

    testamentId = testamentRes.rows[0].id;

    //insert a verse
    const verseRes = await pool.query(
      `
        INSERT INTO verses
        (subtitle, content, created_by, testament_id)
        VALUES ('Test Verse', '{}'::jsonb, (SELECT id FROM romans WHERE email = $1), $2)
        RETURNING id
        `,
      ["adminUser@example.com", testamentId]
    );

    verseId = verseRes.rows[0].id;

    //insert a verse that is about to be deleted
    const deletedVerseRes = await pool.query(
      `
          INSERT INTO verses
          (subtitle, content, created_by, testament_id)
          VALUES ('Deleted Test Verse', '{}'::jsonb, (SELECT id FROM romans WHERE email = $1), $2)
          RETURNING id
          `,
      ["adminUser@example.com", testamentId]
    );

    deletedVerseId = deletedVerseRes.rows[0].id;
  });

  /**
   * GET /verses
   * Ensure an authorized user with SELECT permission can retrieve verses 200 OK
   * Even the unauthorizedToken is authorized for SELECT
   */
  describe("GET /verses", () => {
    test("Should return all verses for an authorized user with the correct parent testamen ID", async () => {
      //send the request and get the response
      const res = await request(app)
        .get(`/verses/${testamentId}`)
        .set("Authorization", `Bearer ${unauthorizedToken}`);

      //test results
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  /**
   * Get /verses/:id (verse_id)
   * Should return a specific verse for an authorized user (200 OK)
   * Should return 404 Not Found for a non-existent verse
   * Should return 400 Bad Request for an invalid uuid format
   */
  describe("GET /verses/:id", () => {
    test("Should return a specific verse for an authorized user", async () => {
      //send the request and get the response
      const res = await request(app)
        .get(`/verses/${testamentId}/${verseId}`)
        .set("Authorization", `Bearer ${unauthorizedToken}`);

      //test results
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(verseId);
      expect(res.body.testament_id).toBe(testamentId);
    });

    test("Should return 404 Not Found for a non-existent verse", async () => {
      //send the request with a random but valid uuid
      const res = await request(app)
        .get(`/verses/${testamentId}/75110aeb-e855-4115-8d4d-d7668ab8e143`)
        .set("Authorization", `Bearer ${unauthorizedToken}`);

      //test results
      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Verse not found");
    });

    test("Should return 400 Bad Request for an invalid uuid format", async () => {
      //send the response with an ivalid verse_id
      const res = await request(app)
        .get(`/verses/${testamentId}/invalid-uuid`)
        .set("Authorization", `Bearer ${unauthorizedToken}`);

      //test results
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Invalid testament ID");
    });
  });

  /**
   * POST /verses
   * First test ensures authorized users can create testaments (201 Created)
   * Second test ensures missing fields result in 400 Bad request
   * Third test ensures user without INSERT permission get 403 Forbidden
   */
  describe("POST /verses", () => {
    test("Should create a new testament for an authorized user", async () => {
      //get the authorized user id
      const authorizedUserRes = await pool.query(
        "SELECT id FROM romans WHERE email = $1",
        ["adminUser@example.com"]
      );

      const adminId = authorizedUserRes.rows[0].id;

      //make the request
      const res = await request(app)
        .post("/verses/new")
        .set("Authorization", `Bearer ${authorizedToken}`)
        .send({
          subtitle: "Newly Create Verse 1",
          content: {},
          created_by: adminId,
          testament_id: testamentId,
        });

      const createdRes = await pool.query(
        "SELECT id FROM verses WHERE subtitle = $1",
        ["Newly Create Verse 1"]
      );

      const newVerseId = createdRes.rows[0].id;

      //test results
      expect(res.status).toBe(201);
      expect(res.body.id).toBe(newVerseId);
      expect(res.body.testament_id).toBe(testamentId);
      expect(res.body.created_by).toBe(adminId);
    });

    test("Should return 400 Bad Requst if required fields are missing", async () => {
      const res = await request(app)
        .post("/verses/new")
        .set("Authorization", `Bearer ${authorizedToken}`)
        .send({ testament_id: testamentId });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Missing required fields");
    });

    test("Should return 403 Forbidden if the user lacks INSERT permission", async () => {
      //get the unauthorized user id
      const unauthorizedUserRes = await pool.query(
        "SELECT id FROM romans WHERE email = $1",
        ["unauthorizedUser@example.com"]
      );
      const res = await request(app)
        .post("/verses/new")
        .set("Authorization", `Bearer ${unauthorizedToken}`)
        .send({
          subtitle: "Unauthorized Verse",
          content: {},
          created_by: unauthorizedUserRes.rows[0].id,
          testament_id: testamentId,
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe("Forbidden: Insufficient permissions");
    });
  });

  /**
   * PUT /verses/:id
   * First test ensures that an authorized user can update a verse (200 OK)
   * Second test ensures that unauthorized users can't update (403 Forbidden)
   * Third test ensures that non-existent IDs return 404 Not Found
   * Fourth test ensures that invalid uuids return 400 Bad Request
   */
  describe("PUT /verses/:id", () => {
    test("Should update a testament for an authorized user", async () => {
      const res = await request(app)
        .put(`/verses/updated/${testamentId}/${verseId}`)
        .set("Authorization", `Bearer ${authorizedToken}`)
        .send({
          subtitle: "Updated Verse",
          content: {},
          testament_id: testamentId,
        });

      expect(res.status).toBe(200);
      expect(res.body.subtitle).toBe("Updated Verse");
    });

    test("Should return 403 Forbidden if the user lacks UPDATE permission", async () => {
      const res = await request(app)
        .put(`/verses/updated/${testamentId}/${verseId}`)
        .set("Authorization", `Bearer ${unauthorizedToken}`)
        .send({
          subtitle: "Unauthorized Updated Verse",
          content: {},
          testament_id: testamentId,
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe("Forbidden: Insufficient permissions");
    });

    test("Should return 404 Not Found if the verse does not exist", async () => {
      const res = await request(app)
        .put(
          `/verses/updated/${testamentId}/cc96a344-b454-4cb3-8119-f19783c088ba`
        )
        .set("Authorization", `Bearer ${authorizedToken}`)
        .send({
          subtitle: "Verse Not Found",
          content: {},
          testament_id: testamentId,
        });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Verse not found");
    });
  });

  test("Should return 400 Bad Request for and invalid uuid", async () => {
    const res = await request(app)
      .put(`/verses/updated/${testamentId}/invalid-uuid`)
      .set("Authorization", `Bearer ${authorizedToken}`)
      .send({
        subtitle: "Verse with Invalid UUID",
        content: {},
        testament_id: testamentId,
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid verse ID");
  });

  /**
   * DELETE /verses/:id
   * First test ensures that an authorized user can delete a verse (200 OK)
   * Second test ensures that unauthorized users can't delete (403 Forbidden)
   * Third test ensures that non-existent IDs return 404 Not Found
   * Fourth test ensures that invalid uuids return 400 Bad Request
   */
  describe("DELETE /verses/:id", () => {
    test("Should delete a verse for an authorized user", async () => {
      const res = await request(app)
        .delete(`/verses/deleted/${testamentId}/${deletedVerseId}`)
        .set("Authorization", `Bearer ${authorizedToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Verse deleted successfully");

      const isDeletedRes = await pool.query(
        "SELECT * FROM verses WHERE id = $1",
        [deletedVerseId]
      );

      expect(isDeletedRes.rows.length).toBe(0);
    });

    test("Should return 403 Forbidden if the user lacks DELETE permission", async () => {
      const res = await request(app)
        .delete(`/verses/deleted/${testamentId}/${deletedVerseId}`)
        .set("Authorization", `Bearer ${unauthorizedToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe("Forbidden: Insufficient permissions");
    });

    test("Should return 404 Not Found if the verse does not exist", async () => {
      const res = await request(app)
        .delete(
          `/verses/deleted/${testamentId}/d1dcc3ef-6c0c-47e7-bcc9-d7a3929370fb`
        )
        .set("Authorization", `Bearer ${authorizedToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Verse not found");
    });

    test("Should return 400 Bad Request for an invalid uuid", async () => {
      const res = await request(app)
        .delete(`/verses/deleted/${testamentId}/invalid uuid`)
        .set("Authorization", `Bearer ${authorizedToken}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Invalid verse ID");
    });
  });

  afterAll(async () => {
    await pool.query("DELETE FROM verses");
    await pool.query("DELETE FROM romans");
    // await pool.end(); //Run only while running individually
  });
});
