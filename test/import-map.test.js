const request = require("supertest");
const { app, setConfig } = require("../src/web-server");

beforeAll(() => {
  setConfig({
    manifestFormat: "importmap",
    username: "username",
    password: "password",
    locations: {
      prod: "memory://prod",
    },
  });
});

describe(`/import-map.json`, () => {
  it(`does not return anything when it's not setup yet.`, async () => {
    const healthResponse = await request(app)
      .get("/import-map.json")
      .expect(200)
      .expect("Content-Type", /json/);

    // we did not setup yet
    expect(healthResponse.body.message).toBe(undefined);
  });

  it(`does give back the same items after first patch`, async () => {
    const response = await request(app)
      .patch("/import-map.json")
      .query({
        skip_url_check: true,
      })
      .set("accept", "json")
      .send({
        imports: {
          a: "/a-1.mjs",
          b: "/b-1.mjs",
          c: "/c-1.mjs",
        },
      })
      .expect(200)
      .expect("Content-Type", /json/);

    // we did not setup yet
    expect(response.body).toMatchObject({
      imports: {
        a: "/a-1.mjs",
        b: "/b-1.mjs",
        c: "/c-1.mjs",
      },
      scopes: {},
    });
  });

  it(`The data is still in there`, async () => {
    const healthResponse = await request(app)
      .get("/import-map.json")
      .expect(200)
      .expect("Content-Type", /json/);

    // we did not setup yet
    expect(healthResponse.body).toMatchObject({
      imports: {
        a: "/a-1.mjs",
        b: "/b-1.mjs",
        c: "/c-1.mjs",
      },
      scopes: {},
    });
  });

  it(`does patch the service`, async () => {
    const healthResponse = await request(app)
      .patch("/services")
      .query({
        skip_url_check: true,
      })
      .set("accept", "json")
      .send({
        service: "a",
        url: "/a-1-updated.mjs",
      })
      .expect(200)
      .expect("Content-Type", /json/);

    // we did not setup yet
    expect(healthResponse.body).toMatchObject({
      a: "/a-1-updated.mjs",
      b: "/b-1.mjs",
      c: "/c-1.mjs",
    });
  });

  it(`does delete a service`, async () => {
    const healthResponse = await request(app)
      .delete("/services/b")
      .set("accept", "json")
      .expect(200)
      .expect("Content-Type", /json/);

    // we did not setup yet
    expect(healthResponse.body).toMatchObject({
      a: "/a-1-updated.mjs",
      c: "/c-1.mjs",
    });
  });
});
