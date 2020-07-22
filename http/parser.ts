import { HttpRequest } from '../common/http-request.ts';
import { HttpMethodLine } from '../common/http-method-line.ts';

export class RequestParser {
    static parseRequest(buffer: Uint8Array): HttpRequest {
        const decoded = new TextDecoder("utf-8").decode(buffer);
        const metadataLines = decoded.split(/\r?\n/);
        const rawMethodLine = metadataLines.shift();
        if (rawMethodLine === undefined) {
            throw "No Method";
        }
        const methodLine = this.parseMethodLine(rawMethodLine);
        const [headers, rawBody] = this.parseHeaders(metadataLines);
        const body = this.parseBody(rawBody, headers);
        return {
            method: methodLine.method,
            uri: methodLine.uri,
            version: methodLine.version,
            headers: headers,
            body: body
        };
    }

    static parseBody(rawBody: string, headers: Map<string, string>): string {
        const contentLength = headers.get("Content-Length")
        // @ts-ignore
        let bodyType: HttpBodyType = null;
        if (contentLength) {
            bodyType = HttpBodyType.CONTENT_LENGTH
        }
        switch (bodyType) {
            case HttpBodyType.CONTENT_LENGTH:
                // @ts-ignore
                return rawBody.substring(0, contentLength);
            default:
                return rawBody;
        }
    }

    static parseMethodLine(rawMethodLine: string): HttpMethodLine {
        if (rawMethodLine.length !== 0) {
            const parts = rawMethodLine.split(/\s+/);
            if (parts.length == 2 || parts.length == 3) {
                return {
                    method: parts[0],
                    uri: parts[1],
                    version: parts[2]
                };
            } else {
                throw "Invalid Method Line";
            }
        } else {
            throw "Empty Method Line";
        }
    }

    static parseHeaders(metadataLines: Array<string>): [Map<string, string>, string] {
        const headers = new Map<string, string>();
        while (metadataLines.length > 1) {
            // @ts-ignore
            const metadataLine: string = metadataLines.shift();
            if (metadataLine.length === 0) {
                break;
            }
            const parts = metadataLine.match(/([^:]*):\s?(.*)/);
            if (parts) {
                headers.set(parts[1], parts[2]);
            } else {
                // Invalid Header
            }
        }
        return [headers, metadataLines[0]];
    }
}

export enum HttpBodyType {
    CONTENT_LENGTH,
    CHUNKED
}