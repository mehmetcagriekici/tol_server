//test utility functions
//check small isolated functions

//imports
import { hashPassword, comparePassword } from "@src/utils/password";
import { generateToken, verifyToken } from "@src/utils/jwt";

describe("Auth utility functions", () => {
  test("should hash and compare passwords correctly", async () => {
    const password = "mypassword";
    const hashedPassword = await hashPassword(password);

    expect(await comparePassword(password, hashedPassword)).toBe(true);
    expect(await comparePassword("wrongpassword", hashedPassword)).toBe(false);
  });

  test("should generate and verify JWT token", () => {
    const userId = "12345";
    const token = generateToken(userId);

    const decoded = verifyToken(token);

    expect((decoded as { userId: string }).userId).toBe(userId);
  });

  test("should fail verifying an invalid token", () => {
    expect(() => verifyToken("invalid.token.here")).toThrow();
  });
});
