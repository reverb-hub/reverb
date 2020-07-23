import { HttpRequest } from './common/http-request.ts';
import { Controller } from './decorators/controller.ts';
import { Get, Mapping, Post } from './decorators/mapping.ts';
import { HttpMethod } from './common/http.ts';
import { ReverbApplication } from './core/app.ts';
import { Body, Param, RequestHeaders } from './decorators/parameter.ts';
import { Module } from './decorators/module.ts';
import './util/reflect.ts';


@Controller("/api")
class TestController {

    @Get("/test")
    get(@Body() body: string, @RequestHeaders() headers: string) {
        console.log("test was run")
    }

    @Post("/test")
    get2(@Body() body: string) {
        console.log(body)
    }

    @Mapping(HttpMethod.GET, "/users/{id}")
    users(@Body() body: string, @Param("id") id: string) {
        console.log(body)
    }

    @Mapping(HttpMethod.POST, "/users")
    createUsers(@Body() body: string) {
        console.log(body)
    }

    notMapping() {
        console.log("this is not a mapping")
    }
}

@Module({
    controllers: [TestController]
})
class AppModule { }

const app = new ReverbApplication(AppModule)

app.listen(8080)
