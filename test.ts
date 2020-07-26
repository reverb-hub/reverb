import {
  assert,
  assertEquals,
  assertThrows,
  assertThrowsAsync,
} from "./deps.ts";
import {
  Controller,
  Injectable,
  Module,
  ReverbApplication,
  HttpStatusCode,
  Get,
  RequestHeader,
  Post,
  Body,
  Param,
} from "./mod.ts";

Deno.test("startBasicApp", function (): void {
  @Injectable()
  class AppService {
    log() {
      console.log("log from app service");
    }
  }

  enum UserRole {
    ADMIN = "ADMIN",
    USER = "USER",
    GUEST = "GUEST",
  }

  interface User {
    name: string;
    id: number;
    role: UserRole;
  }

  @Injectable()
  class UserService {
    log() {
      console.log("log from user service");
    }

    getUser(): User {
      return {
        name: "username",
        id: 1,
        role: UserRole.ADMIN,
      };
    }
  }

  @Controller("/api/test")
  class TestController {
    constructor(
      private appService: AppService,
      private userService: UserService,
    ) {
    }

    @Get()
    get() {
      this.appService.log();
      this.userService.log();
    }

    @Get("/host")
    getHeaders(@RequestHeader("host") host: string) {
      return host;
    }

    @Get("/error")
    throwError() {
      throw {
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        message: "Error test",
      };
    }

    @Post()
    get2(@Body() body: string) {
      return body;
    }
  }

  @Controller("/api/users")
  class UserController {
    constructor(
      private appService: AppService,
      private userService: UserService,
    ) {
    }

    @Get("/{id}")
    users(@Param("id") id: string): User {
      return this.userService.getUser();
    }

    @Post("/{id}")
    createUsers(
      @Param("id") id: string,
      @Body() body: string,
    ): object {
      return {
        id,
        body,
      };
    }
  }

  @Module({
    controllers: [TestController, UserController],
    providers: [AppService, UserService],
  })
  class AppModule {}

  const app = new ReverbApplication(AppModule);

  app.listen(8081);

  app.close();
});
