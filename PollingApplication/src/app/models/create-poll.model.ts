export class CreatePollDto {
  constructor(
    public question: string = "",
    public options: string[] = [],
    public startTime?: string,
    public endTime?: string
  ) {}

  static fromForm(data: any): CreatePollDto {
    return new CreatePollDto(
      data.question,
      data.options,
      data.startTime ? new Date(data.startTime).toISOString() : undefined,
      data.endTime ? new Date(data.endTime).toISOString() : undefined
    );
  }
}
