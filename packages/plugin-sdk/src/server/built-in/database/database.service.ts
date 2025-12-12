import {
  Inject,
  Injectable,
  Logger,
  type OnModuleDestroy,
} from "@nestjs/common";
import { Kysely, type KyselyConfig } from "kysely";
import { KYSELY_OPTIONS } from "./database.module-definition";
import type { Database } from "./database.types";

@Injectable()
export class DatabaseService
  extends Kysely<Database>
  implements OnModuleDestroy
{
  private readonly logger = new Logger(DatabaseService.name);

  constructor(@Inject(KYSELY_OPTIONS) options: KyselyConfig) {
    super(options);
    this.logger.log(
      `Initializing DatabaseService with dialect ${Object.getPrototypeOf(options.dialect).constructor.name}`,
    );
  }
  async onModuleDestroy() {
    await this.destroy();
    this.logger.log(`DatabaseService has been destroyed`);
  }
}
