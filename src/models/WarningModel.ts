import {IsArray, IsNumber, IsString} from "class-validator";

export class IMGWWarningModel {
  @IsString()
  public id: string;

  @IsString()
  public eventName: string;

  @IsNumber()
  public level: number;

  @IsNumber()
  public probability: number;

  @IsString()
  public validTo: string;

  @IsString()
  public validFrom: string;

  @IsString()
  public published: string;

  @IsString()
  public content: string;

  @IsString()
  public comment: string;

  @IsArray()
  public territory: number[] = [];

  public constructor(data?: any) {
    if (data.id) {
      this.id = data.id;
    }
    if (data.nazwa_zdarzenia) {
      this.eventName = data.nazwa_zdarzenia;
    }
    if (data.stopien) {
      this.level = Number(data.stopien);
    }
    if (data.prawdopodobienstwo) {
      this.probability = Number(data.prawdopodobienstwo);
    }
    if (data.obowiazuje_do) {
      this.validTo = data.obowiazuje_do;
    }
    if (data.obowiazuje_od) {
      this.validFrom = data.obowiazuje_od;
    }
    if (data.opublikowano) {
      this.published = data.opublikowano;
    }
    if (data.tresc) {
      this.content = data.tresc;
    }
    if (data.komentarz) {
      this.comment = data.komentarz;
    }
    if (data.teryt) {
      this.territory = data.teryt.map(Number);
    }
  }

  public getTerritory(): number[] {
    return this.territory;
  }
}
