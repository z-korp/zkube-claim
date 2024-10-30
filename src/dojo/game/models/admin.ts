import { ComponentValue } from "@dojoengine/recs";

export class Admin {
  public id: string;
  public name: string;

  constructor(admin: ComponentValue) {
    this.id = admin.id;
    this.name = admin.name;
  }

  public assert_not_exists(): void {
    if (this.id) {
      throw new Error("The administrator already exists.");
    }
  }

  public assert_exists(): void {
    if (!this.id) {
      throw new Error("The administrator does not exist.");
    }
  }
}
