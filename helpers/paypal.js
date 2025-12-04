import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

function client() {
    return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

function environment() {
    let clientId = process.env.PAYPAL_CLIENT_ID;
    let clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
    // Use LiveEnvironment for production
}

export default { client };
