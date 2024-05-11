export default class Player {
  name: string;
  kills: number;

  constructor(name: string) {
    this.name = name;
    this.kills = 0;
  }
}
