import { z } from "zod";
import { instantEndpoint } from "..";

const [PANCACES_ROUTE, CALL_PANCACES] = instantEndpoint(
    "https://localhost:3000/api/test",
    "GET",
    { headers: { "Content-Type": "application/json", pancaces: z.string() } },
    async (request, { headers }) => {
        return {
            url: request.url,
            pancaces: headers.pancaces,
        };
    }
);
