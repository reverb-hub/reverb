import { BufReader, BufWriter, readRequest, writeResponse } from '../deps.ts';
import { Type } from '../decorators/module.ts';
import { RouteResolver } from './route-resolver.ts';
import { HttpMethod } from '../common/http.ts';
import { RouteExecutor } from './route-executor.ts';


export class ReverbApplication {
    private routeResolver: RouteResolver;

    constructor(appModule: Type<any>) {
        this.routeResolver = new RouteResolver(appModule)

        this.routeResolver.printRoutes();
    }

    response = new TextEncoder().encode(
        "HTTP/1.1 200 OK\r\nContent-Length: 12\r\n\r\nHello World\n",
    );
    notFound = new TextEncoder().encode(
        "HTTP/1.1 404 OK\r\n\r\n",
    );

    async listen(port: number, host: string = "127.0.0.1") {
        const listener = Deno.listen({ hostname: host, port: port });
        console.log(`Listening on ${host}:${port}`);
        for await (const conn of listener) {
            this.handle(conn);
        }
    }

    async handle(conn: Deno.Conn): Promise<void> {
        try {
            const reader = new BufReader(conn);
            const parsedRequest = await readRequest(conn, reader);
            if (parsedRequest == null) {
                throw "request is null?";
            }
            // @ts-ignore
            const mapping = this.routeResolver.resolveRoute(parsedRequest.url, HttpMethod[parsedRequest.method])
            const writer = new BufWriter(conn);
            try {
                const response = await RouteExecutor(mapping, parsedRequest)
                await writeResponse(writer, response)
            } catch (e) {
                await writeResponse(writer, {status:500})
            }
        } finally {
            conn.close();
        }
    }
}