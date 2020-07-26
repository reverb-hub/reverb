import { Controller } from './decorators/controller.ts';
import { Get, Post } from './decorators/mapping.ts';
import { ReverbApplication } from './core/app.ts';
import { Body, Param, RequestHeader } from './decorators/parameter.ts';
import { Module } from './decorators/module.ts';
import { Injectable } from './decorators/injectable.ts';

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

    @Get("/headers")
    getHeaders(@RequestHeader("host") host: string) {
        console.log(host)
    }

    @Post()
    get2(@Body() body: string) {
        console.log(body)
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
    createUsers(@Param("id") id: string, @Body() body: string) {
        console.log("ID:", id)
        console.log("BODY:", body)
    }
}

@Module({
    controllers: [TestController, UserController],
    providers: [AppService, UserService]
})
class AppModule { }

const app = new ReverbApplication(AppModule)

app.listen(8080)
