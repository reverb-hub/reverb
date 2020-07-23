import { readRequest, BufReader } from '../deps.ts';
import { Type } from '../decorators/module.ts';
import { RouteResolver } from './route-resolver.ts';
import { HttpMethod } from '../common/http.ts';

const decoder = new TextDecoder();

export class ReverbApplication {
    private routeResolver: RouteResolver;

    constructor(appModule: Type<any>) {
        this.routeResolver = new RouteResolver(appModule)

        this.routeResolver.printRoutes();

        console.log(this.routeResolver.resolveRoute("/api/test", HttpMethod.POST));
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
            let bodyText = "";
            const bodyReader = new BufReader(parsedRequest.body);
            let lineRes = await bodyReader.readLine();
            while (lineRes != null) {
                const lineText = decoder.decode(lineRes?.line);
                bodyText += lineText + "\n";
                lineRes = await bodyReader.readLine();
            }
            // @ts-ignore
            const mapping = this.mappings.get(parsedRequest.url)
            if (mapping) {
                // @ts-ignore
                mapping[0][mapping[1]](bodyText)
                await conn.write(this.response);
                console.log(`200`);
            } else {
                await conn.write(this.notFound);
                console.log(`404`, parsedRequest.url);
            }
        } finally {
            conn.close();
        }
    }
}