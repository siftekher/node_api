import AWS from "aws-sdk";
import Amplify, { Auth } from 'aws-amplify';

AWS.config.update({ region: "ap-southeast-1" });
Amplify.configure({
  Auth: {

    // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
    identityPoolId: 'ap-southeast-1:8dceb23e-c2dc-406f-b488-1a90db490fbd',
    
    // REQUIRED - Amazon Cognito Region
    region: 'ap-southeast-1',

    // OPTIONAL - Amazon Cognito Federated Identity Pool Region 
    // Required only if it's different from Amazon Cognito Region
    identityPoolRegion: 'ap-southeast-1',

    // OPTIONAL - Amazon Cognito User Pool ID
    userPoolId: 'ap-southeast-1_OArPLfWwE',

    // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
    userPoolWebClientId: '7gcj7iccec9t32kqqca5uk45p',

    // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
    // mandatorySignIn: false,

    // OPTIONAL - Configuration for cookie storage
    // cookieStorage: {
    // REQUIRED - Cookie domain (only required if cookieStorage is provided)
        // domain: '.yourdomain.com',
    // OPTIONAL - Cookie path
        // path: '/',
    // OPTIONAL - Cookie expiration in days
        // expires: 365,
    // OPTIONAL - Cookie secure flag
        // secure: true
    // },

    // OPTIONAL - customized storage object
    // storage: new MyStorage(),
    
    // OPTIONAL - Manually set the authentication flow type. Default is 'USER_SRP_AUTH'
    // authenticationFlowType: 'USER_PASSWORD_AUTH'
}
});

module.exports = Amplify;
module.exports = AWS;

