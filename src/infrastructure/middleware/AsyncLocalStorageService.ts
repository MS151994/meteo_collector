import {ExpressMiddlewareInterface, Middleware} from 'routing-controllers';
import {AsyncLocalStorage} from 'node:async_hooks';
import {NextFunction, Request, RequestHandler, Response} from 'express';
import {nanoid} from 'nanoid';
import {injectable} from 'inversify';

@Middleware({type: 'before'})
@injectable()
export class AsyncLocalStorageService implements ExpressMiddlewareInterface {
  protected readonly requestIdLocalStorage = new AsyncLocalStorage<Map<string, string>>();

  public use(request: Request, response: Response, next: NextFunction): void {
    this.createRequestId()(request, response, next);
  }

  private createRequestId(): RequestHandler {
    return (_request: Request, _response: Response, next: NextFunction) => {
      const requestId = nanoid(10);

      this.requestIdLocalStorage.run(new Map(), () => {
        this.requestIdLocalStorage.getStore()?.set('requestId', requestId);
        next();
      });
    };
  }

  public getRequestId(): string {
    return this.requestIdLocalStorage.getStore()?.get('requestId') as string;
  }
}
