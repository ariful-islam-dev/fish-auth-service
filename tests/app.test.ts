import request from "supertest";
import app from "../src/app";
import { describe, it } from "node:test";

describe("User Authentication", () => {
  it("should be a user registration", async () => {
    // const expect = chai.expect;
    await request(app)
      .post("/auth/register")
      .send({
        name: "Md. Ariful Islam Raju",
        email: "ariful123@gmail.com",
        password: "password123"
      })
      .expect(201);
  });
  it("should be a user email verification", async () => {
    // const expect = chai.expect;
    await request(app)
      .post("/auth/verify-email")
      .send({
        code: "75079",
        email:"ariful@gmail.com"
    })
      .expect(200);
  });

  it("should be a user token verification", async () => {
    // const expect = chai.expect;
    await request(app)
      .post("/auth/verify-token")
      .send({
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbHdienB4b3AwMDAwdnhxN2hwMHEzanI5IiwiZW1haWwiOiJhcmlmdWxAZ21haWwuY29tIiwibmFtZSI6Ik1kLiBBcmlmdWwgSXNsYW0iLCJyb2xlIjoiVVNFUiIsImlhdCI6MTcxNjM4NDc0OSwiZXhwIjoxNzE2NDcxMTQ5fQ.sCBmDHmfxiAftTeVDFipCPZMKYt3yqJglLmqsud06E8"
      })
      .expect(200);
  });
  it("should be a user Login", async () => {
    // const expect = chai.expect;
    await request(app)
      .post("/auth/login")
      .send({
        email: "ariful@gmail.com",
        password:"password123"
      })
      .expect(200);
  });
  
});
