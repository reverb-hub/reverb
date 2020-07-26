import { Injectable, Controller, Module, ReverbApplication, Get, Param } from "../mod.ts";
import { assertThrows, assertEquals } from "../deps.ts";

Deno.test("errorMissingProvider", function (): void {
  @Injectable()
  class UserService {
  }

  @Controller("/api/test")
  class TestController {
    constructor(private userService: UserService) {
    }
  }

  @Module({
    controllers: [TestController],
    // Missing UserService provider
  })
  class AppModule {}
  assertThrows(
    () => {
      const app = new ReverbApplication(AppModule);
    },
    Error,
    "",
    "Provider not included in module: UserService",
  );
});

Deno.test("providesService", function (): void {
  @Injectable()
  class UserService {
    private users: any[] = [];
    add() {
      this.users.push("test123");
    }
  }

  @Controller("/api/test")
  class TestController {
    constructor(private userService: UserService) {
      this.userService.add();
    }
  }

  @Module({
    controllers: [TestController],
    providers: [UserService],
  })
  class AppModule {}

  const app = new ReverbApplication(AppModule);
});

Deno.test("serviceIsSingleton", async function (): Promise<void> {
  let userServiceCount: number = 0;
  @Injectable()
  class UserService {
    constructor() {
      userServiceCount += 1;
    }
  }

  let testControllerCount: number = 0;
  @Controller("/api/test")
  class TestController {
    constructor(private userService: UserService) {
      testControllerCount += 1;
    }
  }

  let userControllerCount: number = 0;
  @Controller("/api/users")
  class UsersController {
    constructor(private userService: UserService) {
      let userControllerCount: number = 0;
    }
  }

  @Module({
    controllers: [UsersController, TestController],
    providers: [UserService],
  })
  class AppModule {}

  const app = new ReverbApplication(AppModule);

  app.listen(8124);

  app.close();

  assertEquals(userServiceCount, 1, "UsersService has multiple instances");
  assertEquals(testControllerCount, 1, "TestController has multiple instances");
  assertEquals(userServiceCount, 1, "UsersController has multiple instances");
});
