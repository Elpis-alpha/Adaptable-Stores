export const welcomeMail = (siteName: string, url: string) => {

  return `

    <div style="font-family: Arial, Helvetica, sans-serif; line-height: 2pc; position: relative;">

    <div>

      <h1
        style="margin: 0; padding: .5pc 1pc; padding-bottom: .5pc; font-family: inherit; color: #727272; font-size: 2pc; line-height: 3pc;">

        Welcome to ${siteName}

      </h1>

    </div>

    <p style="margin: 0; padding: 0 1pc; font-family: inherit; color: #727272;">

      &nbsp; &nbsp; &nbsp; Thanks for sigining up with us at ${siteName}, we hope you enjoy

      your stay with us as you casually browse through the store products.

      We are an e-commerce store that offers a lot of services and features as stated below:

    </p>

    <ul style="margin: 0; padding: 1pc 1pc 1pc 3pc; font-family: inherit; color: #727272;">
      <li>Creation of Accounts</li>
      <li>Cart System</li>
      <li>Paypal Checkout</li>
      <li>Stripe Checkout</li>
      <li>Amazing Products</li>
      <li>And lots more</li>
    </ul>

    <p style="margin: 0; padding: 0 1pc; font-family: inherit; color: #727272;">
      Kindly verify your email by clicking the button
      below. Also, if you didn't create this account kindly click the button all the same as you'll be provided with the
      option to
      delete the account and possibly create another if desired.
    </p>

    <a href="${url}" target="_blank" rel="noopener noreferrer" style="background: #3c73e9; display: inline-block; padding: 10px 30px; 
      margin: .5pc 1pc; border-radius: .5pc; color: white; text-decoration: none;">

      Verify your Email

    </a>

  </div>

  `

}


export const exitMail = (siteName: string, url: string) => {

  return `

    <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.5rem;">

      <div>

        <h1 style="margin: 0; padding: .5rem 1rem; padding-bottom: .5rem; font-family: inherit; color: #727272; line-height: 3rem;">

          ${siteName} says her goodbyes

        </h1>

      </div>

      <p style="margin: 0; padding: 0 1rem; font-family: inherit; color: #727272;">
        We're sad to see you leave, kindly click the button below to lodge any complaints
        or to offer advice to the admin.
      </p>

      <a href="${url}"
        target="_blank" rel="noopener noreferrer" style="background: #3c73e9; display: inline-block; padding: 10px 30px; 
        margin: .5rem 1rem; border-radius: .5rem; color: white; text-decoration: none;">

        Complain

      </a>

    </div>

  `

}


export const checkoutMail = (siteName: string, complain: string, itemsData: any, stripe: boolean, receipt: string) => {

  return `

  <div style="font-family: Arial, Helvetica, sans-serif; line-height: 2pc; position: relative;">

    <div>

      <h1
        style="margin: 0; padding: .5pc 1pc; padding-bottom: .5pc; font-family: inherit; color: #727272; font-size: 2pc; line-height: 3pc;">

        Congratulations ✨✨✨

      </h1>

    </div>

    <p style="margin: 0; padding: 0 1pc; font-family: inherit; color: #727272;">

      &nbsp; &nbsp; &nbsp; Congratulations on your purchase at ${siteName}, we got notified about your recent purchase
      of the following items

    </p>

    <ul style="margin: 0; padding: 1pc 1pc 1pc 3pc; font-family: inherit; color: #727272;">

      ${itemsData.map((item: any) => `<li>${item.name}</li>`).reduce((tot: any, si: any) => tot + si)}

    </ul>

    <p style="margin: 0; padding: 0 1pc; font-family: inherit; color: #727272;">

      We hope you found the items to your liking, if you didn't, kindly <a href="${complain}">complain here.</a>

      <br>

      ${stripe ? `Your receipt is available <a href="${receipt}"> here.</a>` : ""}

    </p>

  </div>

    `

}

