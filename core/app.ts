import { BufReader, BufWriter, readRequest, writeResponse } from "../deps.ts";
import { Type } from "../decorators/module.ts";
import { RouteResolver, RouteResolution } from "./route-resolver.ts";
import { HttpMethod } from "../common/http.ts";
import { RouteExecutor } from "./route-executor.ts";
import { ModuleBuilder } from "./module-builder.ts";

export class ReverbApplication {
  private routeResolver: RouteResolver;
  private rootModuleBuilder: ModuleBuilder;
  private listeners: Deno.Listener[] = [];

  constructor(appModule: Type<any>) {
    this.rootModuleBuilder = new ModuleBuilder(appModule);
    this.routeResolver = new RouteResolver(
      this.rootModuleBuilder.controllers(),
    );
  }

  printRoutes() {
    this.routeResolver.printRoutes();
  }

  close(): void {
    console.log("App closing");
    for (const listener of this.listeners) {
      listener.close();
    }
    console.log("App closed");
  }

  async listen(port: number, host: string = "127.0.0.1") {
    const listener = Deno.listen({ hostname: host, port: port });
    this.listeners.push(listener);
    console.log(`Listening on ${host}:${port}`);
    for await (const conn of listener) {
      this.handle(conn);
    }
  }

  async handle(conn: Deno.Conn): Promise<void> {
    try {
      const reader = new BufReader(conn);
      const parsedRequest = await readRequest(conn, reader);
      if (parsedRequest != null) {
        // @ts-ignore
        const mapping = this.routeResolver.resolveRoute(
          parsedRequest.url,
          HttpMethod[parsedRequest.method],
        );
        const writer = new BufWriter(conn);
        try {
          const response = await RouteExecutor(mapping, parsedRequest);
          await writeResponse(writer, response);
        } catch (e) {
          await writeResponse(writer, { status: 500 });
        }
      } else {
        // ignore
      }
    } finally {
      conn.close();
    }
  }
}
