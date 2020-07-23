import { readRequest, BufReader } from '../deps.ts';
import { Type } from '../decorators/module.ts';
import { RouteResolver } from './route-resolver.ts';

const decoder = new TextDecoder();

export class ReverbApplication {
    private routeResolver: RouteResolver;
    private mappings: Map<string, [Type<any>, string]>;

    constructor(appModule: Type<any>) {
        this.routeResolver = new RouteResolver(appModule)

        this.mappings = this.routeResolver.resolveRoutes()

        console.log(this.mappings)
    }

    response = new TextEncoder().encode(
        "HTTP/1.1 200 OK\r\nContent-Length: 12\r\n\r\nHello World\n",
    );

    async listen(port: number, host: string = "127.0.0.1") {
        const listener = Deno.listen({ hostname: host, port: port });
        console.log(`Listening on ${host}:${port}`);
        for await (const conn of listener) {
            console.log(`Listening on ${host}:${port}`);
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
            let bodyText = "";
            const bodyReader = new BufReader(parsedRequest.body);
            let lineRes = await bodyReader.readLine();
            while (lineRes != null) {
                const lineText = decoder.decode(lineRes?.line);
                bodyText += lineText + "\n";
                lineRes = await bodyReader.readLine();
            }
            console.log(parsedRequest)
            // @ts-ignore
            const mapping = this.mappings[parsedRequest]
            await conn.write(this.response);
        } finally {
            conn.close();
        }
    }
}