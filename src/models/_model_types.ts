export interface MyUser {

  _id: string

  name: string,

  email: string,

  password: string,

  verify: string,

  tokens: { token: string; }[],

  avatar: Buffer | undefined,

  avatarSmall: Buffer | undefined,

  toJSON: () => Object,

  toPublicJSON: () => Object,

  generateAuthToken: () => Promise<string>,

  sendVerificationEmail: () => Promise<Object>,

  sendExitEmail: () => Promise<Object>,

  populate: (obj: Object) => Promise<void>,

  save: () => Promise<void>,

}

export interface MyTask {

  _id: string

  title: string,

  description: string,

  completed: boolean,

  endDate: Date | undefined,

  toJSON: () => Object,

  save: () => Promise<void>,

}

