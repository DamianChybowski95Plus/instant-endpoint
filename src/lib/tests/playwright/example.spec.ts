import { instantEndpoint } from "@/index";
import { test, expect } from "@playwright/test";

import { z } from "zod";

test("init", async ({ page }) => {
    expect(1).toBe(1);
});

// test
const [PANCACES_ROUTE, CALL_PANCACES] = instantEndpoint(
    "https://localhost:3000/api/test",
    "GET",
    { headers: { "Content-Type": "application/json", pancaces: z.string() } },
    async (request, { headers }) => {
        console.log("q");
        return {
            url: request.url,
            pancaces: headers.pancaces,
        };
    }
);

const [PANCACES_ROUTE_POST, CALL_PANCACES_POST] = instantEndpoint(
    "https://localhost:3000/api/test",
    "POST",
    { headers: { "Content-Type": "application/json", pancaces: z.string() } },
    async (request, { headers }) => {
        console.log("q");
        return {
            url: request.url,
            pancaces: headers.pancaces,
        };
    }
);
