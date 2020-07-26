import { BufReader, ServerRequest } from "../deps.ts";

const decoder = new TextDecoder();

export async function BodyReader(
  parsedRequest: ServerRequest,
): Promise<string> {
  let bodyText = "";
  const bodyReader = new BufReader(parsedRequest.body);
  let lineRes = await bodyReader.readLine();
  while (lineRes != null) {
    const lineText = decoder.decode(lineRes?.line);
    bodyText += lineText;
    lineRes = await bodyReader.readLine();
    if (lineRes != null) {
      bodyText += "\n";
    }
  }
  return bodyText;
}
