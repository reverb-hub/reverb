import { readRequest, BufReader } from '../deps.ts';
import { Type } from '../decorators/module.ts';
import { MODULE_METADATA, PATH_METADATA } from '../common/constants.ts';

const decoder = new TextDecoder();

export class ReverbApplication {
    constructor(appModule: Type<any>) {
        const controllers = Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, appModule)
        console.log(Reflect.getMetadataKeys(new controllers[0]()))
        console.log(Object.getOwnPropertyNames(controllers[0].prototype))
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
            console.log({
                body: bodyText
            });
            await conn.write(this.response);
        } finally {
            conn.close();
        }
    }
}