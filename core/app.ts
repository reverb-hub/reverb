import { RequestParser } from '../http/parser.ts';
import { Type } from '../decorators/module.ts';
import { RouteResolver } from './route-resolver.ts';

export class ReverbApplication {
    private routeResolver: RouteResolver;

    constructor(appModule: Type<any>) {
        this.routeResolver = new RouteResolver(appModule)

        this.routeResolver.resolveRoutes()
    }

    response = new TextEncoder().encode(
        "HTTP/1.1 200 OK\r\nContent-Length: 12\r\n\r\nHello World\n",
    );

    async listen(port: number, host: string = "127.0.0.1") {
        const listener = Deno.listen({ hostname: host, port: port });
        console.log(`Listening on ${host}:${port}`);
        for await (const conn of listener) {
            this.handle(conn);
        }
    }

    async handle(conn: Deno.Conn): Promise<void> {
        const buffer = new Uint8Array(1024);
        try {
            while (true) {
                const r = await conn.read(buffer);
                if (r === null) {
                    break;
                }
                const parsedRequest = RequestParser.parseRequest(buffer);
                await conn.write(this.response);
            }
        } finally {
            conn.close();
        }
    }
}