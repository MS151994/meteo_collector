import { Container } from "inversify";

const container = new Container({ skipBaseClassChecks: true });

require("./inversify.config").bind(container);

export { container };
