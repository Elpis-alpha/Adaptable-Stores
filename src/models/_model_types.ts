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

export interface MyCart {

  _id: string

  items: {

    productID: string,

    name: string,

    quantity: number

  }[],

  toJSON: () => Object,

  save: () => Promise<void>,

}

export interface MyItem {

  _id: string

  title: string,

  section: string,

  description: string,

  price: number,

  pictures: { _id?: string, image: Buffer, order: number }[],

  toJSON: () => Object,

  save: () => Promise<void>,

}

