// src/openapi/registerRoute.ts
import { registry } from "./registry";
import { ZodType } from "zod";
import { RouteConfig } from "@asteasolutions/zod-to-openapi";



interface RegisterConfig extends Omit<RouteConfig, 'responses' | 'request'> {
    request?: Omit<NonNullable<RouteConfig['request']>, 'body'> & {
        body?: ZodType;
    };

    responses: {
        [statusCode: string]: {
            description: string;
            schema?: ZodType;
        };
    };
}


const registeredSchemas = new WeakMap<ZodType, string>();

export function registerIfNeeded(schema: ZodType): { $ref: string } {
    const name = (schema as any)?._def?.openapi?._internal?.refId;
    if (!name) {
        throw new Error(
            `Schema ${schema.constructor.name} does not have an OpenAPI name defined. Use .openapi('Name') to set it.`,
        );
    }
    if (!registeredSchemas.has(schema)) {
        registry.register(name, schema);
        registeredSchemas.set(schema, name);
    }
    return { $ref: `#/components/schemas/${name}` };
}

export function registerRoute(config: RegisterConfig) {

    const request: RouteConfig['request'] = {
        ...config.request,
        body: config.request?.body ? {
            content: {
                'application/json': {
                    schema: registerIfNeeded(config.request.body),
                },
            }
        } : undefined,
    }

    const responses: RouteConfig['responses'] = Object.fromEntries(
        Object.entries(config.responses).map(([status, r]) => [
            +status,
            !r.schema
                ? { description: r.description }
                : {
                    description: r.description,
                    content: {
                        'application/json': { schema: registerIfNeeded(r.schema) },
                    },
                },
        ]),
    );

    registry.registerPath({
        ...config,
        request,
        responses
    });

}

