// Send the initial testaments and the verses to the database
// Development only

//imports
import pool from "../src/config/db";
import { v4 as uuidv4 } from "uuid";
import { insertTestament } from "./utils/insertTestament";
import { insertVerse } from "./utils/insertVerse";

async function seed() {
  //connect to the database
  const client = await pool.connect();

  try {
    //start a transaction
    await client.query("BEGIN");

    //create a base user ID for created_by of initial testaments and verses (valid uuid)
    const baseUserId = process.env.BASE_USER_ID ?? uuidv4();
    const baseUserPassword = process.env.BASE_USER_PASSWORD ?? uuidv4();
    const basueUserUsername = process.env.BASE_USER_USERNAME ?? "";
    const baseUserEmail = process.env.BASE_USER_EMAIL ?? "";
    const baseUserTestamentRole = process.env.BASE_USER_ROLE ?? "user";

    //base testament values
    let baseTestamentContent = {}; //empty for now
    const baseTestamentId = uuidv4();
    const baseTestamentTitle = "Genesis - In the Beginning";
    const baseTestamentCreated_by = baseUserId;
    const baseTestamentMembers = {}; //empty at initiation

    //other base user values
    const baseUserExedus = { 0: baseTestamentId };

    //insert the user into romans
    await client.query(
      `INSERT INTO romans (id, username, email, password, testament_role, exedus)
       VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        baseUserId,
        basueUserUsername,
        baseUserEmail,
        baseUserPassword,
        baseUserTestamentRole,
        baseUserExedus,
      ]
    );

    //Insert the base testament
    await insertTestament(
      client,
      baseTestamentTitle,
      baseTestamentContent,
      baseTestamentCreated_by,
      baseTestamentMembers,
      baseTestamentId
    );

    //Insert the base verses
    //base verses values
    //verse - 1
    const verse1 = {
      client,
      subtitle: "The Light",
      content: { text: "Let there be light.", S: baseTestamentId },
      created_by: baseUserId,
      subscribers: {},
      testament_id: baseTestamentId,
      id: uuidv4(),
    };
    //verse - 2
    const verse2 = {
      client,
      subtitle: "The Sky",
      content: {
        text: "Let there be a dome in the middle of the waters.",
        E: baseTestamentId,
      },
      created_by: baseUserId,
      subscribers: {},
      testament_id: baseTestamentId,
      id: uuidv4(),
    };
    //verse - 3
    const verse3 = {
      client,
      subtitle: "The Land",
      content: {
        text: "Let the earth bring forth vegetation.",
        N: baseTestamentId,
      },
      created_by: baseUserId,
      subscribers: {},
      testament_id: baseTestamentId,
      id: uuidv4(),
    };
    //verse - 4
    const verse4 = {
      client,
      subtitle: "The Stars",
      content: {
        text: "Let there be lights in the dome of the sky, to separate day from night, to mark the seasons, the days and the years.",
        W: baseTestamentId,
      },
      created_by: baseUserId,
      subscribers: {},
      testament_id: baseTestamentId,
      id: uuidv4(),
    };

    [verse1, verse2, verse3, verse4].forEach((verse) => {
      insertVerse(
        verse.client,
        verse.subtitle,
        verse.content,
        verse.created_by,
        verse.subscribers,
        verse.testament_id,
        verse.id
      );
    });

    //Link yhe verses in content of the testament (directional navigation)
    baseTestamentContent = {
      [verse1.id]: {
        creator_id: baseUserId,
        S: baseTestamentId,
      },
      [verse2.id]: {
        creator_id: baseUserId,
        E: baseTestamentId,
      },
      [verse3.id]: {
        creator_id: baseUserId,
        N: baseTestamentId,
      },
      [verse4.id]: {
        creator_id: baseUserId,
        W: baseTestamentId,
      },
    };

    await client.query(
      `
        UPDATE testaments SET content = $1 WHERE id = $2
        `,
      [baseTestamentContent, baseTestamentId]
    );

    //Commit and save everything if there are no errors
    await client.query("COMMIT");
  } catch (error) {
    console.error(error);
    //Rollback and undo all inserts so the db stays clean
    await client.query("ROLLBACK");
  } finally {
    //relase the db connection back to the pool
    client.release();
    //close the script
    process.exit();
  }
}

//run the script
seed();
