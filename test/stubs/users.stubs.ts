import { User } from "../../src/users/entities/user.entity";

export const usersStubs = (): User[] => {
  return [userStub1(), userStub2()];
};

export const userStub1 = (): User => {
  return {
    firstname: "John",
    lastname: "Doe",
    email: "johndoe1@email.com",
    password: "P@ssw0rdActiveFirst1234",
  };
};

export const userStub2 = (): User => {
  return {
    firstname: "John",
    lastname: "Doe",
    email: "johndoe2@email.com",
    password: "P@ssw0rdActiveSecond1234",
  };
};
