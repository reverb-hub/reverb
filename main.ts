import { HttpRequest } from './common/http-request.ts';
import { Controller } from './decorators/controller.ts';
import { Get, Mapping, Post } from './decorators/mapping.ts';
import { HttpMethod } from './common/http.ts';
import { ReverbApplication } from './core/app.ts';
import { Body, Param, RequestHeaders } from './decorators/parameter.ts';
import { Module } from './decorators/module.ts';
import './util/reflect.ts';
import { Injectable } from './decorators/injectable.ts';
import { Injector } from './core/injector.ts';

@Injectable()
class AppService {

    log() {
        console.log("log from app service")
    }

}

@Injectable()
class UserService {

    log() {
        console.log("log from user service")
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
    users(@Param("id") id: string) {
        console.log(id)
    }

    @Post("/{id}")
    createUsers(@Param("id") id: string, @Body() body: string) {
        console.log("ID:", id)
        console.log("BODY:", body)
    }
}

@Module({
    controllers: [TestController, UserController],
    providers: [AppService]
})
class AppModule { }

const app = new ReverbApplication(AppModule)

app.listen(8080)
