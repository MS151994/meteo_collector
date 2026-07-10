import {Get, JsonController} from 'routing-controllers';
import {inject, injectable} from 'inversify';
import {TYPES} from '../infrastructure/ioc/Types';
import {WarningsHistoryService, WarningHistoryEntry} from '../services/WarningsHistoryService';

@injectable()
@JsonController('/history')
export class HistoryController {
  @inject(TYPES.WarningsHistoryService)
  private readonly history: WarningsHistoryService;

  @Get('/')
  public async getHistory(): Promise<WarningHistoryEntry[]> {
    return this.history.getHistory();
  }
}
