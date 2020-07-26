import { Controller } from './decorators/controller.ts';
import { Get, Post } from './decorators/mapping.ts';
import { ReverbApplication } from './core/app.ts';
import { Body, Param, QueryParam, RequestHeader } from './decorators/parameter.ts';
import { Module } from './decorators/module.ts';
import { Injectable } from './decorators/injectable.ts';
import { HttpStatusCode } from './common/http-status-code.ts';

@Injectable()
class AppService {

    log() {
        console.log("log from app service")
    }

}

enum UserRole {
    ADMIN = 'ADMIN',
    USER = 'USER',
    GUEST = 'GUEST'
}

interface User {
    name: string,
    id: number,
    role: UserRole
}

@Injectable()
class UserService {

    log() {
        console.log("log from user service")
    }

    getUser(): User {
        return {
            name: "username",
            id: 1,
            role: UserRole.ADMIN
        }
    }

}

@Controller("/api/test")
class TestController {

    constructor(private appService: AppService, private userService: UserService) {
    }

    @Get()
    get() {
        this.appService.log()
        this.userService.log()
    }

    @Get("/host")
    getHeaders(@RequestHeader("host") host: string) {
        return host
    }

    @Get("/query")
    getQueryParams(@QueryParam("args") args: string | Array<string>): string | Array<string> {
        return args
    }

    @Get("/error")
    throwError() {
        throw {
            status: HttpStatusCode.INTERNAL_SERVER_ERROR,
            message: "Error test"
        }
    }

    @Post()
    get2(@Body() body: string) {
        return body
    }
}

@Controller("/api/users")
class UserController {

    constructor(private appService: AppService, private userService: UserService) {
    }

    @Get("/{id}")
    users(@Param("id") id: string): User {
        return this.userService.getUser()
    }

    @Post("/{id}")
    createUsers(
        @Param("id") id: string,
        @Body() body: string
    ): object {
        return {
            id,
            body
        }
    }
}

@Module({
    controllers: [TestController, UserController],
    providers: [AppService, UserService]
})
class AppModule { }

const app = new ReverbApplication(AppModule)

app.listen(8080)
