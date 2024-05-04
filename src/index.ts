import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { PickByValue } from "utility-types";

/**
 * Params used internaly by factory function, that are meant to be expanded
 */
declare namespace TypeParams {
    /**
     * Type guards for header options.
     */
    type SupportedHeaderOptions = {
        /**
         * Type of content allowed to be sent
         */
        "Content-Type"?: "application/json";
        Accept?: "application/json";
    };

    /**
     *  Supported arguments types.
     */
    type SupportedEndpointArguments = {
        headers?: never;
        body?: never;
        searchParams?: never;
    };
    /**
     *  Supported Http endpoint types
     */
    type EndpointTypes = {
        GET?: never;
        POST?: never;
        GETREDIRECT?: never;
    };
}

/**
 * Arguments to function
 */
declare namespace Arguments {
    type ApiUrl = string;
}

/**
 *  Namespace for each argument's type logic
 */
declare namespace Argument {
    namespace ApiUrl {}

    namespace EndpointType {}

    namespace SupportedOptions {}
}

declare namespace Object {
    /**
     *  Schemas are meant to be provided as values of object
     */
    type SupportedOptionsSchema = { [key: string]: z.Schema };
    /**
     * All supported options that are accepted by options
     */
    type SupportedOptions = TypeParams.SupportedHeaderOptions | Object.SupportedOptionsSchema;
    /**
     *
     */
    type SupportedHeaderOptions = TypeParams.SupportedHeaderOptions | Object.SupportedOptionsSchema;
    /**
     *
     */
    type GetSchemas<T extends object> = PickByValue<T, z.Schema> & { [key: string]: any };
    /**
     *
     */
    type ZodInferSchemaValues<TSchemaObject extends SupportedOptions> = {
        [K in keyof Object.GetSchemas<TSchemaObject>]: z.infer<Object.GetSchemas<TSchemaObject>[K]>;
    };
    /**
     *
     */
    type ZodInferSchemaValuesWithOptions<TSchemaObject extends SupportedOptions> = {
        [K in keyof Object.GetSchemas<TSchemaObject>]: z.infer<Object.GetSchemas<TSchemaObject>[K]>;
    } & { [K in keyof PickByValue<TSchemaObject, string>]: PickByValue<TSchemaObject, string>[K] };
}

declare namespace Objects {
    /**
     *
     */
    type SchemasObjects = ({
        [K in keyof Pick<TypeParams.SupportedEndpointArguments, "body" | "searchParams">]: Object.SupportedOptionsSchema;
    } & { [key: string]: any }) &
        ({ [K in keyof Pick<TypeParams.SupportedEndpointArguments, "headers">]: TypeParams.SupportedHeaderOptions } & {
            [key: string]: any;
        });
    /**
     *
     */
    type OptionsSupportedByEndpointType<TEdgeType extends keyof TypeParams.EndpointTypes> = TEdgeType extends keyof Pick<
        TypeParams.EndpointTypes,
        "GET"
    >
        ? Partial<
              | Record<keyof Pick<TypeParams.SupportedEndpointArguments, "searchParams">, Object.SupportedOptionsSchema>
              | Record<keyof Pick<TypeParams.SupportedEndpointArguments, "headers">, Object.SupportedHeaderOptions>
          >
        : TEdgeType extends keyof Pick<TypeParams.EndpointTypes, "POST">
        ? Partial<
              Record<keyof Pick<TypeParams.SupportedEndpointArguments, "searchParams">, Object.SupportedOptionsSchema> &
                  Record<keyof Pick<TypeParams.SupportedEndpointArguments, "headers">, Object.SupportedHeaderOptions> &
                  Record<keyof Pick<TypeParams.SupportedEndpointArguments, "body">, Object.SupportedOptionsSchema>
          >
        : TEdgeType extends keyof Pick<TypeParams.EndpointTypes, "GETREDIRECT">
        ? Partial<Record<keyof Pick<TypeParams.SupportedEndpointArguments, "searchParams">, Object.SupportedOptionsSchema>>
        : never;
    /**
     * Get schema objects from object
     */
    type GetSchemas<T extends Objects.SchemasObjects> = { [K in keyof T]: Object.GetSchemas<T[K]> };
    /**
     *
     */
    type ZodInferSchemaValues<T extends Objects.SchemasObjects> = { [K in keyof T]: Object.ZodInferSchemaValues<T[K]> };
    /**
     *
     */
    type ZodInferSchemaValuesWithOptions<T extends Objects.SchemasObjects> = {
        [K in keyof T]: Object.ZodInferSchemaValuesWithOptions<T[K]>;
    };
}

declare namespace Function {
    /**
     *
     */
    type Callback<TRequired extends Objects.OptionsSupportedByEndpointType<any>> = (
        request: NextRequest,
        required: Objects.ZodInferSchemaValuesWithOptions<TRequired>
    ) => Promise<{ [key: string]: any } | NextResponse<unknown>>;
    /**
     *
     */
    type CallingFunction<TRequired extends Objects.OptionsSupportedByEndpointType<any>, TCallback extends (...args: any[]) => any> = (
        required: Objects.ZodInferSchemaValuesWithOptions<TRequired>
    ) => Promise<void | Awaited<ReturnType<TCallback>>>;
    /**
     *
     */
    type CallingFunctionForGetredirect<
        TRequired extends Objects.OptionsSupportedByEndpointType<any>,
        TCallback extends (...args: any[]) => any
    > = (
        required: Objects.ZodInferSchemaValuesWithOptions<TRequired>,
        routerPushFunction: (url: string) => void
    ) => Promise<void | Awaited<ReturnType<TCallback>>>;
    /**
     *
     */
    type EndpointFunction = (
        request: NextRequest
    ) => Promise<
        | NextResponse<{ status: false; message: "Transaction requirements weren't met" }>
        | NextResponse<{ [key: string]: string }>
        | NextResponse<unknown>
    >;
}

/**
 * Factory function returning endpoint and calling function
 * @param apiUrl
 * @param edgeType
 * @param requiredForTransaction
 * @param callback
 * @returns
 */
export function instantEndpoint<
    T_ApiUrl extends Arguments.ApiUrl,
    TEndpointType extends keyof TypeParams.EndpointTypes,
    TRequired extends Objects.OptionsSupportedByEndpointType<TEndpointType>,
    TCallback extends Function.Callback<TRequired>
>(
    apiUrl: T_ApiUrl,
    edgeType: TEndpointType,
    requiredForTransaction: TRequired,
    callback: TCallback
): [
    Function.EndpointFunction,
    TEndpointType extends keyof Pick<TypeParams.EndpointTypes, "GETREDIRECT">
        ? Function.CallingFunctionForGetredirect<TRequired, TCallback>
        : Function.CallingFunction<TRequired, TCallback>
] {
    function safeParseJson(str: any) {
        let parsed: any = null;
        try {
            parsed = JSON.parse(str);
        } catch (e) {}
        return parsed;
    }

    function extractSchemaObject(obj: object): Object.SupportedOptionsSchema {
        let newObj: Object.SupportedOptionsSchema = {};
        Object.entries(obj).forEach((entry) => {
            if (entry[1] instanceof z.Schema) newObj[entry[0]] = entry[1];
        });
        return newObj;
    }

    const optionsToSearchParams = (obj: { [key: string]: string }) => {
        return (
            "?" +
            Object.entries(obj)
                .map((entry) => {
                    return `${entry[0]}=${entry[1]}`;
                })
                .join("&")
        );
    };

    const strinfigyValues = (obj: { [key: string]: any }) => {
        let newObj: { [key: string]: string } = {};
        Object.entries(obj).map((entry) => {
            newObj[entry[0]] = JSON.stringify(entry[1]);
        });
        return newObj;
    };

    function getRequiredHeaders<THeaders extends Object.SupportedOptionsSchema>(
        request: NextRequest,
        requiredHeadersSchema: THeaders
    ): Object.ZodInferSchemaValues<Object.SupportedOptionsSchema> | null {
        let transactionBroken = false;
        const requiredSearchParamsSchemaEntries: [keyof THeaders, z.Schema][] = Object.entries(requiredHeadersSchema);

        const requiredHeaders = Object.fromEntries(
            requiredSearchParamsSchemaEntries.map((entry) => {
                const requiredHeaderUnknown = request.headers.get(entry[0] as string);
                const requiredHeaderAny = requiredHeaderUnknown ? safeParseJson(requiredHeaderUnknown) : undefined;

                const requiredHeader =
                    requiredHeaderAny && entry[1].safeParse(requiredHeaderAny).success
                        ? (requiredHeaderAny as z.infer<THeaders[keyof THeaders]>)
                        : undefined;
                if (requiredHeader) return [entry[0], requiredHeader];
                else {
                    transactionBroken = true;
                    return ["error", undefined];
                }
            })
        );

        if (transactionBroken) return null;
        else return requiredHeaders;
    }

    function getRequiredUrlParams<TParams extends Object.SupportedOptionsSchema>(
        request: NextRequest,
        urlParamsSchema: TParams
    ): Object.ZodInferSchemaValues<Object.SupportedOptionsSchema> | null {
        const requiredSearchParamsSchemaEntries: [keyof TParams, z.Schema][] = Object.entries(urlParamsSchema);
        const requestSearchParam = new URL(request.url).searchParams;
        let transactionBroken = false;

        const requestUrlSearchParams = Object.fromEntries(
            requiredSearchParamsSchemaEntries.map((entry) => {
                const paramUnknown = requestSearchParam.get(entry[0] as string);
                const paramString = paramUnknown ? safeParseJson(paramUnknown) : undefined;
                const requiredParam =
                    paramUnknown && entry[1].safeParse(paramUnknown).success
                        ? (paramUnknown as z.infer<TParams[keyof TParams]>)
                        : undefined;
                if (requiredParam) return [entry[0], requiredParam];
                else {
                    transactionBroken = true;
                    return ["error", undefined];
                }
            })
        );

        if (transactionBroken) return null;
        else return requestUrlSearchParams;
    }

    function getRequiredBody<TBody extends Object.SupportedOptionsSchema>(
        requestsBody: any,
        requiredBodySchema: TBody
    ): Object.ZodInferSchemaValues<Object.SupportedOptionsSchema> | null {
        const requiredBodySchemaEntries: [keyof TBody, z.Schema][] = Object.entries(requiredBodySchema);
        const requestsBodyKeys = Object.keys(requestsBody);
        let transactionBroken = false;

        const requiredBody = Object.fromEntries(
            requiredBodySchemaEntries.map((entry) => {
                if (requestsBodyKeys.includes(entry[0] as string) && entry[1].safeParse(requestsBody[entry[0]]).success) {
                    return [entry[0], requestsBody[entry[0]]];
                } else {
                    transactionBroken = true;
                    return ["error", undefined];
                }
            })
        );

        if (transactionBroken) return null;
        else return requiredBody;
    }

    return [
        /**
         * Function representing http endpoint, meant to be put at route adress defined earlier in factory function.
         * @param request - Requires http request in format supported by Next.js
         * @returns Returns callback to factory function, that extends NextResponse
         */
        async (request: NextRequest) => {
            // Validate required data, if it was provided
            const requiredAfterValidation = {
                ...("body" in requiredForTransaction && requiredForTransaction.body
                    ? { body: getRequiredBody(await request.json(), requiredForTransaction.body) }
                    : undefined),
                ...("headers" in requiredForTransaction && requiredForTransaction.headers
                    ? { headers: getRequiredHeaders(request, extractSchemaObject(requiredForTransaction.headers)) }
                    : undefined),
                ...("searchParams" in requiredForTransaction && requiredForTransaction.searchParams
                    ? { searchParams: getRequiredUrlParams(request, requiredForTransaction.searchParams) }
                    : undefined),
            };

            console.log(requiredAfterValidation);

            // If any required options after validation are null, return status false
            if (Object.values(requiredAfterValidation).includes(null)) {
                console.log("InstantEndpoint - transaction requirements weren't met", requiredAfterValidation);
                return NextResponse.json({
                    status: false,
                    message: "Transaction requirements weren't met",
                });
            }

            // // @ts-ignore
            const callbackReturn = await callback(request, requiredAfterValidation as Objects.ZodInferSchemaValuesWithOptions<TRequired>);
            return callbackReturn instanceof NextResponse ? callbackReturn : NextResponse.json(callbackReturn);
        },

        /**
         * Function meant for calling created enpoint
         * @param requiredToCall - Takes in all params requireded when declaring endpoint.
         * @param pushRouterFunction - Optional, function pushing client website, for GETREDIRECT method
         * @returns
         */
        //@ts-expect-error - // function argument based on generic; don't know how to write it sounldy in an elegant way
        async (requiredToCall, pushRouterFunction) => {
            "use client";

            // Data required for calling endppoint; is required to be in valid format by typescript
            const transactionParams = {
                ...("body" in requiredToCall && requiredToCall.body ? { body: JSON.stringify(requiredToCall.body) } : null),
                ...("headers" in requiredToCall && requiredToCall.headers ? { headers: strinfigyValues(requiredToCall.headers) } : null),
                ...("searchParams" in requiredToCall && requiredToCall.searchParams
                    ? { searchParams: optionsToSearchParams(requiredToCall.searchParams as { [key: string]: string }) }
                    : null),
            };

            if (edgeType === "GETREDIRECT" && pushRouterFunction) {
                return pushRouterFunction(apiUrl + transactionParams.searchParams);
            } else if (edgeType === "GET") {
                const searchParamsString = transactionParams.searchParams ? transactionParams.searchParams : "";
                const res = await fetch(apiUrl + searchParamsString, {
                    method: "GET",
                    ...(transactionParams.headers ? { headers: transactionParams.headers } : {}),
                });
                return (await res.json()) as unknown as Awaited<ReturnType<TCallback>> & { [key: string]: any };
            } else if (edgeType == "POST") {
                const searchParamsString = transactionParams.searchParams ? transactionParams.searchParams : "";
                const res = await fetch(apiUrl + searchParamsString, {
                    method: "POST",
                    ...(transactionParams.body ? { body: transactionParams.body } : {}),
                    ...(transactionParams.headers ? { headers: transactionParams.headers } : {}),
                });
                return res.json() as unknown as Awaited<ReturnType<TCallback>> & { [key: string]: any };
            }
        },
    ];
}
