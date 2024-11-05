import { ComponentValue } from "@dojoengine/recs";

export class Admin {
  public id: bigint;
  public address: string;

  constructor(admin: ComponentValue) {
    this.id = admin.id;
    this.address = "0x" + admin.id.toString(16);
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
