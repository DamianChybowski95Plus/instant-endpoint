Instant endpoint is a factory function for nextjs for declaring routes.

-   It handles defining params required for transaction ( headers, params, body )
-   Parses unknowns
-   Returns an ednpoint function and calling function, with TypeGuard for using an endpoint in a way that will satisfy declared requirements.

```
const [PANCAKES_ROUTE, CALL_PANCAKES] = instantEndpoint(
    "https://localhost:3000/api/test",
    "GET",
    { headers: { "Content-Type": "application/json", pancakes: z.string() } },
    async (request, { headers }) => {
        return {
            url: request.url,
            pancakes: headers.pancaces,
        };
    }
);
```

Export from route.tsx at adres provided in argument to instantEndpoint

```
export { PANCAEES_ROUTE as GET };

```

Call endpoint in the client using returned call function

```
    export default async function PancakesComponent(){
        const res = await CALL_PANCACES({ headers : { "Content-Type": "application/json", pancakes: "with topping" }})

        return (
            { res && <p> res.pancakes </p>}
        )
    }

```
Donations link, for everyone that would like to support me : [https://dashboard.stripe.com/payment-links/plink_1PnecNIFjQBUgcVqrJFBCvSK](https://donate.stripe.com/eVag2tcb17o04483cc)
Subscription link, for those who would like to sign for recurent donation: 
